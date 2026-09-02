import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMiniAudit } from "@/lib/ai/generators";
import { AiGenerationError } from "@/lib/ai/generate";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!lead.researchNotes || lead.researchNotes.trim().length < 20) {
    return NextResponse.json({ error: "Add real research notes first." }, { status: 400 });
  }

  try {
    const result = await generateMiniAudit({
      businessName: lead.businessName,
      industry: lead.industry,
      researchNotes: lead.researchNotes,
    });

    const report = await prisma.auditReport.create({
      data: {
        leadId: id,
        kind: "mini_audit",
        businessName: lead.businessName,
        intake: JSON.stringify({ researchNotes: lead.researchNotes }),
        report: JSON.stringify(result),
      },
    });

    return NextResponse.json({ report, result });
  } catch (err) {
    if (err instanceof AiGenerationError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error(err);
    return NextResponse.json({ error: "Mini-audit generation failed. Check ANTHROPIC_API_KEY is set." }, { status: 502 });
  }
}
