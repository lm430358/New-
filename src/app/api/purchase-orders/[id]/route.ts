import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } }, vendor: true, businessProfile: true },
  });
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ purchaseOrder: po });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("status" in body) data.status = body.status;
  if ("notes" in body) data.notes = body.notes || null;
  if ("shippingCost" in body) data.shippingCost = Number(body.shippingCost) || 0;
  if ("taxRate" in body) data.taxRate = Number(body.taxRate) || 0;
  if ("vendorId" in body) data.vendorId = body.vendorId || null;

  const po = await prisma.purchaseOrder.update({ where: { id }, data, include: { lineItems: true, vendor: true } });
  return NextResponse.json({ purchaseOrder: po });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.purchaseOrder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
