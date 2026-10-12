# AI Content Builder Agent

A real, working AI content department for a small business — not a chatbot wrapper. Set up a
business profile once, then generate social content, video scripts, calendars, campaigns,
sales copy, lead magnets, and more, all grounded in that profile and automatically
quality-checked before it's shown to you.

## 1. Architecture

A single Next.js app (App Router) serves both the UI and the API. There is no separate
backend service — React Server/Client Components call Next.js Route Handlers, which call
Prisma (SQLite) for persistence and the Anthropic Claude API for generation.

```
┌─────────────────────────────┐
│  Browser (React / Next.js)  │
│  Dashboard · tool pages ·    │
│  Assistant chat              │
└──────────────┬───────────────┘
               │ fetch()
┌──────────────▼───────────────┐
│  Next.js Route Handlers       │
│  /api/business-profile        │
│  /api/generate/*               │
│  /api/library, /api/export/*  │
│  /api/assistant                │
└───────┬───────────────┬───────┘
        │               │
┌───────▼──────┐ ┌──────▼─────────────┐
│ Prisma/SQLite │ │ Claude API (Opus 5)│
│ Business data │ │ Structured outputs │
│ Content library│ │ + tool-use agent  │
└───────────────┘ └────────────────────┘
```

Design choices worth calling out:

- **Single workspace, not multi-tenant.** There's one active Business Profile at a time
  (tracked in a `Settings` singleton row). That matches the brief — "I own a cleaning
  business" — without the overhead of accounts/auth. The schema *does* support multiple
  `BusinessProfile` rows if you want to extend it to an agency-style multi-client tool later.
- **Structured generation, not prose parsing.** Every generator calls
  `anthropic.messages.parse()` with a Zod schema via `output_config.format`, so responses come
  back as validated, typed objects — never regex-scraped text.
- **Fan-out instead of one giant call.** Big features ("Create Everything", Repurpose,
  Campaign, Calendar) run several small, focused generation calls in parallel rather than
  asking for one huge JSON blob. This keeps every individual response well inside safe output
  limits (no truncation risk on a 90-day calendar) and keeps quality high per piece.
- **Quality is a real second pass.** Single-piece tools (social post, video script, email,
  blog, sales copy, lead magnet, improved content) automatically run the result back through a
  dedicated "reviewer" prompt and return a 0–100 score with a breakdown before you ever see the
  content. Bulk tools (Everything, Campaign, Repurpose, Calendar) expose quality-checking
  on-demand per piece instead, so generating 10+ pieces at once doesn't silently double or
  triple your API cost.

## 2. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | UI + API in one deployable app |
| Styling | Tailwind CSS v4 | Fast, consistent, no component library lock-in |
| Database | SQLite via Prisma ORM | Zero-config for a single-workspace tool; swap the `datasource` to Postgres/MySQL for multi-user deployments without touching app code |
| AI | `@anthropic-ai/sdk`, model `claude-opus-5` (configurable via `ANTHROPIC_MODEL`) | Structured outputs (`messages.parse` + Zod) for every generator, plus a manual tool-use loop for the Smart Assistant |
| Validation | Zod | Both AI output schemas and API request validation |
| Export | `docx`, `pdf-lib`, hand-rolled CSV | Real .docx/.pdf/.csv files, not just plain text |
| Icons | `lucide-react` | Lightweight, consistent icon set |

## 3. Database structure

```prisma
BusinessProfile   — the reusable business context (name, industry, audience, brand voice,
                     voice samples, USP, pricing, promotions, goals, competitors, preferred
                     platforms, cached content pillars)
Settings          — singleton row: which BusinessProfile is "active"
ContentItem       — the Content Library: type, platform, title, body (JSON), image prompt,
                     quality score + feedback, tags, pillar, favorite flag, source tool
ContentCalendar   — saved calendars (days, start date, JSON entries)
Campaign          — saved campaigns (input brief + full generated strategy, JSON)
LeadMagnet        — saved lead magnets (format, title, JSON content)
Conversation       — Smart Assistant chat threads
Message           — messages within a conversation (role + content)
```

Full definitions live in `prisma/schema.prisma`. All structured AI output is stored as JSON
strings in SQLite text columns (SQLite has no native JSON type); the app parses them back into
typed objects on read.

## 4. AI-agent architecture

**Context injection.** `lib/ai/context.ts` builds a system prompt from the active
`BusinessProfile` on *every* call — business details, brand voice instructions (including
learning from user-provided voice samples for a custom voice), goals, competitors, and cached
content pillars. Every tool in the app automatically "knows" the business; nothing has to be
re-entered.

**Structured generation.** `lib/ai/generate.ts` exports `generateStructured()`, a thin wrapper
around `anthropic.messages.parse()` that takes a Zod schema and returns a validated, typed
object. `lib/ai/schemas.ts` defines the shape of every content type (social post, video
script, carousel, email, blog post, calendar entry, campaign, lead magnet, quality report,
etc).

**Generators.** `lib/ai/generators/*` contains one module per feature area (social, video,
writing, calendar, campaign, repurpose, everything, ideas, improve, pillars). Bulk features
compose the smaller generators with `Promise.all` rather than asking the model for one massive
response:

- *Create Everything* fans one idea out into 9 parallel focused calls (FB/IG/LinkedIn posts,
  carousel, 3 video scripts, email, blog post, quote+CTA).
- *Content Calendar* deterministically assigns each day a platform/pillar/goal by rotation
  (mechanically guaranteeing variety and pillar coverage), then fills in the creative fields in
  parallel chunks of 10 days — so a 90-day calendar is 9 small, fast, reliable calls instead of
  one calendar-truncating mega-call.
- *Repurpose* first extracts a summary + core ideas from the pasted source, then fans out to
  every target format grounded in that extraction.
- *Campaign* generates the strategic core (messages, headlines, ad copy) and the content
  assets (posts, script, email) as two parallel batches.

**Quality checker.** `lib/ai/quality.ts` runs a second, independent prompt that scores content
0–100 across grammar/clarity, brand-voice fit, hook strength, CTA presence, platform
suitability, and originality, plus explicit flags for invented facts, fake urgency, or
guaranteed-results claims. `lib/ai/autoScore.ts` wires this automatically into single-piece
generation routes.

**Smart Assistant.** `lib/ai/assistant.ts` implements a manual Claude tool-use loop (not the
beta Tool Runner, to keep the core app on stable/GA API surface). The assistant has real tools
— `generate_social_post`, `generate_video_script`, `generate_email`, `generate_blog_post`,
`generate_hooks`, `improve_content`, `repurpose_content`, `generate_content_calendar` — so
"make a week of posts about our promotion" actually calls the generators instead of the model
just describing what it would do. Conversations persist to the database; tool outputs render
as the same rich result cards used throughout the app.

**Trend research.** The brief allows for verified trend research via web search, but only if
the app is given a way to distinguish a verified trend from a model guess. This app does not
wire up live web search (no bundled search API key), so the ideas generator is explicitly
scoped as "AI-generated content ideas" — never labeled as a verified trend. If you add a
`web_search` tool call to `lib/ai/generators/ideas.ts` with real web access, keep that
verified-vs-generated distinction explicit in the UI.

## 5. User workflow

```
Business Profile  →  Brand Voice  →  (optional) Content Pillars
        ↓
Pick a tool from the Dashboard, or ask the Smart Assistant in plain English
        ↓
Enter a goal / audience / topic / offer (most fields are optional — the
business profile fills in the rest)
        ↓
Content Strategy + Creation happen together (the generators are the strategy —
platform adaptation, pillar rotation, hook variety, etc. are baked into the prompts)
        ↓
Automatic Quality Check (score + breakdown + flags) — or on-demand for bulk results
        ↓
Edit inline, Save to the Content Library, or Export (copy / .txt / .docx / .pdf / .csv)
```

## 6. Complete file structure

```
prisma/
  schema.prisma                # all data models
src/
  app/
    layout.tsx                 # app shell: sidebar + top bar
    page.tsx                   # dashboard (tool tiles)
    business-profile/page.tsx
    social/page.tsx            # Create Social Media Content
    video/page.tsx             # Video Script Builder + 10 Hooks
    calendar/page.tsx          # Content Calendar (7/14/30/60/90)
    campaign/page.tsx          # Build My Campaign
    business-content/page.tsx  # Website copy / blog / newsletter tabs
    sales/page.tsx             # Promotional & Sales Content
    lead-magnet/page.tsx       # Build Me a Lead Magnet
    repurpose/page.tsx         # Turn 1 piece into 20
    improve/page.tsx           # Content Improver (10 transform buttons)
    ideas/page.tsx             # "I Don't Know What to Post"
    everything/page.tsx        # One Idea → Everything
    library/page.tsx           # Content Library
    assistant/page.tsx         # Smart Assistant chat
    api/
      business-profile/route.ts
      business-profile/pillars/route.ts
      generate/
        social/route.ts  carousel/route.ts  hooks/route.ts  video/route.ts
        email/route.ts  blog/route.ts  website-copy/route.ts
        everything/route.ts  calendar/route.ts  campaign/route.ts
        repurpose/route.ts  improve/route.ts  sales/route.ts
        lead-magnet/route.ts  ideas/route.ts
      quality-check/route.ts
      library/route.ts  library/[id]/route.ts  library/[id]/duplicate/route.ts
      export/{txt,docx,pdf,csv}/route.ts
      assistant/route.ts  assistant/[id]/route.ts
  components/
    Sidebar.tsx  TopBar.tsx  BusinessProfileForm.tsx  ContentResultCard.tsx
    ui/{Button,Card,Field,Badge}.tsx
  lib/
    prisma.ts  business.ts  types.ts  validation.ts  format.ts  download.ts  utils.ts
    ai/
      client.ts  context.ts  generate.ts  schemas.ts  quality.ts  autoScore.ts  assistant.ts
      generators/{pillars,social,video,writing,calendar,campaign,repurpose,everything,ideas,improve}.ts
```

## 7. UI design

Clean SaaS layout: a fixed left sidebar grouped into Overview / Create / Improve & Reuse /
Manage, a top bar showing the active business profile, and a max-width content column. Every
generated piece renders through one shared `ContentResultCard` component so the interaction
model is identical everywhere — Copy, Save to Library, Check Quality (or an automatic score
badge), and an Export menu (.txt/.docx/.pdf). Violet is the accent color; each dashboard tile
gets its own gradient icon tile for scannability. Forms favor chip-style multi-select
(brand voice, goals, platforms) over free text so the business profile stays structured and
reusable.

## 8. API requirements

- **`ANTHROPIC_API_KEY`** (or an `ant auth login` profile / `ANTHROPIC_AUTH_TOKEN`) — required
  for every `/api/generate/*`, `/api/quality-check`, `/api/business-profile/pillars`, and
  `/api/assistant` call. Without it those routes return a clean `502` with the SDK's
  authentication error rather than crashing.
- **`ANTHROPIC_MODEL`** (optional) — override the model (defaults to `claude-opus-5`).
- No other external services are required. Export endpoints run entirely server-side
  (`docx`, `pdf-lib`) with no third-party API calls.

## Getting started

```bash
npm install
cp .env.example .env      # then fill in ANTHROPIC_API_KEY
npx prisma db push        # creates prisma/dev.db with the current schema
npm run dev
```

Open http://localhost:3000, fill in your Business Profile, then use any tool or the Smart
Assistant. The `docker`-free SQLite setup means there's nothing else to stand up.

### Known trade-offs (by design, not oversight)

- Single active business profile at a time (see Architecture above for why, and how to extend
  it to multi-tenant).
- Bulk generators (Everything/Campaign/Repurpose/Calendar) don't auto-score every sub-piece —
  quality-check is one click away per piece instead, to keep those already-heavy requests from
  multiplying further.
- The Smart Assistant's chat history persists as plain text; the rich result cards it produces
  in a turn aren't re-hydrated from history after a page reload (the conversation text is,
  the generated content itself lives in the Content Library once saved).
- Trend research is intentionally not wired to live web search — see section 4.
