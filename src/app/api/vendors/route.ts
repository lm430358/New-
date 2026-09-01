import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJson } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorType = searchParams.get("vendorType");
  const status = searchParams.get("status");
  const favoriteOnly = searchParams.get("favoriteOnly") === "1";
  const wholesaleOnly = searchParams.get("wholesaleOnly") === "1";
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};
  if (vendorType) where.vendorType = vendorType;
  if (status) where.status = status;
  if (favoriteOnly) where.favorite = true;
  if (wholesaleOnly) where.wholesaleStatus = "verified";
  if (city) where.city = { contains: city };
  if (state) where.state = { contains: state };
  if (q) {
    where.OR = [{ name: { contains: q } }, { notes: { contains: q } }];
  }

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
    include: { _count: { select: { priceChecks: true } } },
  });
  return NextResponse.json({ vendors });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Vendor name is required." }, { status: 400 });
  }
  const vendor = await prisma.vendor.create({
    data: {
      name: String(body.name).trim(),
      vendorType: body.vendorType || "unknown",
      supplyKind: body.supplyKind || null,
      website: body.website || null,
      phone: body.phone || null,
      email: body.email || null,
      street: body.street || null,
      city: body.city || null,
      state: body.state || null,
      zip: body.zip || null,
      partsCategories: toJson(body.partsCategories ?? []),
      shippingInfo: body.shippingInfo || null,
      minimumOrder: body.minimumOrder || null,
      wholesaleRequirements: body.wholesaleRequirements || null,
      accountRequirements: body.accountRequirements || null,
      returnPolicy: body.returnPolicy || null,
      warrantyInfo: body.warrantyInfo || null,
      hoursInfo: body.hoursInfo || null,
      wholesaleStatus: body.wholesaleStatus || "unverified",
      localVerified: !!body.localVerified,
      sourceType: body.sourceType || "user_added",
      verificationDate: body.verificationDate ? new Date(body.verificationDate) : null,
      verificationNotes: body.verificationNotes || null,
      status: body.status || "researching",
      favorite: !!body.favorite,
      internalRating: body.internalRating ? Number(body.internalRating) : null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json({ vendor });
}
