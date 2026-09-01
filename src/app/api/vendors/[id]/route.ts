import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJson } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      priceChecks: { orderBy: { checkedAt: "desc" } },
      crossReferences: true,
      contactMessages: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vendor });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  const stringFields = [
    "name",
    "vendorType",
    "supplyKind",
    "website",
    "phone",
    "email",
    "street",
    "city",
    "state",
    "zip",
    "shippingInfo",
    "minimumOrder",
    "wholesaleRequirements",
    "accountRequirements",
    "returnPolicy",
    "warrantyInfo",
    "hoursInfo",
    "wholesaleStatus",
    "verificationNotes",
    "status",
    "notes",
  ];
  for (const f of stringFields) {
    if (f in body) data[f] = body[f] || null;
  }
  if ("localVerified" in body) data.localVerified = !!body.localVerified;
  if ("favorite" in body) data.favorite = !!body.favorite;
  if ("internalRating" in body) data.internalRating = body.internalRating ? Number(body.internalRating) : null;
  if ("partsCategories" in body) data.partsCategories = toJson(body.partsCategories);
  if ("verificationDate" in body) data.verificationDate = body.verificationDate ? new Date(body.verificationDate) : null;
  if ("trustFlags" in body) data.trustFlags = toJson(body.trustFlags);

  const vendor = await prisma.vendor.update({ where: { id }, data });
  return NextResponse.json({ vendor });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
