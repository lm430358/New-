import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFullAuditReport } from "@/lib/ai/generators";
import { AiGenerationError } from "@/lib/ai/generate";

const REQUIRED = ["businessName", "industry"] as const;

export async function POST(req: NextRequest) {
  const body = await req.json();
  for (const key of REQUIRED) {
    if (!body[key]) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
  }

  const intake = {
    businessName: body.businessName,
    industry: body.industry,
    goals: body.goals || "not provided",
    currentMarketing: body.currentMarketing || "not provided",
    competitors: body.competitors || "not provided",
    onlineVisibility: body.onlineVisibility || "not provided",
    website: body.website || "not provided",
    socialMedia: body.socialMedia || "not provided",
    googlePresence: body.googlePresence || "not provided",
    customerAcquisition: body.customerAcquisition || "not provided",
    pricing: body.pricing || "not provided",
    offer: body.offer || "not provided",
    branding: body.branding || "not provided",
    conversionProblems: body.conversionProblems || "not provided",
  };

  try {
    const result = await generateFullAuditReport(intake);
    const report = await prisma.auditReport.create({
      data: {
        leadId: body.leadId || null,
        kind: "full_audit",
        businessName: intake.businessName,
        intake: JSON.stringify(intake),
        report: JSON.stringify(result),
      },
    });
    return NextResponse.json({ report, result });
  } catch (err) {
    if (err instanceof AiGenerationError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error(err);
    return NextResponse.json({ error: "Report generation failed. Check ANTHROPIC_API_KEY is set." }, { status: 502 });
  }
}

export async function GET() {
  const reports = await prisma.auditReport.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ reports });
}
