// Phase 9 — the recurring revenue design.

export const RECURRING_SERVICE = {
  name: "Visibility & Opportunity Monitoring",
  price: "$99-$249/month (tiered by number of channels tracked)",
  chosenBecause:
    "Best combination of profitability and automation potential: the deliverable is an AI-generated " +
    "report built from the same generator used for the audit product, so marginal cost per client " +
    "approaches zero once the first version exists, while the value (staying visible, catching new " +
    "competitor moves) compounds every month it runs.",
  whatItIncludes: [
    "Monthly re-check of Google Business Profile completeness and review velocity",
    "Monthly competitor snapshot (using whatever the client points us at)",
    "A short, AI-generated 'what changed and what to do about it' report",
    "One flagged opportunity per month worth acting on",
  ],
  fulfillmentModel: {
    automated: ["Report generation from the standing template", "Scheduling the monthly check-in task"],
    aiAssisted: ["Drafting the 'what changed' narrative", "Flagging the month's top opportunity"],
    approval: ["Operator reviews each report before it's sent — nothing goes out unread"],
    personal: ["Any live call the client requests beyond the report itself"],
  },
  upgradePath:
    "Every Snapshot and Blueprint client is offered Monitoring as the natural next step 30 days " +
    "after delivery, positioned as 'keep this from slipping back to where it was.'",
} as const;
