import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";

export async function GET() {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: { vendor: { select: { id: true, name: true } }, lineItems: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ purchaseOrders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const profile = await getActiveBusinessProfile();
  const lineItems = (body.lineItems as Array<Record<string, unknown>>) ?? [];

  if (!body.poNumber) {
    return NextResponse.json({ error: "PO number is required." }, { status: 400 });
  }

  const po = await prisma.purchaseOrder.create({
    data: {
      businessProfileId: profile?.id,
      vendorId: body.vendorId || null,
      poNumber: String(body.poNumber),
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "draft",
      shippingCost: Number(body.shippingCost) || 0,
      taxRate: Number(body.taxRate) || 0,
      notes: body.notes || null,
      lineItems: {
        create: lineItems.map((li, idx) => ({
          partNumber: (li.partNumber as string) || null,
          description: String(li.description ?? ""),
          quantity: Number(li.quantity) || 1,
          unitPrice: Number(li.unitPrice) || 0,
          sortOrder: idx,
        })),
      },
    },
    include: { lineItems: true, vendor: true },
  });
  return NextResponse.json({ purchaseOrder: po });
}
