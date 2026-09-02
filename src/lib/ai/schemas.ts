import { z } from "zod";

// ---------------------------------------------------------------------------
// Phase 3: lead research & scoring
// ---------------------------------------------------------------------------

export const LeadScoreSchema = z.object({
  leadScore: z.number().min(1).max(100).describe(
    "1-100. Weight: painful/visible problem, ability to pay, likely deal size, ease of reaching the decision maker."
  ),
  scoreReasoning: z.string().describe("2-4 sentences: why this score, grounded only in the provided notes."),
  problemsFound: z
    .array(z.string())
    .describe("Concrete weaknesses found ONLY in the provided research notes — never invented."),
  opportunity: z.string().describe("The single strongest angle to open a conversation with, in one sentence."),
  offerRecommended: z.string().describe("Which offer tier fits this lead best and why, one sentence."),
  potentialDealSize: z.number().describe("Realistic dollar estimate of the first deal."),
  personalizationHook: z
    .string()
    .describe("One specific, true, non-generic detail from the notes to reference in outreach."),
});
export type LeadScoreResult = z.infer<typeof LeadScoreSchema>;

// ---------------------------------------------------------------------------
// Phase 5: outreach message generation
// ---------------------------------------------------------------------------

export const OutreachMessageSchema = z.object({
  subject: z.string().nullable().describe("Email subject line, or null for DM/SMS channels."),
  content: z.string().describe("The full message body, natural and specific, no fake scarcity or fake claims."),
});
export type OutreachMessageResult = z.infer<typeof OutreachMessageSchema>;

// ---------------------------------------------------------------------------
// Phase 3.11 / Phase 7: mini-audit (pre-sale, short) and full audit (paid deliverable)
// ---------------------------------------------------------------------------

export const MiniAuditSchema = z.object({
  headline: z.string().describe("One-line summary of the biggest opportunity."),
  strengths: z.array(z.string()).describe("1-3 genuine strengths, grounded in the notes."),
  gaps: z.array(z.string()).describe("2-4 specific, concrete gaps costing them bookings."),
  quickWins: z.array(z.string()).describe("2-3 things they could fix this week, free or nearly free."),
  biggestOpportunity: z.string().describe("The one thing worth paying to fix first, and roughly why it matters."),
  callToAction: z.string().describe("A soft, non-pushy next step, e.g. inviting a short call."),
});
export type MiniAuditResult = z.infer<typeof MiniAuditSchema>;

export const FullAuditReportSchema = z.object({
  executiveSummary: z.string(),
  currentSituation: z.string(),
  majorProblems: z.array(z.string()),
  missedRevenueOpportunities: z.array(z.string()),
  competitorFindings: z.array(z.string()).describe("Grounded only in competitor info given in the intake."),
  priorityRecommendations: z.array(z.string()),
  plan30Day: z.array(z.string()),
  plan60Day: z.array(z.string()),
  plan90Day: z.array(z.string()),
  recommendedMarketingChannels: z.array(z.string()),
  contentStrategy: z.string(),
  customerAcquisitionStrategy: z.string(),
  estimatedPriorities: z.array(
    z.object({ item: z.string(), impact: z.enum(["high", "medium", "low"]), effort: z.enum(["high", "medium", "low"]) })
  ),
  kpis: z.array(z.string()),
  nextActions: z.array(z.string()),
});
export type FullAuditReportResult = z.infer<typeof FullAuditReportSchema>;
