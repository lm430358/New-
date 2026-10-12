import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageProvider } from "@/lib/image";
import { generateCharacterProfile } from "@/lib/ai/characters/profile";
import { createCharacterSchema } from "@/lib/characters/validation";
import { toCharacterDTO, characterRelationsInclude } from "@/lib/characters/serialize";

export async function GET() {
  const characters = await prisma.character.findMany({
    include: characterRelationsInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ characters: characters.map(toCharacterDTO) });
}

export async function POST(request: Request) {
  const parsed = createCharacterSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  let profile;
  try {
    profile = await generateCharacterProfile(input);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  const character = await prisma.character.create({
    data: {
      name: input.name?.trim() || profile.suggestedName,
      style: input.style,
      species: input.species || "human",
      age: profile.age,
      gender: profile.gender,
      occupation: profile.occupation,
      personalityTraits: JSON.stringify(profile.personalityTraits),
      personalitySummary: profile.personalitySummary,
      background: profile.background,
      voiceDescription: profile.voiceDescription,
      physicalDescription: profile.physicalDescription,
      faceDescriptor: profile.faceDescriptor,
      defaultOutfitDescription: profile.defaultOutfitDescription,
      negativePrompt: profile.negativePrompt,
      sourceDescription: input.description,
    },
  });

  // Generate the initial character sheet (reference image). This is the
  // real identity anchor — if it fails (e.g. no image provider configured)
  // the character is still saved with its full structured profile, so text
  // memory never silently disappears because the image step failed.
  let warning: string | undefined;
  try {
    const provider = getImageProvider();
    const { imageUrl } = await provider.generateImage({
      prompt: profile.characterSheetPrompt,
      negativePrompt: profile.negativePrompt,
      width: 1024,
      height: 1024,
    });
    await prisma.characterReferenceImage.create({
      data: {
        characterId: character.id,
        url: imageUrl,
        kind: "generated_sheet",
        angle: "front",
        isPrimary: true,
      },
    });
  } catch (err) {
    warning = `Character profile saved, but the reference image could not be generated: ${(err as Error).message}`;
  }

  const full = await prisma.character.findUniqueOrThrow({
    where: { id: character.id },
    include: characterRelationsInclude,
  });

  return NextResponse.json({ character: toCharacterDTO(full), warning }, { status: 201 });
}
