import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext, getActiveBusinessProfile } from "@/lib/business";
import { runAssistantTurn } from "@/lib/ai/assistant";
import { aiErrorResponse } from "@/lib/ai/errors";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ conversations });
}

const bodySchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { conversationId, message } = parsed.data;

  const profile = await getActiveBusinessProfile();
  const ctx = await getActiveBusinessContext();

  const existing = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId }, include: { messages: { orderBy: { createdAt: "asc" } } } })
    : null;

  const history: Anthropic.MessageParam[] = (existing?.messages ?? []).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  try {
    const { reply, toolOutputs } = await runAssistantTurn(ctx, history, message);

    // Create the conversation only once a turn succeeds, so failed first messages don't
    // leave empty conversations behind.
    const conversation =
      existing ??
      (await prisma.conversation.create({
        data: { businessProfileId: profile?.id, title: message.slice(0, 60) },
      }));

    // History is read back ordered by createdAt, so the pair needs distinct timestamps.
    const now = Date.now();
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: "user", content: message, createdAt: new Date(now) },
        {
          conversationId: conversation.id,
          role: "assistant",
          createdAt: new Date(now + 1),
          content: reply,
          toolOutputs: toolOutputs.length > 0 ? JSON.stringify(toolOutputs) : null,
        },
      ],
    });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    return NextResponse.json({ conversationId: conversation.id, reply, toolOutputs });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
