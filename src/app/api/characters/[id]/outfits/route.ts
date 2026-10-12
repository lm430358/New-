import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOutfitSchema } from "@/lib/characters/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = createOutfitSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const outfit = await prisma.characterOutfit.create({
    data: { characterId: id, name: parsed.data.name, description: parsed.data.description },
  });
  return NextResponse.json({ outfit }, { status: 201 });
}
