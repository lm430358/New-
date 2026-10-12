import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCharacterSchema } from "@/lib/characters/validation";
import { toCharacterDTO, characterRelationsInclude } from "@/lib/characters/serialize";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id },
    include: characterRelationsInclude,
  });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });
  return NextResponse.json({ character: toCharacterDTO(character) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateCharacterSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const existing = await prisma.character.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const character = await prisma.character.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.age !== undefined ? { age: data.age } : {}),
      ...(data.gender !== undefined ? { gender: data.gender } : {}),
      ...(data.occupation !== undefined ? { occupation: data.occupation } : {}),
      ...(data.physicalDescription !== undefined ? { physicalDescription: data.physicalDescription } : {}),
      ...(data.faceDescriptor !== undefined ? { faceDescriptor: data.faceDescriptor } : {}),
      ...(data.defaultOutfitDescription !== undefined
        ? { defaultOutfitDescription: data.defaultOutfitDescription }
        : {}),
      ...(data.personalityTraits !== undefined
        ? { personalityTraits: JSON.stringify(data.personalityTraits) }
        : {}),
      ...(data.personalitySummary !== undefined ? { personalitySummary: data.personalitySummary } : {}),
      ...(data.background !== undefined ? { background: data.background } : {}),
      ...(data.voiceDescription !== undefined ? { voiceDescription: data.voiceDescription } : {}),
      ...(data.negativePrompt !== undefined ? { negativePrompt: data.negativePrompt } : {}),
      ...(data.identityLockMode !== undefined ? { identityLockMode: data.identityLockMode } : {}),
    },
    include: characterRelationsInclude,
  });

  return NextResponse.json({ character: toCharacterDTO(character) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.character.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Character not found" }, { status: 404 });
  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
