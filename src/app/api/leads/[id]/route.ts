import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PIPELINE_STAGES } from "@/lib/content/workflow";

const VALID_STAGE_IDS = new Set(PIPELINE_STAGES.map((s) => s.id));
const VALID_CLOSED_STATUSES = new Set(["open", "won", "lost"]);

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
  "leadScore",
  "scoreReasoning",
  "problemsFound",
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

  if ("stage" in body && !VALID_STAGE_IDS.has(body.stage)) {
    return NextResponse.json(
      { error: `Invalid stage "${body.stage}". Must be one of: ${[...VALID_STAGE_IDS].join(", ")}` },
      { status: 400 }
    );
  }
  if ("closedStatus" in body && !VALID_CLOSED_STATUSES.has(body.closedStatus)) {
    return NextResponse.json(
      { error: `Invalid closedStatus "${body.closedStatus}". Must be one of: open, won, lost` },
      { status: 400 }
    );
  }
  if ("leadScore" in body && body.leadScore !== null) {
    const n = Number(body.leadScore);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return NextResponse.json({ error: "leadScore must be an integer between 1 and 100, or null" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      const v = body[key];
      if (["lastContact", "nextFollowUp", "appointment"].includes(key)) {
        data[key] = v ? new Date(v) : null;
      } else if (["potentialDealSize", "estimatedValue"].includes(key)) {
        data[key] = v === "" || v === null ? null : Number(v);
      } else if (key === "leadScore") {
        data[key] = v === null ? null : Number(v);
      } else if (key === "problemsFound") {
        data[key] = Array.isArray(v) ? JSON.stringify(v) : v;
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
