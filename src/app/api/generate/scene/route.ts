import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageProvider } from "@/lib/image";
import { compileScenePrompt } from "@/lib/ai/characters/promptBuilder";
import { generateSceneSchema } from "@/lib/characters/validation";

export async function POST(request: Request) {
  const parsed = generateSceneSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const characterIds = input.characters.map((c) => c.characterId);
  const characters = await prisma.character.findMany({
    where: { id: { in: characterIds } },
    include: { referenceImages: true },
  });
  if (characters.length !== characterIds.length) {
    return NextResponse.json({ error: "One or more characters were not found" }, { status: 404 });
  }

  const relationships = await prisma.characterRelationship.findMany({
    where: {
      fromCharacterId: { in: characterIds },
      toCharacterId: { in: characterIds },
    },
    include: { fromCharacter: true, toCharacter: true },
  });
  const relationshipNotes = relationships.map(
    (r) => `${r.fromCharacter.name} is ${r.toCharacter.name}'s ${r.relationshipType}${r.description ? ` — ${r.description}` : ""}.`
  );

  const sceneCharacters = input.characters.map((sc) => ({
    character: characters.find((c) => c.id === sc.characterId)!,
    outfitDescription: sc.outfitDescription,
  }));

  let compiled;
  try {
    compiled = await compileScenePrompt(
      sceneCharacters,
      {
        environment: input.environment,
        pose: input.pose,
        expression: input.expression,
        cameraAngle: input.cameraAngle,
        lighting: input.lighting,
        additionalDetails: input.additionalDetails,
      },
      relationshipNotes
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  const isSingleCharacter = characters.length === 1;
  const primaryReference = isSingleCharacter
    ? characters[0].referenceImages.find((r) => r.isPrimary)?.url ?? characters[0].referenceImages[0]?.url
    : undefined;

  const note = !isSingleCharacter
    ? "Multi-character scenes currently rely on detailed per-character text descriptions rather than per-face visual identity-lock, which this image model only supports for one face at a time. For strongest multi-character consistency, generate each character in the scene separately via per-character LoRAs (see CHARACTERS.md), or review and re-roll if faces drift."
    : primaryReference
      ? undefined
      : "This character has no reference image yet, so this scene was generated from its text description only — consistency will be weaker than for characters with a saved reference image.";

  let result;
  try {
    const provider = getImageProvider();
    result = primaryReference
      ? await provider.generateConsistentImage({
          prompt: compiled.compiledPrompt,
          negativePrompt: compiled.negativePrompt,
          referenceImageUrls: [primaryReference],
          width: input.width ?? 1024,
          height: input.height ?? 1024,
        })
      : await provider.generateImage({
          prompt: compiled.compiledPrompt,
          negativePrompt: compiled.negativePrompt,
          width: input.width ?? 1024,
          height: input.height ?? 1024,
        });
  } catch (err) {
    const generation = await prisma.generation.create({
      data: {
        type: "scene",
        prompt: compiled.compiledPrompt,
        negativePrompt: compiled.negativePrompt,
        provider: process.env.IMAGE_PROVIDER || "replicate",
        model: "unknown",
        status: "failed",
        errorMessage: (err as Error).message,
        sceneParams: JSON.stringify(input),
        characters: { create: characterIds.map((cid) => ({ characterId: cid })) },
      },
    });
    return NextResponse.json(
      { error: (err as Error).message, generationId: generation.id },
      { status: 502 }
    );
  }

  const generation = await prisma.generation.create({
    data: {
      type: "scene",
      prompt: compiled.compiledPrompt,
      negativePrompt: compiled.negativePrompt,
      provider: process.env.IMAGE_PROVIDER || "replicate",
      model: result.model,
      status: "completed",
      imageUrl: result.imageUrl,
      sceneParams: JSON.stringify(input),
      characters: { create: characterIds.map((cid) => ({ characterId: cid })) },
    },
    include: { characters: { include: { character: true } } },
  });

  return NextResponse.json({ generation, note }, { status: 201 });
}
