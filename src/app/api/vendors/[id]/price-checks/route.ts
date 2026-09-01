import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (!body.partDescription) {
    return NextResponse.json({ error: "Part description is required." }, { status: 400 });
  }
  const price = body.price != null && body.price !== "" ? Number(body.price) : null;
  const shippingCost = body.shippingCost != null && body.shippingCost !== "" ? Number(body.shippingCost) : null;
  const totalCost = price != null ? price + (shippingCost ?? 0) : null;

  const priceCheck = await prisma.priceCheck.create({
    data: {
      vendorId: id,
      partDescription: body.partDescription,
      partNumber: body.partNumber || null,
      brand: body.brand || null,
      condition: body.condition || null,
      price,
      shippingCost,
      totalCost,
      availability: body.availability || null,
      warranty: body.warranty || null,
      returnPolicy: body.returnPolicy || null,
      sourceUrl: body.sourceUrl || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json({ priceCheck });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const priceChecks = await prisma.priceCheck.findMany({ where: { vendorId: id }, orderBy: { checkedAt: "desc" } });
  return NextResponse.json({ priceChecks });
}
