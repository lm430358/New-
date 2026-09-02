// Phase 6 — the automation map. Each pipeline stage is tagged with who/what
// actually does the work, so the dashboard and lead detail view can always
// show the true division of labor instead of implying more automation than
// exists.

export type OwnerTag = "automated" | "ai_assisted" | "approval" | "personal";

export const OWNER_LABEL: Record<OwnerTag, string> = {
  automated: "Automated",
  ai_assisted: "AI Assisted",
  approval: "Requires My Approval",
  personal: "Requires Me Personally",
};

export const OWNER_COLOR: Record<OwnerTag, string> = {
  automated: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ai_assisted: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  approval: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  personal: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  owner: OwnerTag;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "new",
    label: "Lead Found",
    description: "A business is added to the CRM (manual entry, referral, or directory research).",
    owner: "personal",
  },
  {
    id: "researched",
    label: "Research Business",
    description: "Operator records genuine observations about the business's online presence in Research Notes.",
    owner: "personal",
  },
  {
    id: "scored",
    label: "Analyze & Score Opportunity",
    description: "AI reads the research notes and scores the lead 1-100, grounded only in what was actually observed.",
    owner: "ai_assisted",
  },
  {
    id: "outreach_prepared",
    label: "Generate Personalization & Outreach",
    description: "AI drafts a personalized first-touch message referencing the one genuine hook found.",
    owner: "ai_assisted",
  },
  {
    id: "awaiting_approval",
    label: "Approve Outreach",
    description: "Operator reviews the drafted message for accuracy and tone before it can be marked ready.",
    owner: "approval",
  },
  {
    id: "contacted",
    label: "Send Outreach",
    description: "Operator copies the approved message out and actually sends it (this system never sends on its own).",
    owner: "personal",
  },
  {
    id: "followed_up",
    label: "Follow Up",
    description: "System schedules and drafts follow-ups 1-3; operator approves and sends each.",
    owner: "ai_assisted",
  },
  {
    id: "responded",
    label: "Detect & Qualify Response",
    description: "Operator logs the reply; AI helps assess interest level and next best step.",
    owner: "ai_assisted",
  },
  {
    id: "appointment_booked",
    label: "Book Appointment",
    description: "Operator (or booking link) schedules the call.",
    owner: "personal",
  },
  {
    id: "audit_delivered",
    label: "Generate Mini-Audit / Prep for Call",
    description: "AI generates a personalized snapshot and a call-prep brief ahead of the conversation.",
    owner: "ai_assisted",
  },
  {
    id: "sales_call",
    label: "Sales Conversation",
    description: "Operator runs the actual sales conversation and closes (or doesn't).",
    owner: "personal",
  },
  {
    id: "proposal_sent",
    label: "Proposal / Payment",
    description: "Operator sends pricing and collects payment.",
    owner: "personal",
  },
  {
    id: "won",
    label: "Onboarding & Deliverables",
    description: "AI Consultant generates the full audit/report; templates assembled; operator reviews before delivery.",
    owner: "ai_assisted",
  },
  {
    id: "upsell",
    label: "Upsell / Recurring / Referral",
    description: "System flags upsell timing and drafts the ask; operator sends it personally.",
    owner: "ai_assisted",
  },
];

export function stageById(id: string): PipelineStage {
  return PIPELINE_STAGES.find((s) => s.id === id) ?? PIPELINE_STAGES[0];
}

// The full Phase 6 workflow diagram as data, independent of a single lead —
// used to render the Playbook page.
export interface WorkflowStep {
  step: string;
  owner: OwnerTag;
  note: string;
}

export const FULL_WORKFLOW: WorkflowStep[] = [
  { step: "Lead Found", owner: "personal", note: "Manual research/referral — no scraping or purchased lists." },
  { step: "Research Business", owner: "personal", note: "Operator records real, verifiable observations." },
  { step: "Analyze Marketing", owner: "ai_assisted", note: "AI structures the notes into concrete gaps." },
  { step: "Score Opportunity", owner: "ai_assisted", note: "1-100 score + reasoning, grounded in notes only." },
  { step: "Generate Personalization", owner: "ai_assisted", note: "One true, specific hook extracted for outreach." },
  { step: "Add to CRM", owner: "automated", note: "Lead record created/updated automatically from the above." },
  { step: "Prepare Outreach", owner: "ai_assisted", note: "Drafts across email/DM/FB/SMS for the right stage." },
  { step: "Follow Up", owner: "ai_assisted", note: "Drafts follow-ups 1-3 on a schedule; never auto-sent." },
  { step: "Detect Response", owner: "personal", note: "Operator logs replies as they come in (no inbox access granted)." },
  { step: "Qualify Prospect", owner: "ai_assisted", note: "AI flags interest level from the logged response." },
  { step: "Book Appointment", owner: "personal", note: "Operator or booking link schedules the call." },
  { step: "Generate Business Audit", owner: "ai_assisted", note: "Mini-audit pre-sale, full audit post-sale." },
  { step: "Recommend Offer", owner: "ai_assisted", note: "AI suggests the best-fit tier from the scoring output." },
  { step: "Payment", owner: "personal", note: "Operator collects payment — this system never handles money." },
  { step: "Onboarding", owner: "automated", note: "Client record + deliverable checklist created automatically." },
  { step: "Deliverables", owner: "ai_assisted", note: "Full audit / templates generated, operator reviews and sends." },
  { step: "Upsell", owner: "ai_assisted", note: "System flags timing (e.g. 30 days post-delivery) and drafts the ask." },
  { step: "Request Testimonial", owner: "approval", note: "Drafted request queued for operator approval, never sent blind." },
  { step: "Referral Request", owner: "approval", note: "Same — drafted, queued, approved, sent personally." },
];
