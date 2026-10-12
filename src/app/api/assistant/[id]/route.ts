import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AssistantToolOutput } from "@/lib/ai/assistant";

export async function GET(_req: Request, ctx: RouteContext<"/api/assistant/[id]">) {
  const { id } = await ctx.params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = conversation.messages.map((m) => ({ ...m, toolOutputs: parseToolOutputs(m.toolOutputs) }));
  return NextResponse.json({ conversation: { ...conversation, messages } });
}

function parseToolOutputs(json: string | null): AssistantToolOutput[] | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as AssistantToolOutput[];
  } catch {
    return undefined;
  }
}
