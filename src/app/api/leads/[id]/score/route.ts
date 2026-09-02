import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/ai/generators";
import { AiGenerationError } from "@/lib/ai/generate";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!lead.researchNotes || lead.researchNotes.trim().length < 20) {
    return NextResponse.json(
      { error: "Add real research notes first — at least a couple sentences about what you actually observed." },
      { status: 400 }
    );
  }

  try {
    const result = await scoreLead({
      businessName: lead.businessName,
      industry: lead.industry,
      city: lead.city,
      researchNotes: lead.researchNotes,
    });

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        leadScore: result.leadScore,
        scoreReasoning: result.scoreReasoning,
        problemsFound: JSON.stringify(result.problemsFound),
        opportunity: result.opportunity,
        offerRecommended: result.offerRecommended,
        potentialDealSize: result.potentialDealSize,
        personalizationHook: result.personalizationHook,
        stage: lead.stage === "new" ? "scored" : lead.stage,
      },
    });

    return NextResponse.json({ lead: updated });
  } catch (err) {
    if (err instanceof AiGenerationError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error(err);
    return NextResponse.json({ error: "Scoring failed. Check ANTHROPIC_API_KEY is set." }, { status: 502 });
  }
}
