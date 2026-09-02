import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOutreachMessage } from "@/lib/ai/generators";
import { AiGenerationError } from "@/lib/ai/generate";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { channel, stage } = await req.json();
  if (!channel || !stage) {
    return NextResponse.json({ error: "channel and stage are required" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const result = await generateOutreachMessage({
      channel,
      stage,
      businessName: lead.businessName,
      ownerName: lead.ownerName,
      industry: lead.industry,
      personalizationHook: lead.personalizationHook,
      opportunity: lead.opportunity,
      offerRecommended: lead.offerRecommended,
    });

    const message = await prisma.outreachMessage.create({
      data: {
        leadId: id,
        channel,
        stage,
        subject: result.subject,
        content: result.content,
        status: "draft",
      },
    });

    const task = await prisma.task.create({
      data: {
        leadId: id,
        type: "approve_outreach",
        title: `Approve ${stage.replace(/_/g, " ")} ${channel.replace(/_/g, " ")} message for ${lead.businessName}`,
        description: "AI-drafted outreach is ready. Review for accuracy and tone before it can be sent.",
      },
    });

    if (lead.stage === "scored" || lead.stage === "new") {
      await prisma.lead.update({ where: { id }, data: { stage: "awaiting_approval" } });
    }

    return NextResponse.json({ message, task });
  } catch (err) {
    if (err instanceof AiGenerationError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error(err);
    return NextResponse.json({ error: "Outreach generation failed. Check ANTHROPIC_API_KEY is set." }, { status: 502 });
  }
}
