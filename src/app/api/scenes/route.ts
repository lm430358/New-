import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const generations = await prisma.generation.findMany({
    where: { type: "scene" },
    include: { characters: { include: { character: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ generations });
}
