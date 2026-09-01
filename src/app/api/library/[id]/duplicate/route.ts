import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: RouteContext<"/api/library/[id]/duplicate">) {
  const { id } = await ctx.params;
  const original = await prisma.contentItem.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy = await prisma.contentItem.create({
    data: {
      businessProfileId: original.businessProfileId,
      type: original.type,
      platform: original.platform,
      title: `${original.title} (copy)`,
      body: original.body,
      imagePrompt: original.imagePrompt,
      qualityScore: original.qualityScore,
      qualityFeedback: original.qualityFeedback,
      tags: original.tags,
      pillar: original.pillar,
      sourceTool: original.sourceTool,
      favorite: false,
    },
  });
  return NextResponse.json({ item: copy });
}
