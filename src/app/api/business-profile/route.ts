import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile, setActiveBusinessProfile } from "@/lib/business";
import { toJson } from "@/lib/utils";

export async function GET() {
  const profile = await getActiveBusinessProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const data = {
    businessName: String(body.businessName ?? "").trim(),
    businessType: body.businessType || null,
    city: body.city || null,
    state: body.state || null,
    industry: body.industry || null,
    isRepairShop: !!body.isRepairShop,
    isMobileMechanic: !!body.isMobileMechanic,
    resellsParts: !!body.resellsParts,
    operatesFleet: !!body.operatesFleet,
    isDealership: !!body.isDealership,
    monthlyPartsBudget: body.monthlyPartsBudget != null && body.monthlyPartsBudget !== "" ? Number(body.monthlyPartsBudget) : null,
    preferredSuppliers: toJson(body.preferredSuppliers ?? []),
    preferredBrands: toJson(body.preferredBrands ?? []),
    conditionPref: body.conditionPref || "either",
    sourcingPref: body.sourcingPref || "either",
  };

  if (!data.businessName) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }

  let profile;
  if (body.id) {
    profile = await prisma.businessProfile.update({ where: { id: body.id }, data });
  } else {
    profile = await prisma.businessProfile.create({ data });
    await setActiveBusinessProfile(profile.id);
  }

  return NextResponse.json({ profile });
}
