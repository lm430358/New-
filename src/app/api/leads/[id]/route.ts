import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { outreachMessages: { orderBy: { createdAt: "desc" } }, auditReports: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

const ALLOWED_FIELDS = [
  "businessName",
  "ownerName",
  "industry",
  "city",
  "website",
  "email",
  "phone",
  "instagram",
  "facebook",
  "googleBusinessProfile",
  "leadSource",
  "researchNotes",
  "personalizationHook",
  "opportunity",
  "offerRecommended",
  "potentialDealSize",
  "estimatedValue",
  "stage",
  "outreachStatus",
  "lastContact",
  "nextFollowUp",
  "response",
  "appointment",
  "closedStatus",
  "notes",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      const v = body[key];
      if (["lastContact", "nextFollowUp", "appointment"].includes(key)) {
        data[key] = v ? new Date(v) : null;
      } else if (["potentialDealSize", "estimatedValue"].includes(key)) {
        data[key] = v === "" || v === null ? null : Number(v);
      } else {
        data[key] = v;
      }
    }
  }
  const lead = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json({ lead });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
