# AI Character Generation Platform

A system for creating AI characters — realistic, semi-realistic, cartoon, anime, or 3D-animated —
that stay **recognizably the same** across unlimited future images, scenes, and (eventually)
video and voice. Lives in this same Next.js app, alongside the AI Content Builder Agent, as a
second feature area (`/characters`, `/scenes`, `/api/characters/*`, `/api/generate/scene`,
`/api/scenes`) sharing one deployment and one database.

## 0. Is this realistically possible today?

Yes, with one important caveat: **a text prompt alone cannot hold identity**. Ask an image model
for "Marcus, a 45-year-old mechanic with grey hair and a scar" twice and you get two different
men. Real character memory requires the system to carry *visual* information forward, not just
words. This platform does that with three layers, from weakest to strongest:

1. **Structured profile** (always on) — a canonical, highly specific appearance paragraph, face
   descriptor, and default outfit, stored once and reused verbatim in every prompt. Removes
   prompt-to-prompt wording drift, but text alone still can't pin down a face exactly.
2. **Reference-image identity lock** (the MVP's default) — the character's saved reference image
   is fed into an identity-preserving model (InstantID-class) alongside the new prompt, so the
   face itself — not just its description — carries forward into every new pose/scene.
3. **Per-character LoRA** (the advanced upgrade path, scaffolded but not auto-run) — a small
   fine-tuned model trained on 10-20 images of the character. The strongest consistency
   available, especially across very different poses, styles, or outfits, at the cost of a
   training step (~$2-5, ~10-20 min) per character.

What this explicitly does **not** do: pretend that re-sending the original text description is
"memory." That approach was ruled out by design — see `Character.physicalDescription` /
`faceDescriptor` / `CharacterReferenceImage` in the schema below for what actually gets stored
and reused instead.

## 1. Technical architecture

```
┌──────────────────────────────┐
│  Browser (React / Next.js)    │
│  Character Library · Create ·  │
│  Character Detail · Scene      │
│  Generator · Scenes Gallery     │
└──────────────┬────────────────┘
               │ fetch()
┌──────────────▼────────────────────────────┐
│  Next.js Route Handlers                     │
│  /api/characters (+ [id], duplicate,         │
│    outfits, relationships, reference-images) │
│  /api/generate/scene                         │
│  /api/scenes                                 │
└───────┬───────────────────┬──────────────────┘
        │                   │
┌───────▼──────┐   ┌────────▼─────────────────┐   ┌─────────────────────────┐
│ Prisma/SQLite  │   │ Claude API (profile +     │   │ Image provider           │
│ Character data │   │ scene-prompt compiler)    │──▶│ (Replicate: InstantID /  │
│ Reference imgs  │   │ lib/ai/characters/*       │   │ Flux / LoRA trainer)     │
│ Relationships   │   └───────────────────────────┘   │ lib/image/*              │
└────────────────┘                                     └─────────────────────────┘
```

Two AI touchpoints, kept deliberately separate:

- **Claude** (`lib/ai/characters/profile.ts`, `promptBuilder.ts`) turns free text into the
  structured profile once, and later compiles per-scene prompts from that profile — it never
  generates pixels.
- **Image provider** (`lib/image/*`) is the only thing that generates pixels, behind one
  `ImageProvider` interface so the backend (Replicate today) can be swapped for fal.ai, OpenAI
  Images, Google Imagen, etc. by adding one adapter file — no other code changes.

This same pattern is left ready for `lib/video/*` and `lib/voice/*` adapters later (see §11).

## 2. Best models/APIs for consistent characters (and why)

| Need | Model/API | Why |
|---|---|---|
| Initial character sheet (style, first look) | `black-forest-labs/flux-dev` via Replicate | Strong prompt adherence across realistic/cartoon/anime styles, fast, cheap |
| Identity-locked scene generation | `zsxkib/instant-id` via Replicate | Takes a reference face image + a new prompt, locks facial identity while changing pose/outfit/scene — this is the actual consistency mechanism, not prompt wording |
| Strongest possible consistency (upgrade path) | Per-character LoRA via `ostris/flux-dev-lora-trainer` | Fine-tunes a small weight delta on the character's own images; best results across dramatically different poses/styles; costs real training time/money so it's opt-in, not default |
| (Ruled out for now) Midjourney | — | No supported, ToS-compliant public API suitable for a product backend |
| (Future option) fal.ai, OpenAI `gpt-image-1`, Google Imagen on Vertex | — | All viable alternative/additional `ImageProvider` adapters; not wired yet, no reason to multi-source on day one |

## 3. How character identity is stored and retrieved

Every reusable fact about a character lives in one of two places:

- **`Character` row** — the structured profile (age, gender, occupation, personality traits,
  background, voice notes) plus the identity-defining text fields that get reused verbatim:
  `physicalDescription`, `faceDescriptor`, `defaultOutfitDescription`, `negativePrompt`.
- **`CharacterReferenceImage` rows** — the actual visual identity anchor: one or more images
  (AI-generated character sheet and/or user uploads), with one flagged `isPrimary` as the face
  reference used for identity-locked generation.

Retrieval is never "re-read the original prompt." `lib/ai/characters/promptBuilder.ts` builds
every future prompt from the stored structured fields plus the primary reference image URL —
the original free-text description (`sourceDescription`) is kept only for provenance/audit, and
is never re-sent to an image model.

## 4. Maintaining facial consistency across generations

In order of how much each contributes:

1. **Reference image conditioning** (does the real work) — the primary reference image is passed
   to the identity-preserving model on every generation. This is what keeps the *actual face*
   stable, not an approximation from words.
2. **Canonical physical/face text**, reused unchanged every time, so wording never drifts and the
   text channel reinforces rather than contradicts the image channel.
3. **A persistent negative prompt** per character, ruling out known failure modes (wrong age
   range, extra limbs, art-style bleed).
4. **A stored seed** (`Character.seed`) as a minor, last-resort consistency signal — useful mainly
   when regenerating the *exact same* shot with a small tweak, not across different poses/scenes.
5. **(Opt-in upgrade) a trained LoRA** — once trained, this is strictly stronger than reference-
   image conditioning for consistency across very different scenes/styles, at the cost of a
   training step. `Character.identityLockMode` tracks which mode a character is using.

## 5. Reference images vs. LoRAs vs. embeddings vs. seeds vs. prompt templates

All five have a real role; none of them alone is "character memory":

- **Prompt templates** — necessary (keeps wording from drifting) but weakest alone; used as the
  text layer under everything else.
- **Seeds** — a minor consistency aid for near-identical re-rolls; not a substitute for the above.
- **Reference images** — the MVP's primary identity-lock mechanism. Strong, works immediately
  with no training step, the right default.
- **LoRAs** — the strongest option; the recommended path once a character needs to look
  identical across very different scenes/styles or the user is building a recurring series.
  Scaffolded in `ImageProvider.trainIdentity()` / `Character.loraStatus`, not auto-triggered yet.
- **Face embeddings** — used for *automated QA*, not generation: computing a face-similarity score
  between a new generation and the reference image to flag drift before showing it to the user.
  Not implemented in the MVP (no embedding model is wired up yet) — called out explicitly rather
  than faked, since a schema field that isn't populated would be worse than not having it.

## 6. Database structure for character memory

```prisma
Character               — the identity record: profile fields + physicalDescription/faceDescriptor
                           /defaultOutfitDescription (reused verbatim), personality, background,
                           voice notes, identityLockMode, LoRA status
CharacterReferenceImage  — the visual identity anchor(s): generated sheet images + user uploads,
                           one flagged isPrimary
CharacterOutfit          — named, reusable outfits independent of identity
CharacterRelationship    — directed edges between two characters + relationship type/description
                           (Marcus -> Tina: "customer", Tina -> Marcus: "mechanic")
Generation               — every scene actually produced: compiled prompt, provider/model used,
                           status, result image, and which characters/outfits were in it
GenerationCharacter      — join table: which characters (and which outfit) appear in a Generation
```

Full definitions live in `prisma/schema.prisma`. This is additive to the existing Content Builder
schema — no shared tables, same SQLite file.

## 7. Technology stack

Reuses this repo's existing stack rather than standing up a second one:

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) — same app, new routes |
| Database | SQLite via Prisma — same database, new models |
| Text AI | `@anthropic-ai/sdk` (`claude-opus-5`) via `generateStructured()` — profile extraction + scene-prompt compilation |
| Image AI | Replicate REST API (no SDK dependency — plain `fetch`), behind `lib/image/ImageProvider` |
| Styling / UI | Tailwind CSS v4, the existing `ui/{Button,Card,Field,Badge}` components |

## 8. External APIs needed

- **Anthropic API** (already required by the rest of the app) — character profile generation and
  scene-prompt compilation.
- **Replicate API** (`REPLICATE_API_TOKEN`) — character-sheet generation, identity-locked scene
  generation, and (opt-in) LoRA training.
- **(Future)** object storage (S3/R2/Cloudinary) once user-uploaded reference images or
  LoRA-training image bundles need first-party hosting instead of pointing at external URLs.
- **(Future)** a TTS provider (ElevenLabs, etc.) once voice assignment ships — see §11.

## 9. Estimated costs (rough, per the providers above)

- **Claude calls**: profile generation + scene-prompt compilation are both small structured
  calls — a few cents per character created, well under a cent per scene generated.
- **Flux (character sheet)**: roughly $0.01-0.03 per image on Replicate.
- **InstantID (scene generation)**: roughly $0.01-0.03 per image on Replicate.
- **LoRA training (opt-in)**: roughly $2-5 and 10-20 minutes per character, one-time.
- At MVP scale (hundreds of characters, thousands of scenes/month) this is a low-hundreds-of-
  dollars/month infrastructure cost — the dominant line item will be image-generation volume, not
  storage or compute for the app itself.

## 10. MVP (built in this commit)

- Create a character from free text → structured profile + initial reference image.
- Character Library: view, edit any profile field, duplicate, delete.
- Multiple reference angles per character (front/three-quarter/side/closeup/full body); pick which
  is primary.
- Named outfits per character.
- Scene generator: pick one or more saved characters (with per-scene outfit overrides), set
  environment/pose/expression/camera angle/lighting, generate an image. Single-character scenes
  get full identity-lock conditioning; multi-character scenes compile detailed per-character text
  (current identity-lock models only condition on one face at a time — called out in the UI, not
  hidden).
- Relationships between characters, surfaced to the scene compiler so e.g. "Marcus is Tina's
  mechanic" informs how a shared scene is framed.
- Scenes Gallery of everything generated.

## 11. Future advanced version (video + voice)

The provider pattern is built so these are new adapters, not a rewrite:

- **`lib/video/*`** — a `VideoProvider` interface mirroring `ImageProvider`, backed by an
  image-to-video or character-conditioned video model (e.g. Runway, Luma, Kling, or a future
  Replicate video model), using the same saved reference image(s) for identity.
- **`lib/voice/*`** — a `VoiceProvider` interface: assign a TTS voice (ElevenLabs voice cloning or
  a stock voice matched to `Character.voiceDescription`) and store the resulting
  `voiceProviderId` on the `Character` row, next to everything else that makes up its identity.
- **Episode/series memory** — group `Generation`s into a `Series`/`Episode` model so a recurring
  cast's appearances, outfits-per-episode, and continuity notes are tracked over time, not just
  per-scene.

## 12. User flow

```
Create Character  →  AI builds structured profile + generates initial reference image
        ↓
Save Character  →  appears in the Character Library with its reference image, profile,
                    outfits, and relationships
        ↓
Generate Scene  →  pick saved character(s) + outfit overrides + scene details →
                    identity-locked image generated from their saved reference image
        ↓
Reuse Character  →  same character picked again in any future scene, with any other saved
                    character, indefinitely — no re-describing required
```

## 13. Technical limitations to understand before building further

- **Multi-character face-lock is currently single-face.** InstantID-class models condition on one
  face at a time; a scene with two saved characters gets strong text-level identity but not
  per-face visual lock for both at once. The LoRA upgrade path is the fix once that matters (or
  compositing two separately-generated, identity-locked crops).
- **No automated consistency scoring yet.** There's no face-embedding similarity check flagging
  "this generation drifted from the reference" before showing it to the user — a real gap, listed
  rather than faked (see §5).
- **LoRA training needs a one-time manual setup** (a destination model slug in the user's
  Replicate account) before it can be used from the app — not something the app can safely
  auto-provision without broader account-level API scope.
- **Reference images are stored as external URLs**, not re-hosted — fine for Replicate-generated
  images (persist on Replicate's CDN) but user uploads need real object storage before this is a
  production product (see §8).
- **Style transfer isn't guaranteed symmetric.** A character generated as "realistic" won't
  automatically have a believable "cartoon" version — that's a second, separately-generated
  identity (ideally still using the same physical/personality profile, with its own reference
  image) rather than one model instance spanning styles.

## 14. Monetization

- **Credits** — the natural unit here is "generations" (character sheets, scene images, later
  video seconds / voice minutes); sell credit packs, meter against them.
- **Subscription tiers** — e.g. Free (a few characters, watermarked/lower-res), Creator (more
  characters, HD, priority queue), Studio/Business (unlimited characters, team seats, LoRA
  training included, commercial license terms).
- **Per-character LoRA training as a paid add-on** — a natural, high-intent upsell exactly when a
  user cares enough about one character to want the strongest consistency.
- **Business/agency plans** — multiple character "casts" per brand/show, shared team access,
  usage reporting — a credible sell to agencies, YouTube creators, and small studios doing
  recurring-character content.
- **Marketplace angle (later)** — letting creators license out well-made characters/casts to
  other users, with the platform taking a cut, once character quality and ownership terms are
  solid.
