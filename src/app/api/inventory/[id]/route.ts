import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  const numeric = ["quantity", "purchaseCost", "sellingPrice", "reorderLevel"];
  const strings = ["partNumber", "description", "brand", "storageLocation", "vendorId"];
  for (const f of numeric) if (f in body) data[f] = body[f] === "" || body[f] == null ? null : Number(body[f]);
  for (const f of strings) if (f in body) data[f] = body[f] || null;
  if ("datePurchased" in body) data.datePurchased = body.datePurchased ? new Date(body.datePurchased) : null;

  const item = await prisma.inventoryItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
