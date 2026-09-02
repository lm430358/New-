import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VENDOR_REFERENCE_LIST } from "@/lib/vendorSeed";

export async function GET() {
  return NextResponse.json({ referenceList: VENDOR_REFERENCE_LIST });
}

/** Copies one reference-list entry into the user's own tracked Vendor database. */
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const ref = VENDOR_REFERENCE_LIST.find((r) => r.name === name);
  if (!ref) return NextResponse.json({ error: "Reference vendor not found." }, { status: 404 });

  const vendor = await prisma.vendor.create({
    data: {
      name: ref.name,
      vendorType: ref.vendorType,
      supplyKind: ref.supplyKind,
      website: ref.website || null,
      notes: `${ref.description} ${ref.notes}`.trim(),
      sourceType: "reference_list",
      wholesaleStatus: "unverified",
      status: "researching",
    },
  });
  return NextResponse.json({ vendor });
}
