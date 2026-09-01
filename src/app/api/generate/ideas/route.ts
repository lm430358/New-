import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessContext } from "@/lib/business";
import { generateContentIdeas } from "@/lib/ai/generators";

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
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
