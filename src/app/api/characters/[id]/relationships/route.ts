import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRelationshipSchema } from "@/lib/characters/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = createRelationshipSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { toCharacterId, relationshipType, description } = parsed.data;

  if (toCharacterId === id) {
    return NextResponse.json({ error: "A character cannot have a relationship with itself" }, { status: 400 });
  }

  const [from, to] = await Promise.all([
    prisma.character.findUnique({ where: { id } }),
    prisma.character.findUnique({ where: { id: toCharacterId } }),
  ]);
  if (!from || !to) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const relationship = await prisma.characterRelationship.upsert({
    where: { fromCharacterId_toCharacterId: { fromCharacterId: id, toCharacterId } },
    create: { fromCharacterId: id, toCharacterId, relationshipType, description },
    update: { relationshipType, description },
  });

  return NextResponse.json({ relationship }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { relationshipId } = await request.json();
  const relationship = await prisma.characterRelationship.findUnique({ where: { id: relationshipId } });
  if (!relationship || (relationship.fromCharacterId !== id && relationship.toCharacterId !== id)) {
    return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
  }
  await prisma.characterRelationship.delete({ where: { id: relationshipId } });
  return NextResponse.json({ ok: true });
}
