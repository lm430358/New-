import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";

export async function GET() {
  const items = await prisma.inventoryItem.findMany({
    include: { vendor: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }
  const profile = await getActiveBusinessProfile();
  const item = await prisma.inventoryItem.create({
    data: {
      businessProfileId: profile?.id,
      vendorId: body.vendorId || null,
      partNumber: body.partNumber || null,
      description: body.description,
      brand: body.brand || null,
      quantity: Number(body.quantity) || 0,
      purchaseCost: body.purchaseCost != null && body.purchaseCost !== "" ? Number(body.purchaseCost) : null,
      sellingPrice: body.sellingPrice != null && body.sellingPrice !== "" ? Number(body.sellingPrice) : null,
      storageLocation: body.storageLocation || null,
      datePurchased: body.datePurchased ? new Date(body.datePurchased) : null,
      reorderLevel: Number(body.reorderLevel) || 0,
    },
  });
  return NextResponse.json({ item });
}
