import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAssistantTurn, messagesToHistory } from "@/lib/ai/assistant";
import { describeAiError } from "@/lib/ai/errors";
import { toJson } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content } = await req.json();
  if (!content || !String(content).trim()) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  await prisma.message.create({ data: { conversationId: id, role: "user", content } });

  const history = messagesToHistory([...conversation.messages, { role: "user", content }]);
  let reply: string;
  let toolTrace: Awaited<ReturnType<typeof runAssistantTurn>>["toolTrace"];
  try {
    ({ reply, toolTrace } = await runAssistantTurn(history));
  } catch (err) {
    return NextResponse.json({ error: describeAiError(err) }, { status: 502 });
  }

  const assistantMessage = await prisma.message.create({
    data: { conversationId: id, role: "assistant", content: reply, toolCalls: toJson(toolTrace) },
  });

  await prisma.conversation.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      title: conversation.title === "New conversation" ? String(content).slice(0, 60) : undefined,
    },
  });

  return NextResponse.json({ message: assistantMessage, toolTrace });
}
