import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.businessName || !body.industry) {
    return NextResponse.json({ error: "businessName and industry are required" }, { status: 400 });
  }
  const lead = await prisma.lead.create({
    data: {
      businessName: body.businessName,
      ownerName: body.ownerName || null,
      industry: body.industry,
      city: body.city || null,
      website: body.website || null,
      email: body.email || null,
      phone: body.phone || null,
      instagram: body.instagram || null,
      facebook: body.facebook || null,
      googleBusinessProfile: body.googleBusinessProfile || null,
      leadSource: body.leadSource || null,
      researchNotes: body.researchNotes || null,
    },
  });
  return NextResponse.json({ lead }, { status: 201 });
}
