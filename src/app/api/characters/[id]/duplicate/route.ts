import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCharacterDTO, characterRelationsInclude } from "@/lib/characters/serialize";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const original = await prisma.character.findUnique({
    where: { id },
    include: { referenceImages: true, outfits: true },
  });
  if (!original) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const copy = await prisma.character.create({
    data: {
      name: `${original.name} (Copy)`,
      style: original.style,
      species: original.species,
      age: original.age,
      gender: original.gender,
      occupation: original.occupation,
      personalityTraits: original.personalityTraits,
      personalitySummary: original.personalitySummary,
      background: original.background,
      voiceDescription: original.voiceDescription,
      physicalDescription: original.physicalDescription,
      faceDescriptor: original.faceDescriptor,
      defaultOutfitDescription: original.defaultOutfitDescription,
      seed: original.seed,
      negativePrompt: original.negativePrompt,
      identityLockMode: original.identityLockMode,
      sourceDescription: original.sourceDescription,
      referenceImages: {
        create: original.referenceImages.map((img) => ({
          url: img.url,
          kind: img.kind,
          angle: img.angle,
          isPrimary: img.isPrimary,
        })),
      },
      outfits: {
        create: original.outfits.map((o) => ({
          name: o.name,
          description: o.description,
          imageUrl: o.imageUrl,
        })),
      },
    },
    include: characterRelationsInclude,
  });

  return NextResponse.json({ character: toCharacterDTO(copy) }, { status: 201 });
}
