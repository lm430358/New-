import { generateStructured } from "./generate";
import {
  LeadScoreSchema,
  OutreachMessageSchema,
  MiniAuditSchema,
  FullAuditReportSchema,
  type LeadScoreResult,
  type OutreachMessageResult,
  type MiniAuditResult,
  type FullAuditReportResult,
} from "./schemas";

const GROUNDING_RULE =
  "Hard rule: only use facts explicitly present in the notes/answers given to you below. " +
  "Never invent a website detail, review count, competitor name, or statistic that wasn't given to you. " +
  "If something isn't known, say it's unknown or omit it rather than guessing. Never write fake " +
  "testimonials, fake scarcity/urgency, guaranteed-results claims, or impersonate anyone.";

const CONSULTANT_PERSONA =
  "You are a sharp, pragmatic small-business growth consultant working for Unlimited Industries " +
  "Business Consulting, a firm that helps local service business owners (mobile mechanics, cleaners, " +
  "handymen, beauty pros, DJs, photographers, pressure washers, landscapers, contractors, detailers, " +
  "food and event businesses) become visible, professional, and booked. Tone: direct, specific, no " +
  "fluff, no hype, no guaranteed-income claims. Every recommendation should be something a solo " +
  "operator with limited time and budget could realistically act on.";

// ---------------------------------------------------------------------------
// Phase 3: score a lead from raw research notes
// ---------------------------------------------------------------------------

export async function scoreLead(input: {
  businessName: string;
  industry: string;
  city?: string | null;
  researchNotes: string;
}): Promise<LeadScoreResult> {
  return generateStructured({
    system: `${CONSULTANT_PERSONA} Right now you are qualifying an inbound prospect list. ${GROUNDING_RULE}`,
    prompt: `Score this lead using ONLY the research notes below.

Business: ${input.businessName}
Industry: ${input.industry}
City: ${input.city ?? "unknown"}

Research notes (human-collected observations about their online presence, booking process, reviews, etc.):
"""
${input.researchNotes}
"""

Offer tiers to choose from when recommending one:
- $49-$199 digital product/template (self-serve, no consulting time)
- $199-$500 business audit (a written diagnostic + roadmap)
- $500-$1,000 strategy package (audit + short implementation plan)
- $1,500-$3,000 premium consulting package (hands-on build-out)`,
    schema: LeadScoreSchema,
    effort: "medium",
  });
}

// ---------------------------------------------------------------------------
// Phase 5: personalized outreach for one channel/stage
// ---------------------------------------------------------------------------

const CHANNEL_LABEL: Record<string, string> = {
  email: "email",
  instagram_dm: "Instagram DM",
  facebook: "Facebook message",
  sms: "SMS text",
};

const STAGE_BRIEF: Record<string, string> = {
  initial: "First contact. Warm, short, references one genuine observation, ends with a low-pressure question.",
  followup_1: "First follow-up (no response yet, ~3-4 days later). Add one new piece of value, don't be pushy.",
  followup_2: "Second follow-up (~1 week later). Shorter, a different angle, easy yes/no question.",
  followup_3: "Final follow-up (~2 weeks later). Graceful, gives them an easy out, leaves the door open.",
  interested_response: "They responded with interest. Move them toward booking a short call, make it easy.",
  appointment_confirm: "Confirm a booked appointment: time, what to expect, how to reschedule.",
  no_show: "They missed the appointment. No guilt-tripping, offer to reschedule, low friction.",
  sales_followup: "After a sales conversation, no decision yet. Recap value, answer likely objection, next step.",
  reactivation: "An old lead gone cold. Re-open naturally, reference time passed, offer something new/current.",
};

export async function generateOutreachMessage(input: {
  channel: string;
  stage: string;
  businessName: string;
  ownerName?: string | null;
  industry: string;
  personalizationHook?: string | null;
  opportunity?: string | null;
  offerRecommended?: string | null;
}): Promise<OutreachMessageResult> {
  return generateStructured({
    system: `${CONSULTANT_PERSONA} You are writing outreach as the founder of Unlimited Industries Business Consulting, from Booked & Paid Blueprint. ${GROUNDING_RULE} Never claim you already did work you didn't do — only reference the specific hook given to you.`,
    prompt: `Write a ${CHANNEL_LABEL[input.channel] ?? input.channel} message.

Stage: ${input.stage} — ${STAGE_BRIEF[input.stage] ?? ""}

Recipient business: ${input.businessName} (${input.industry})
Owner name (use only if given, otherwise address the business generically): ${input.ownerName ?? "unknown"}
Genuine observed detail to reference (do not fabricate beyond this): ${input.personalizationHook ?? "none given — keep it general, no fake specifics"}
Core opportunity/angle: ${input.opportunity ?? "help them get more booked customers"}
Offer to softly point toward if relevant: ${input.offerRecommended ?? "a short discovery call"}

Keep email under 120 words, DMs/SMS under 60 words. No subject line for instagram_dm, facebook, or sms channels (set subject to null).`,
    schema: OutreachMessageSchema,
    effort: "medium",
    maxTokens: 1500,
  });
}

// ---------------------------------------------------------------------------
// Phase 3.11: short pre-sale mini-audit (the wedge product)
// ---------------------------------------------------------------------------

export async function generateMiniAudit(input: {
  businessName: string;
  industry: string;
  researchNotes: string;
}): Promise<MiniAuditResult> {
  return generateStructured({
    system: `${CONSULTANT_PERSONA} You are producing a short, genuinely useful complimentary snapshot to open a conversation — not the full paid audit. ${GROUNDING_RULE}`,
    prompt: `Produce a mini visibility snapshot for this business using ONLY the notes below.

Business: ${input.businessName}
Industry: ${input.industry}

Research notes:
"""
${input.researchNotes}
"""`,
    schema: MiniAuditSchema,
    effort: "medium",
  });
}

// ---------------------------------------------------------------------------
// Phase 7: full AI Consultant report (the paid deliverable)
// ---------------------------------------------------------------------------

export async function generateFullAuditReport(intake: {
  businessName: string;
  industry: string;
  goals: string;
  currentMarketing: string;
  competitors: string;
  onlineVisibility: string;
  website: string;
  socialMedia: string;
  googlePresence: string;
  customerAcquisition: string;
  pricing: string;
  offer: string;
  branding: string;
  conversionProblems: string;
}): Promise<FullAuditReportResult> {
  return generateStructured({
    system: `${CONSULTANT_PERSONA} You are producing the full paid Business Audit deliverable a client is paying $199-$1,000+ for. It must be specific, prioritized, and immediately actionable — not generic filler. ${GROUNDING_RULE}`,
    prompt: `Write the full audit report from this client intake. Every section must be specific to THIS business, not generic advice.

Business: ${intake.businessName}
Industry: ${intake.industry}
Goals: ${intake.goals}
Current marketing: ${intake.currentMarketing}
Known competitors: ${intake.competitors}
Online visibility notes: ${intake.onlineVisibility}
Website: ${intake.website}
Social media: ${intake.socialMedia}
Google presence: ${intake.googlePresence}
Customer acquisition today: ${intake.customerAcquisition}
Pricing: ${intake.pricing}
Current offer: ${intake.offer}
Branding: ${intake.branding}
Conversion problems: ${intake.conversionProblems}`,
    schema: FullAuditReportSchema,
    effort: "high",
    // This schema is large (13 sections including three separate 30/60/90-day
    // plans) and "high" effort spends part of the budget on reasoning before
    // any output tokens — 8000 measured truncated mid-JSON in testing.
    maxTokens: 20000,
  });
}
