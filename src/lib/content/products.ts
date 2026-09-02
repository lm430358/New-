// Phase 8 — digital products built once, sold repeatedly. Seeded into the
// Product table (see prisma/seed.ts) so they show up on /products and can be
// edited from the database going forward.

export const DIGITAL_PRODUCTS = [
  {
    name: "Booked & Paid Blueprint",
    tagline: "The flagship template + checklist system",
    description:
      "The core existing product: a step-by-step system for going from 'has a skill' to 'visible, " +
      "professional, and booked.' Sold standalone or bundled into consulting packages.",
    price: 197,
    type: "one_time",
    category: "template",
  },
  {
    name: "Google Business Profile Optimization Checklist",
    tagline: "The single highest-leverage free fix, turned into a paid template",
    description: "A copy-paste checklist that walks a local business through a fully optimized GBP listing.",
    price: 29,
    type: "one_time",
    category: "template",
  },
  {
    name: "Review-Request Message Pack",
    tagline: "Stop losing reviews to silence",
    description: "10 ready-to-send review request templates across SMS, email, and in-person handoff cards.",
    price: 19,
    type: "one_time",
    category: "template",
  },
  {
    name: "Booking Page Copy Kit",
    tagline: "Turn browsers into booked jobs",
    description: "Plug-and-fill copy for a booking page: headline, trust section, FAQs, and CTA variants by industry.",
    price: 49,
    type: "one_time",
    category: "template",
  },
  {
    name: "30-Day Content Starter Pack",
    tagline: "A month of posts without staring at a blank page",
    description: "30 days of caption + photo-idea prompts tailored to local service businesses.",
    price: 39,
    type: "one_time",
    category: "template",
  },
  {
    name: "Local Service Sales Script Pack",
    tagline: "What to say when a lead calls",
    description: "Phone and DM scripts for quoting, objection handling, and closing local service jobs.",
    price: 39,
    type: "one_time",
    category: "template",
  },
  {
    name: "Booked & Paid Snapshot",
    tagline: "The wedge offer — see /offer",
    description: "A personalized visibility diagnosis and prioritized fix list, delivered in 24-48 hours.",
    price: 149,
    type: "one_time",
    category: "audit",
  },
  {
    name: "Booked & Paid Blueprint — Starter",
    tagline: "We implement the top 3 fixes for you",
    description: "GBP rebuild, review-request system setup, and a booking-ready page — done for the client.",
    price: 497,
    type: "one_time",
    category: "strategy",
  },
  {
    name: "Booked & Paid Blueprint — Full Build",
    tagline: "The complete done-for-you system",
    description: "Website/booking flow, review engine, content starter kit, and a 90-day visibility plan.",
    price: 2000,
    type: "one_time",
    category: "consulting",
  },
  {
    name: "Visibility & Opportunity Monitoring",
    tagline: "The recurring revenue engine — see Phase 9",
    description: "A monthly AI-generated report tracking visibility, competitor moves, and new opportunities.",
    price: 149,
    type: "recurring",
    category: "subscription",
  },
] as const;
