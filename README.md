# Unlimited Industries — Revenue Operator

An AI-assisted customer acquisition and sales system for Unlimited Industries Business
Consulting. It is a real, working internal tool — a CRM, an AI lead-scoring and outreach
drafting engine, an AI Consultant report generator, a digital product catalog, and a command
dashboard — not a slide deck of ideas.

**What this app never does on its own:** send a message, spend money, publish anything
publicly, or contact anyone. Every outbound action (an email, a DM, a report handed to a
client) is drafted and staged, and requires you to review and act on it yourself. See
`/playbook` in the app for the exact ownership of every step (Automated / AI Assisted /
Requires Approval / Requires You Personally).

## 1. The strategy (Phase 1-2)

Full market research, competitive positioning, and the chosen offer live in
`src/lib/content/strategy.ts` and `src/lib/content/offer.ts`, rendered at `/playbook` and
`/offer`. Short version:

- **The gap:** local marketing agencies are too expensive/slow for a true solo operator
  ($2k-$8k/mo retainers); white-label software (GoHighLevel resellers) sells a generic toolkit,
  not judgment; free "audit widget" lead magnets are shallow and passive.
- **The wedge offer:** **The Booked & Paid Snapshot** — a $149 one-time, personalized,
  AI-assisted visibility diagnosis with a prioritized fix list, delivered in 24-48 hours. Chosen
  over the other tiers because it's the fastest to sell cold (low price, low risk, no retainer),
  cheapest to fulfill (mostly AI + templates), and it doubles as lead qualification for the
  higher tiers.
- **The ladder:** Snapshot ($149) → Blueprint Starter ($497) → Blueprint Full Build
  ($1,500-$3,000) → Visibility & Opportunity Monitoring ($99-$249/mo recurring).

## 2. Architecture

Single Next.js (App Router) app, same pattern as a typical small internal tool: React
Server/Client Components call Next.js Route Handlers, which call Prisma (SQLite) for
persistence and the Anthropic Claude API for generation.

```
prisma/
  schema.prisma     — Lead (CRM), OutreachMessage, AuditReport, Product, Task (approval queue)
  seed.ts           — loads the digital product catalog + one clearly-marked sample lead
src/
  app/
    page.tsx                — Dashboard (Phase 10)
    leads/                   — CRM: list + detail (score, mini-audit, outreach drafting)
    outreach/                — Static outreach template library (Phase 5)
    audit/                   — AI Consultant full report generator (Phase 7)
    offer/                   — The built offer + full sales/checkout/booking copy (Phase 2)
    products/                — Digital products catalog (Phase 8)
    recurring/               — Recurring revenue service design (Phase 9)
    playbook/                — Strategy, market research, full automation map (Phase 1 & 6)
    api/                     — leads, leads/[id]/score, leads/[id]/outreach,
                                leads/[id]/mini-audit, outreach/[id] (approve/mark-sent),
                                tasks/[id], audit
  lib/
    ai/
      client.ts, generate.ts   — shared Anthropic client + structured-output helper
      schemas.ts                — Zod schemas for every AI output (score, outreach, audits)
      generators.ts              — prompt builders: scoreLead, generateOutreachMessage,
                                    generateMiniAudit, generateFullAuditReport
    content/
      strategy.ts, offer.ts, workflow.ts, outreach-templates.ts, products.ts, recurring.ts
```

## 3. The CRM (Phase 3-4)

`Lead` holds every field from the brief (business name, owner, industry, city, website, email,
phone, Instagram, Facebook, Google Business Profile, lead source, problems found, opportunity,
lead score, estimated value, outreach status, last contact, next follow-up, response,
appointment, offer recommended, potential deal size, closed/won/lost, notes) plus
`researchNotes` — the raw, human-collected observations that every AI feature is grounded in.

**Important by design:** there is no scraper, no purchased list, no automated web-crawling
"lead finder" in this app. Lead discovery and research (Phase 3, steps 1-2) stay manual/personal
— you add a lead and write down what you actually observed. From there, AI takes over the
repetitive analysis:

- **Score** (`/api/leads/[id]/score`) reads `researchNotes` and returns a 1-100 score, reasoning,
  concrete problems found, the core opportunity, a recommended offer tier, an estimated deal
  size, and one genuine personalization hook — grounded only in what you wrote, never invented.
- **Mini-Audit** (`/api/leads/[id]/mini-audit`) turns the same notes into a short, useful
  snapshot (the free/low-cost version of the paid product) to open a conversation.
- **Outreach** (`/api/leads/[id]/outreach`) drafts a channel- and stage-specific message
  (email/IG DM/Facebook/SMS × initial/follow-ups/interested-response/appointment-confirm/
  no-show/sales-follow-up/reactivation) using the personalization hook. Every draft lands as
  `status: draft` and creates a `Task` in the approval queue — nothing is ever auto-sent.
  Approving a draft just marks it ready to copy out; "Mark Sent" is a manual confirmation that
  you sent it yourself.

## 4. The AI Consultant (Phase 7)

`/audit` is the full paid-deliverable generator: fill in what a client actually told you during
intake (goals, current marketing, competitors, online visibility, website, social, Google
presence, acquisition, pricing, offer, branding, conversion problems), and it produces the full
structured report — executive summary, current situation, major problems, missed revenue
opportunities, competitor findings, priority recommendations, 30/60/90-day plans, recommended
channels, content strategy, acquisition strategy, impact/effort-scored priorities, KPIs, and
next actions. Review before sending to a client.

## 5. Automation map (Phase 6)

See `src/lib/content/workflow.ts` (`PIPELINE_STAGES`, `FULL_WORKFLOW`) and the `/playbook` page
for the complete Lead Found → Referral Request pipeline, each step tagged Automated / AI
Assisted / Requires Approval / Requires You Personally. The dashboard's "Pipeline Ownership"
panel renders the same tags live.

## 6. Getting started

```bash
npm install
cp .env.example .env      # fill in ANTHROPIC_API_KEY
npx prisma db push        # creates prisma/dev.db with the current schema
npm run seed               # loads the digital product catalog + one sample lead
npm run dev
```

Open http://localhost:3000. Delete the sample lead before doing real outreach — it's placeholder
data, not real research.

### Environment

- **`ANTHROPIC_API_KEY`** (or `ant auth login` / `ANTHROPIC_AUTH_TOKEN`) — required for lead
  scoring, outreach drafting, mini-audits, and the full audit report generator.
- **`ANTHROPIC_MODEL`** (optional) — defaults to `claude-opus-5`.
- No other external services are wired up. There is no email/SMS sending integration, no
  scraper, no ad account access, and no payment processor — all by design, per the operating
  rules this system was built under (never send external outreach, spend money, or access
  accounts without explicit approval).

## 7. What's intentionally not built yet

- **Sending.** Outreach is drafted and approval-gated, but actually sending (email/SMS/DM APIs)
  needs real accounts and explicit sign-off — wire that up only once you're ready to connect a
  specific provider.
- **Payments.** Revenue on the dashboard is computed only from leads you mark "Won" — there's no
  payment processor connected, so nothing here touches real money.
- **A real lead-finder.** Lead discovery stays a manual, personal step so every "problem found"
  the AI reports is grounded in something a human actually looked at — never a scraped guess.
