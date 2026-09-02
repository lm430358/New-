import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessProfile } from "@/lib/business";
import { draftVendorMessage, type ContactPurpose } from "@/lib/ai/generators/vendorContact";
import { describeAiError } from "@/lib/ai/errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  const profile = await getActiveBusinessProfile();
  const purpose = (body.purpose as ContactPurpose) || "general";

  try {
    const draft = await draftVendorMessage(vendor, purpose, profile, body.extraContext);
    const saved = await prisma.vendorContactMessage.create({
      data: { vendorId: vendor.id, purpose, subject: draft.subject, body: draft.body },
    });
    return NextResponse.json({ message: saved });
  } catch (err) {
    return NextResponse.json({ error: describeAiError(err) }, { status: 502 });
  }
}
