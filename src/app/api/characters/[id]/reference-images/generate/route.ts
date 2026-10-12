import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageProvider } from "@/lib/image";
import { buildCharacterSheetPrompt } from "@/lib/ai/characters/promptBuilder";
import { z } from "zod";

const bodySchema = z.object({
  angle: z.enum(["front", "three_quarter", "side", "closeup", "full_body"]).default("three_quarter"),
  setPrimary: z.boolean().optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const prompt = buildCharacterSheetPrompt(character, parsed.data.angle);

  try {
    const provider = getImageProvider();
    const { imageUrl } = await provider.generateImage({
      prompt,
      negativePrompt: character.negativePrompt ?? undefined,
      width: 1024,
      height: 1024,
    });

    if (parsed.data.setPrimary) {
      await prisma.characterReferenceImage.updateMany({ where: { characterId: id }, data: { isPrimary: false } });
    }

    const image = await prisma.characterReferenceImage.create({
      data: {
        characterId: id,
        url: imageUrl,
        kind: "generated_sheet",
        angle: parsed.data.angle,
        isPrimary: !!parsed.data.setPrimary,
      },
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
