import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext } from "@/lib/business";
import { generateContentIdeas } from "@/lib/ai/generators";
import { aiErrorResponse } from "@/lib/ai/errors";

export async function POST() {
  const ctx = await getActiveBusinessContext();
  try {
    const recent = await prisma.contentItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { title: true },
    });
    const ideas = await generateContentIdeas(ctx, { recentTopics: recent.map((r) => r.title) });
    return NextResponse.json({ ideas });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
