# AI Car Parts Vendor & Sourcing Agent

A real, working sourcing platform for automotive businesses — repair shops, mobile mechanics,
parts resellers, fleets, and dealerships — not a chatbot concept. Set up a business profile once,
then search for parts, build and score a vendor database, compare pricing, run an AI sourcing
agent over your own vendors, calculate profit/margin, build purchase orders, and track inventory.

**Accuracy is the design constraint, not an afterthought.** The app never fabricates vendors,
prices, part numbers, compatibility, or wholesale terms — see [§9 Accuracy rules](#9-accuracy--anti-fabrication-rules).

## 1. Architecture

A single Next.js 16 app (App Router) serves both the UI and the API — no separate backend
service. React Server/Client Components call Next.js Route Handlers, which call Prisma (SQLite)
for persistence, the NHTSA vPIC API for VIN decoding, and the Anthropic Claude API for the parts
of the product that are genuinely AI tasks (interpreting a free-text part query, drafting a vendor
message, ranking already-known vendors, brainstorming resale categories, running the conversational
Command Center).

```
┌───────────────────────────────┐
│  Browser (React / Next.js)     │
│  Dashboard · Vendor DB ·        │
│  Sourcing tools · Command Center│
└───────────────┬─────────────────┘
                │ fetch()
┌───────────────▼─────────────────────────────────────────┐
│  Next.js Route Handlers (src/app/api/**)                  │
│  business-profile · parts/search · vendors · vin ·         │
│  cross-reference · price-checks · purchase-orders ·        │
│  inventory · resell-opportunities · sourcing · conversations│
└───────┬───────────────┬────────────────────┬──────────────┘
        │               │                    │
┌───────▼──────┐ ┌──────▼─────────────┐ ┌────▼─────────────────┐
│ Prisma/SQLite │ │ Claude API          │ │ NHTSA vPIC API         │
│ Vendors, prices│ │ (structured output │ │ (free, keyless VIN     │
│ POs, inventory │ │  + tool-use agent) │ │  decoding)             │
└────────────────┘ └─────────────────────┘ └────────────────────────┘
```

Design choices worth calling out:

- **Single workspace, not multi-tenant**, matching "I run a repair shop / parts business" rather
  than an agency tool. The schema allows multiple `BusinessProfile` rows if extended later.
- **The Vendor table is the only source of truth for vendor facts.** Every price, wholesale term,
  return policy, etc. shown anywhere in the app traces back either to something the user typed in
  themselves, a manually logged price check with a timestamp, or the small static reference list of
  well-known national suppliers (`src/lib/vendorSeed.ts`) — never a live scrape or an AI guess
  presented as fact.
- **AI is used for interpretation and reasoning over real data, never for generating facts.** Part
  identification explains *why* a category was inferred and always includes a compatibility caveat.
  The Smart Sourcing Agent and Command Center are given the user's actual vendor rows as tool
  results and are explicitly instructed to only reference vendors that appear in that data.
- **Deterministic math stays deterministic.** Profit/margin/markup, the bulk-buy breakeven
  calculation, and the vendor Sourcing Score are all plain TypeScript functions (`src/lib/profit.ts`,
  `src/lib/sourcingScore.ts`), not AI output — so the numbers are reproducible and auditable.

## 2. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) | UI + API in one deployable app |
| Styling | Tailwind CSS v4 | Fast, consistent, no component library lock-in |
| Database | SQLite via Prisma ORM | Zero-config for a single-workspace tool; swap the `datasource` to Postgres/MySQL for a multi-user deployment without touching app code |
| AI | `@anthropic-ai/sdk`, model `claude-opus-5` (configurable via `ANTHROPIC_MODEL`) | Structured outputs (`messages.parse` + Zod) for part ID, resale ideas, vendor messages, sourcing plans; a manual tool-use loop for the Command Center |
| Vehicle data | NHTSA vPIC (`vpic.nhtsa.dot.gov`) | Free, keyless, official U.S. government VIN decoding API |
| Validation | Zod | Both AI output schemas and API request validation |
| PDF/CSV export | `pdf-lib`, hand-rolled CSV | Real purchase-order `.pdf`/`.csv` files |
| Icons | `lucide-react` | Lightweight, consistent icon set |

## 3. Database design

```prisma
BusinessProfile        — business identity, role flags (repair shop / mobile mechanic / reseller /
                          fleet / dealership), budget, preferred suppliers & brands, condition &
                          OEM/aftermarket preference
Settings                — singleton row: which BusinessProfile is active
Vendor                  — the tracked vendor database: identity, location, type (wholesale/OEM/
                          aftermarket/local/salvage/specialty/performance/fleet/heavy-duty/dealership),
                          terms (shipping, min order, wholesale & account requirements, return policy,
                          warranty), wholesale/local verification flags, status (researching/
                          contacted/approved/purchased/do-not-use), favorite, internal rating, notes
PriceCheck               — one manually logged price observation per vendor+part, always timestamped
CrossReference            — original ↔ alternate part number, verified vs. potential-match status
PartSearchLog             — logged part searches (vehicle/part/VIN details + AI interpretation)
PurchaseOrder / Line Item — PO header + line items, exportable to PDF/CSV
InventoryItem             — on-hand parts, cost/price, reorder level
VendorContactMessage      — AI-drafted vendor inquiries (never auto-sent)
Conversation / Message    — AI Command Center chat history, including a JSON tool-call trace per turn
```

Full definitions live in `prisma/schema.prisma`. JSON-shaped fields (preferred suppliers/brands,
parts categories, tool-call traces) are stored as JSON strings in SQLite text columns and parsed
back into typed objects on read (`src/lib/utils.ts#safeJsonParse`).

## 4. AI-agent architecture

**Context injection.** `src/lib/ai/context.ts` builds a system prompt from the active
`BusinessProfile` on every AI call, and prepends a fixed `ACCURACY_RULES` block (the Section 24/9
rules below) to *every single AI request in the app* — it cannot be diluted by a feature-specific
prompt.

**Structured generation.** `src/lib/ai/generate.ts` wraps `anthropic.messages.parse()` with a Zod
schema (`src/lib/ai/schemas.ts`) so every generator returns a validated, typed object instead of
parsed prose. Generators: part identification, resale opportunity ideas, vendor contact-message
drafting, and the Smart Sourcing Agent's ranked plan.

**Tool-using Command Center.** `src/lib/ai/assistant.ts` runs a manual tool-use loop
(`anthropic.messages.create` with `tools`) against real backend functions: `list_vendors`,
`get_vendor_detail`, `compute_profit`, `lookup_cross_reference`, `list_inventory`,
`draft_vendor_contact_message`, and `create_purchase_order_draft`. The model is instructed to call
a tool rather than guess whenever a question depends on data that could exist in the database, and
every vendor it can mention comes from a tool result — never from its own knowledge. Each turn's
tool calls are stored (`Message.toolCalls`) and shown in the UI for transparency.

**Smart Sourcing Agent** (`src/lib/ai/generators/smartSourcing.ts`) is deliberately narrower: it is
handed the user's *actual* candidate vendor rows (with a computed Sourcing Score) as the only
things it's allowed to rank, and must say plainly when the candidate list is empty rather than
inventing an option.

## 5. Parts-search architecture

`POST /api/parts/search` (`src/app/api/parts/search/route.ts`) accepts any combination of year,
make, model, trim, engine, VIN, part name/number, OEM/aftermarket number, symptoms, or a single
free-text query, and calls `identifyPart()` (`src/lib/ai/generators/partIdentification.ts`), which:

1. Identifies the most likely part category and related vehicle system.
2. Explains its reasoning in plain language.
3. **Always** returns a `compatibilityStatement` — literally "Compatibility needs to be verified."
   whenever the given details aren't specific enough to be confident, never a bare confirmation.
4. Suggests concrete search terms to use with vendors, and clarifying questions if the query was
   ambiguous.

Every search is logged to `PartSearchLog` for history/reuse. VIN lookups (`POST /api/vin`) go
through `src/lib/vin.ts` and the free NHTSA vPIC API — see §7.

## 6. Vendor-search architecture

There is no live vendor-scraping or paid data feed. Instead:

- **The user's own Vendor table** (`Vendor` + `PriceCheck`) is the primary result set for every
  vendor-facing tool (list, wholesale finder, local finder, comparison, sourcing agent).
- **`src/lib/vendorSeed.ts`** is a small, hand-curated, hard-coded list of real, well-known
  national automotive suppliers (RockAuto, NAPA, O'Reilly, AutoZone, Advance/Carquest, LKQ,
  Keystone, WorldPac, Parts Authority, FCP Euro, 1A Auto, PartsGeek, CarParts.com, Summit Racing,
  JEGS, FleetPride, TruckPro, and franchised-dealership parts departments). It carries only
  well-established public facts — never pricing, minimum orders, or specific wholesale terms —
  and every card built from it says so. One click ("Add to my vendors") copies an entry into the
  user's own tracked Vendor table, tagged `sourceType: "reference_list"`.
- **Wholesale Finder** (`/vendors/wholesale`) and **Local Finder** (`/vendors/local`) both filter
  this same real data and explicitly separate "verified" from "could not be verified" rather than
  guessing.

## 7. Vehicle / VIN API requirements

VIN decoding uses the **NHTSA vPIC API** (`https://vpic.nhtsa.dot.gov/api/`) — a free, public, U.S.
Department of Transportation service that requires no API key. `src/lib/vin.ts#decodeVin` calls
`decodevinvalues` and maps year/make/model/trim/engine/fuel/drive/transmission fields straight
through; any field vPIC can't resolve is simply omitted rather than guessed. The UI always shows
"VIN identification does not automatically guarantee part compatibility" next to decoded results.
Swapping in a commercial VIN API (for richer trim/options data) only requires changing
`src/lib/vin.ts`.

## 8. Pricing architecture

There is no live pricing feed. `PriceCheck` rows are **manually logged, timestamped observations**
(vendor, part, brand, condition, price, shipping, computed total, availability, warranty, return
policy, source URL). The Price Checker (`/price-checker`) and vendor comparison table always sort
by, and clearly date-stamp, the most recently logged price rather than presenting anything as live.
Profit/margin/markup (`src/lib/profit.ts#calculateProfit`) and the bulk-buy breakeven calculation
(`calculateBulkOpportunity`) are plain deterministic math over user-entered numbers.

## 9. Accuracy / anti-fabrication rules

Enforced in two layers:

1. **Structurally** — the schema and UI simply have no field for "AI-generated price" or
   "AI-generated vendor"; those only exist as user-entered or reference-list data. Cross-references
   and part numbers are user/vendor-sourced only (`CrossReference.status`: `verified` vs.
   `"potential match — verify before purchasing"`) — the AI is never asked to invent one.
2. **In every AI prompt** — `ACCURACY_RULES` (`src/lib/ai/context.ts`) is prepended to every AI
   call and states plainly: never fabricate vendors, prices, inventory, part numbers, warranties,
   or wholesale terms; never claim compatibility isn't verified when it isn't; never guarantee
   fitment, profit, or vendor legitimacy; and for a vendor that can't be verified, say "This vendor
   could not be sufficiently verified. Proceed with caution." rather than accusing it of fraud.

Scam/fraud flags (`src/lib/scamFlags.ts`) are a **deterministic checklist** (missing website/phone/
address/return policy/warranty, high-risk payment language, pressure tactics) — explainable, not an
AI judgment call. The Sourcing Score (`src/lib/sourcingScore.ts`) is likewise a transparent,
factor-by-factor rule-based score (0–100) computed only from information the user themselves
recorded, with an explicit disclaimer that it's an organizing signal, not a guarantee.

## 10. Security architecture

- **No secrets in the repo.** `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` are read from the
  environment only (`.env`, git-ignored); `.env.example` documents what's needed.
- **Input validation at every API boundary** — required-field checks in each route handler, VIN
  shape validation (`isPlausibleVin`) before calling out to NHTSA, Zod schemas validating AI output
  shape before it's trusted by the UI.
- **Parameterized data access only** — all persistence goes through Prisma's typed query builder
  (no raw SQL string concatenation anywhere), which also rules out SQL injection.
- **Vendor contact messages are drafted, never sent.** `VendorContactMessage` rows and Command
  Center tool output are explicitly labeled as drafts the user must review and send themselves —
  the app has no outbound email/SMS capability.
- **No fabricated trust signals.** Because the accuracy rules above keep AI output and app data
  clearly separated, there's no path for the app to present an AI guess as a verified fact, which
  is itself a security/trust property for a tool businesses use to decide who to pay.
- Swapping SQLite for Postgres/MySQL (single `datasource` line in `prisma/schema.prisma`) is the
  documented path to a real multi-user deployment with per-tenant auth in front of it.

## 11. Project file structure

```
prisma/
  schema.prisma                  Database schema (§3)
src/
  app/
    page.tsx                     Dashboard
    business-profile/            §1 Business profile
    parts/search/                §2/§3 Part search + VIN lookup
    sourcing/                    §18 Smart Sourcing Agent
    cross-reference/             §9 Part number cross-reference
    vendors/                     §4-§6 Vendor DB, detail, compare, wholesale, local
    price-checker/               §10 Price comparison
    profit-calculator/           §11 Profit/margin/markup
    resell-opportunities/        §12 Resale opportunity ideas
    bulk-buying/                 §13 Bulk-buy calculator
    purchase-orders/             §14 PO builder + PDF/CSV export
    inventory/                   §17 Inventory + low-stock alerts
    command-center/              §23 AI Command Center chat
    api/                         Route handlers backing every page above
  components/                    UI (shared `ui/*` primitives + feature components)
  lib/
    ai/                          Anthropic client, context/accuracy rules, structured generators,
                                  Zod schemas, the Command Center tool-use loop
    prisma.ts, business.ts       Prisma client, active-profile helpers
    vin.ts                       NHTSA vPIC integration
    vendorSeed.ts                Static reference list of well-known national suppliers
    profit.ts                    Profit & bulk-buy math
    sourcingScore.ts             Vendor Sourcing Score
    scamFlags.ts                 Deterministic scam/fraud checklist
    pdf.ts                       Purchase-order PDF generation
```

## Getting started

```bash
npm install
cp .env.example .env      # add your ANTHROPIC_API_KEY, or run `ant auth login`
npx prisma migrate dev    # creates prisma/dev.db
npm run dev
```

Open `http://localhost:3000`, set up your Business Profile, and start adding vendors. AI-powered
features (part identification, resale ideas, vendor message drafting, the Smart Sourcing Agent, and
the Command Center) require Anthropic credentials to be configured; everything else (vendor
database, price logging, profit/bulk-buy calculators, cross-references, purchase orders, inventory)
works without them.

## What's out of scope for now (Sections 21/22)

Business Credit and Business Funding agent integrations are intentionally not built — the brief is
explicit that purchasing from a vendor must never be presented as automatically building business
credit, and that funding must never be guaranteed. The data model already supports the described
handoff (a `BusinessProfile` plus tracked `Vendor`/`PurchaseOrder` history is exactly what a future
funding or credit agent would need), so wiring in a real one later is additive, not a rewrite.
