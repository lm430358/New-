import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const favoriteOnly = searchParams.get("favorite") === "true";
  const search = searchParams.get("q") ?? undefined;

  const items = await prisma.contentItem.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(favoriteOnly ? { favorite: true } : {}),
      ...(search
        ? { title: { contains: search } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({ items });
}

const createSchema = z.object({
  type: z.string().min(1),
  platform: z.string().optional().nullable(),
  title: z.string().min(1),
  body: z.unknown(),
  imagePrompt: z.string().optional().nullable(),
  qualityScore: z.number().optional().nullable(),
  qualityFeedback: z.unknown().optional(),
  tags: z.array(z.string()).optional(),
  pillar: z.string().optional().nullable(),
  sourceTool: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const profile = await getActiveBusinessProfile();

  const item = await prisma.contentItem.create({
    data: {
      businessProfileId: profile?.id,
      type: data.type,
      platform: data.platform ?? null,
      title: data.title,
      body: JSON.stringify(data.body ?? null),
      imagePrompt: data.imagePrompt ?? null,
      qualityScore: data.qualityScore ?? null,
      qualityFeedback: data.qualityFeedback ? JSON.stringify(data.qualityFeedback) : null,
      tags: JSON.stringify(data.tags ?? []),
      pillar: data.pillar ?? null,
      sourceTool: data.sourceTool ?? null,
    },
  });
  return NextResponse.json({ item });
}
