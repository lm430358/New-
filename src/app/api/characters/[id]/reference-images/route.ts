import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadReferenceImageSchema } from "@/lib/characters/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = uploadReferenceImageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { url, angle, isPrimary } = parsed.data;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  if (isPrimary) {
    await prisma.characterReferenceImage.updateMany({ where: { characterId: id }, data: { isPrimary: false } });
  }

  const image = await prisma.characterReferenceImage.create({
    data: { characterId: id, url, angle, isPrimary: !!isPrimary, kind: "user_upload" },
  });
  return NextResponse.json({ image }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { imageId } = await request.json();
  const image = await prisma.characterReferenceImage.findUnique({ where: { id: imageId } });
  if (!image || image.characterId !== id) {
    return NextResponse.json({ error: "Reference image not found" }, { status: 404 });
  }
  await prisma.characterReferenceImage.delete({ where: { id: imageId } });
  return NextResponse.json({ ok: true });
}
