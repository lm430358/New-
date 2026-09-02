// Phase 2 — the built offer. Rendered on /offer.

export const OFFER = {
  name: "The Booked & Paid Snapshot",
  parentBrand: "Unlimited Industries Business Consulting",
  headline: "Find out exactly what's costing you bookings — before your next competitor does.",
  subheadline:
    "A personalized, done-for-you visibility snapshot for local service businesses. Delivered in " +
    "24-48 hours. No retainer, no contract, no guesswork.",
  promise:
    "You'll know precisely what's making customers scroll past your business, and the 3-5 fixes " +
    "that will get you booked more — in writing, specific to you, not a generic checklist.",
  targetCustomer:
    "Local service business owners (mobile mechanics, cleaners, handymen, beauty pros, DJs, " +
    "photographers, pressure washers, landscapers, contractors, mobile detailers, food and event " +
    "businesses) who are good at the work but not getting enough leads or bookings from their " +
    "online presence.",
  pricing: {
    snapshot: { price: 149, label: "Booked & Paid Snapshot", cadence: "one-time" },
    blueprintMini: { price: 497, label: "Booked & Paid Blueprint — Starter", cadence: "one-time" },
    blueprintFull: { price: 2000, label: "Booked & Paid Blueprint — Full Build", cadence: "one-time (typical range $1,500-$3,000)" },
    monitoring: { price: 149, label: "Visibility & Opportunity Monitoring", cadence: "per month" },
  },
  deliverables: [
    "A written diagnosis of the top gaps hurting your bookings (website, Google Business Profile, socials, reviews, booking flow)",
    "A prioritized action list — what to fix first, ranked by impact vs. effort",
    "One specific, high-leverage recommendation you can act on today for free",
    "A short recorded or written walkthrough explaining the 'why' behind each finding",
  ],
  bonuses: [
    "A copy-paste Google Business Profile optimization checklist",
    "3 review-request message templates",
    "$100 credit toward the Blueprint if you upgrade within 14 days",
  ],
  guarantee:
    "If the Snapshot doesn't surface at least 3 specific, actionable fixes you didn't already know " +
    "about, it's free — no questions asked.",
  faqs: [
    {
      q: "Is this just an automated report?",
      a: "The research and drafting is AI-assisted for speed, but every finding is grounded in a real " +
        "look at your actual online presence, and a human reviews it before it's sent to you.",
    },
    {
      q: "Do I have to sign up for anything ongoing?",
      a: "No. The Snapshot is a one-time purchase. There's an optional next step (the Blueprint) if you " +
        "want help implementing the fixes, but nothing auto-renews.",
    },
    {
      q: "How is this different from a free audit tool?",
      a: "Free audit widgets give you a generic technical score. This is a strategic diagnosis written " +
        "for your specific business and industry, with a prioritized plan — not just a number.",
    },
    {
      q: "What if I don't have a website yet?",
      a: "Even better — we'll tell you whether you need one yet, or whether a well-optimized Google " +
        "Business Profile and Instagram get you booked faster and cheaper first.",
    },
  ],
  objections: [
    {
      objection: "\"I can just Google this myself.\"",
      response:
        "You could — but you're too close to your own business to see it the way a new customer does, " +
        "and generic advice doesn't tell you what to fix FIRST for your specific situation.",
    },
    {
      objection: "\"$149 feels like a lot for a report.\"",
      response: "One missed job probably costs you more than $149. This pays for itself the first time it prevents that.",
    },
    {
      objection: "\"I've been burned by marketing people before.\"",
      response:
        "No retainer, no contract — you get a concrete deliverable in 48 hours and decide from there " +
        "whether you want help implementing it.",
    },
  ],
  salesPageCopy: {
    hero: {
      eyebrow: "For local service businesses ready to stop losing jobs to less-skilled competitors",
      headline: "You do great work. Your online presence doesn't show it.",
      body:
        "Every week, customers are choosing someone else — not because that business is better, but " +
        "because it looks easier to trust and book. The Booked & Paid Snapshot shows you exactly why, " +
        "and exactly what to fix first.",
      cta: "Get My Snapshot — $149",
    },
    problem: {
      headline: "Here's what's actually happening",
      body:
        "A customer searches for what you do. They find you — and three competitors. They spend 20 " +
        "seconds deciding who to call. If your Google listing looks incomplete, your reviews are thin, " +
        "or there's no clear way to book, they move on. You never even know you lost that job.",
    },
    solution: {
      headline: "What you get",
      body:
        "A specific, written breakdown of the exact things costing you bookings right now — and a " +
        "ranked list of what to fix first, in plain English, no jargon.",
    },
    proof: {
      headline: "Why this works",
      body:
        "This isn't a generic checklist. It's built around what actually gets local service " +
        "businesses booked: a bookable Google profile, believable proof (reviews/photos), and a " +
        "frictionless way to say yes.",
    },
    close: {
      headline: "Stop losing jobs to businesses that just look more ready.",
      cta: "Get My Snapshot — $149",
      riskReversal: "If it doesn't surface 3+ real fixes, you don't pay.",
    },
  },
  checkoutCopy: {
    headline: "You're getting the Booked & Paid Snapshot",
    bullets: [
      "Delivered within 24-48 hours",
      "Written specifically for your business — not a template",
      "3-5 prioritized fixes, ranked by impact",
      "Risk-free: 3+ real findings or it's free",
    ],
    price: "$149 one-time — no subscription",
    reassurance: "Secure checkout. No account required. You'll get your Snapshot by email.",
  },
  bookingCopy: {
    headline: "Let's find out what's costing you bookings.",
    body:
      "Grab 20 minutes. Bring your website and Google Business Profile if you have them — we'll walk " +
      "through what a new customer sees when they find you today.",
    cta: "Book My Free 20-Minute Visibility Call",
    afterBooking:
      "You'll get a calendar invite with a short intake form. Fill it out beforehand so we can spend " +
      "the whole call on findings, not questions.",
  },
  upsells: [
    {
      name: "Booked & Paid Blueprint — Starter ($497)",
      pitch: "We build the top 3 fixes FOR you — new Google Business Profile setup, review-request system, and a booking-ready page.",
    },
    {
      name: "Booked & Paid Blueprint — Full Build ($1,500-$3,000)",
      pitch: "The complete done-for-you system: website/booking flow, review engine, content starter kit, and a 90-day visibility plan.",
    },
  ],
  downsells: [
    {
      name: "The Booking Page Fix ($49)",
      pitch: "Can't do the full Snapshot right now? Get just the single highest-impact fix, written out, for $49.",
    },
  ],
} as const;
