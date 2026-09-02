import { prisma } from "@/lib/prisma";
import { generateOutreachMessage } from "@/lib/ai/generators";
import { AiGenerationError } from "@/lib/ai/generate";
import { nextFollowupStage, furthestSentStage } from "./followupSequence";

export interface FollowUpRunResult {
  scanned: number;
  drafted: { leadId: string; businessName: string; stage: string }[];
  skipped: { leadId: string; businessName: string; reason: string }[];
  errors: { leadId: string; businessName: string; error: string }[];
}

/**
 * The "Follow Up" step of the Phase 6 workflow, AI-assisted: finds leads
 * whose nextFollowUp date has arrived, drafts the next message in the
 * initial -> followup_1 -> followup_2 -> followup_3 sequence, and queues it
 * as a pending approval Task. Never sends anything itself — approving and
 * marking a message sent (POST /api/outreach/[id]) is what schedules the
 * *next* one, via the same sequence logic.
 *
 * Safe to call repeatedly/concurrently: a lead is only drafted for once per
 * due date because a successful draft clears nextFollowUp immediately, and a
 * lead already carrying an un-actioned draft/approved message for its next
 * stage is skipped rather than double-drafted.
 */
export async function runFollowUpScheduler(): Promise<FollowUpRunResult> {
  const due = await prisma.lead.findMany({
    where: {
      closedStatus: "open",
      stage: "contacted",
      response: null,
      nextFollowUp: { lte: new Date() },
    },
    include: { outreachMessages: { orderBy: { createdAt: "desc" } } },
  });

  const result: FollowUpRunResult = { scanned: due.length, drafted: [], skipped: [], errors: [] };

  for (const lead of due) {
    const lastSent = furthestSentStage(lead.outreachMessages);
    if (!lastSent) {
      result.skipped.push({ leadId: lead.id, businessName: lead.businessName, reason: "No sent message found to sequence from" });
      continue;
    }

    const stage = nextFollowupStage(lastSent.stage);
    if (!stage) {
      // Sequence exhausted (followup_3 already sent) — stop auto-following-up.
      await prisma.lead.update({ where: { id: lead.id }, data: { nextFollowUp: null } });
      result.skipped.push({ leadId: lead.id, businessName: lead.businessName, reason: "Follow-up sequence complete — needs a manual reactivation decision" });
      continue;
    }

    const alreadyDrafted = lead.outreachMessages.some(
      (m) => m.stage === stage && m.channel === lastSent.channel && (m.status === "draft" || m.status === "approved")
    );
    if (alreadyDrafted) {
      result.skipped.push({ leadId: lead.id, businessName: lead.businessName, reason: `Already has an un-actioned ${stage} draft awaiting approval` });
      continue;
    }

    try {
      const generated = await generateOutreachMessage({
        channel: lastSent.channel,
        stage,
        businessName: lead.businessName,
        ownerName: lead.ownerName,
        industry: lead.industry,
        personalizationHook: lead.personalizationHook,
        opportunity: lead.opportunity,
        offerRecommended: lead.offerRecommended,
      });

      await prisma.outreachMessage.create({
        data: {
          leadId: lead.id,
          channel: lastSent.channel,
          stage,
          subject: generated.subject,
          content: generated.content,
          status: "draft",
        },
      });

      await prisma.task.create({
        data: {
          leadId: lead.id,
          type: "approve_outreach",
          title: `Approve ${stage.replace(/_/g, " ")} ${lastSent.channel.replace(/_/g, " ")} message for ${lead.businessName}`,
          description: "Auto-drafted by the follow-up scheduler (no response logged since last contact). Review before it can be sent.",
        },
      });

      // Clear nextFollowUp now — marking this draft sent (once approved) is
      // what schedules the one after it. Prevents redrafting on every tick.
      await prisma.lead.update({ where: { id: lead.id }, data: { nextFollowUp: null } });

      result.drafted.push({ leadId: lead.id, businessName: lead.businessName, stage });
    } catch (err) {
      const message = err instanceof AiGenerationError ? err.message : err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ leadId: lead.id, businessName: lead.businessName, error: message });
    }
  }

  return result;
}
