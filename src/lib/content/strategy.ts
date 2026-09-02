// Phase 1 — Revenue Strategy. Rendered on /playbook. Kept as data (not
// prose in a component) so it's one place to update.

export const MARKET_RESEARCH = {
  summary:
    "The market for 'help local service businesses get more customers' is large and already " +
    "crowded, but split into two extremes with a gap between them.",
  findings: [
    {
      segment: "Full-service local marketing agencies (Hibu, boutique local agencies)",
      pricing: "$2,000-$8,000/month retainers, or ~$39-$500/month entry tiers with add-on fees",
      whatTheyOffer: "Website, SEO, ads, social — a human account manager runs it for you.",
      weakness:
        "Too expensive and too slow for a true solo operator (mobile detailer, DJ, one-truck " +
        "pressure washer). Requires trust before any value is delivered. Long contracts. Overkill " +
        "for someone who just needs to look legit and get bookings flowing.",
    },
    {
      segment: "White-label software platforms (GoHighLevel-based agencies)",
      pricing: "$197-$497/month per client for CRM + automation software access",
      whatTheyOffer: "A powerful but generic toolkit — funnels, SMS, AI chatbot, booking calendar.",
      weakness:
        "Sells software, not judgment. The business owner (or the reseller) still has to figure " +
        "out the strategy, write the copy, and configure everything themselves. Steep learning " +
        "curve for a non-technical solo operator with no time.",
    },
    {
      segment: "Self-serve 'free audit' widgets (My Web Audit, Insites, etc.)",
      pricing: "Free — used as a lead magnet embedded on the agency's own site",
      whatTheyOffer: "An automated technical SEO/website score.",
      weakness:
        "Passive (waits for inbound traffic to the agency's site), generic (a template score, not " +
        "real strategic advice), and produces a report with no real path to being booked and paid — " +
        "it flags problems, it doesn't sell a fix.",
    },
  ],
  gap:
    "Nobody is selling a cheap, fast, genuinely personalized STRATEGIC snapshot directly and " +
    "proactively to very small, pre-scale local operators — the ones too small for a $2k/mo " +
    "retainer and too non-technical for a $300/mo software subscription. The self-serve audit " +
    "tools are the closest analog, but they're free, passive, and shallow.",
  competitiveAdvantage: [
    "Sell the audit itself as revenue (not a free lead magnet) — it's genuinely useful on its own, " +
    "which lowers the trust barrier: pay $49-$199 once for something tangible, not $500/month on faith.",
    "Target the specific hyper-local, single-operator niches agencies underserve (detailers, DJs, " +
    "cleaners, pressure washers, mobile mechanics) — these are cheap to reach, starved for basic " +
    "professionalism (booking systems, reviews, a real website), and priced out of standard agencies.",
    "AI does the drafting (research structuring, scoring, personalization, the report itself); the " +
    "human does the judgment calls (what to say, who to contact, closing) — so cost stays near " +
    "digital-product economics while the deliverable still feels bespoke.",
    "A one-time paid entry product doubles as the lead-qualification mechanism: anyone who pays " +
    "$149 for a snapshot has already proven they'll spend money on their business, which is the best " +
    "predictor of who converts into the $1,500-$3,000 tier next.",
  ],
} as const;

export const OFFER_ANALYSIS = {
  easiestToSellNow: {
    name: "The Booked & Paid Snapshot (mini paid audit)",
    why:
      "Low price ($149-$199), fast to deliver (AI-assisted, same-day), low risk for the buyer, and " +
      "directly answers the most painful, visible problem a solo operator has: 'I don't look bookable.'",
  },
  mostProfitable: {
    name: "The Booked & Paid Blueprint (premium consulting package, $1,500-$3,000)",
    why:
      "Highest margin per hour once the audit + template infrastructure exists — most of the heavy " +
      "lifting (research structuring, report generation, templates) is AI-assisted, while the price " +
      "reflects hands-on implementation and a real outcome (a working booking system).",
  },
  mostScalable: {
    name: "Monthly Visibility & Opportunity Monitoring ($99-$249/month, see Phase 9)",
    why:
      "Nearly zero marginal labor per client once built — an AI-generated monthly report — and " +
      "revenue compounds without needing new customers each month.",
  },
  chosenWedge: {
    name: "The Booked & Paid Snapshot",
    rationale:
      "Best combination of fast cash, high margin (mostly AI + templates, minimal owner time per " +
      "unit), low owner involvement, high automation potential, and a built-in upgrade path into " +
      "the Blueprint and the recurring monitoring service. It is also the least trust-dependent " +
      "offer to sell cold, which matters most in month one when there's no track record yet.",
  },
  painPoint:
    "They're losing bookings right now to competitors who simply look more professional online — " +
    "and they usually can't see it themselves because they're too close to their own business.",
  positioning:
    "Position as an investment with a measurable return (more booked jobs), not 'business advice.' " +
    "Frame pricing around the cost of ONE missed job, not the cost of a marketing service.",
  pricing: "$149 one-time for the Snapshot -> $997 for the Blueprint (mini) -> $1,500-$3,000 for full Blueprint implementation -> $99-$249/mo Monitoring.",
  included: [
    "A written, specific diagnosis of what's costing them bookings",
    "3-5 concrete, prioritized fixes ranked by impact vs. effort",
    "One clear next step (not a 40-page generic PDF)",
  ],
  excluded: [
    "Ongoing implementation work at the Snapshot tier (that's the Blueprint, sold separately)",
    "Managing their ad spend or running their social accounts (scope creep — refer out or upsell to Blueprint)",
    "Guarantees of a specific income outcome",
  ],
  recurringPath:
    "Every Snapshot and Blueprint client rolls into the Monitoring subscription as the default " +
    "next step 30 days after delivery — 'want us watching this monthly so it doesn't slip again?'",
} as const;
