import type { BusinessContext } from "@/lib/types";

const VOICE_GUIDANCE: Record<string, string> = {
  professional: "Polished, credible, and clear. No slang. Confident but not stiff.",
  friendly: "Warm, approachable, like a helpful neighbor. Plain language, positive tone.",
  funny: "Witty and light. Use humor that fits the brand — never at the customer's expense.",
  bold: "Confident, punchy, opinionated. Short declarative sentences. No hedging.",
  luxury: "Elevated, refined, understated. Show don't shout. Never uses discount-y language.",
  inspirational: "Uplifting and motivating, focused on transformation and possibility.",
  educational: "Clear, structured, teacher-like. Prioritizes usefulness over hype.",
  conversational: "Casual and natural, like texting a smart friend. Contractions are fine.",
  direct: "No fluff. Get to the point in the first sentence. Short paragraphs.",
  playful: "Fun, a little cheeky, uses wordplay and energy without being unprofessional.",
  emotional: "Leans into feeling — empathy, story, stakes — while staying honest and grounded.",
  storytelling: "Leads with narrative: a moment, a character, a turn, a takeaway.",
};

export function brandVoiceInstruction(ctx: BusinessContext): string {
  if (ctx.brandVoice === "custom") {
    const parts = [
      `Custom brand voice${ctx.customVoiceName ? ` ("${ctx.customVoiceName}")` : ""}.`,
    ];
    if (ctx.customVoiceNotes) parts.push(`Voice description: ${ctx.customVoiceNotes}`);
    if (ctx.voiceSamples.length) {
      parts.push(
        "Learn the voice from these examples the business owner wrote or approved — match their word choice, rhythm, and tone closely:\n" +
          ctx.voiceSamples.map((s, i) => `Example ${i + 1}:\n"""${s}"""`).join("\n\n")
      );
    }
    return parts.join("\n");
  }
  return VOICE_GUIDANCE[ctx.brandVoice] ?? VOICE_GUIDANCE.conversational;
}

/**
 * The single source of truth for "who is this business" — injected into
 * every generation call so the AI never has to be re-taught the business.
 */
export function buildBusinessContextBlock(ctx: BusinessContext): string {
  const lines: string[] = [];
  lines.push(`BUSINESS: ${ctx.businessName}`);
  lines.push(`INDUSTRY: ${ctx.industry}`);
  lines.push(`PRODUCTS/SERVICES: ${ctx.productsServices}`);
  lines.push(`TARGET AUDIENCE: ${ctx.targetAudience}`);
  if (ctx.brandDescription) lines.push(`BRAND DESCRIPTION: ${ctx.brandDescription}`);
  if (ctx.usp) lines.push(`UNIQUE SELLING PROPOSITION: ${ctx.usp}`);
  if (ctx.pricingInfo) lines.push(`PRICING: ${ctx.pricingInfo}`);
  if (ctx.currentPromotions) lines.push(`CURRENT PROMOTIONS: ${ctx.currentPromotions}`);
  if (ctx.location) lines.push(`LOCATION: ${ctx.location}`);
  if (ctx.website) lines.push(`WEBSITE: ${ctx.website}`);
  if (Object.keys(ctx.socialAccounts).length) {
    lines.push(
      `SOCIAL ACCOUNTS: ${Object.entries(ctx.socialAccounts)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")}`
    );
  }
  if (ctx.goals.length) lines.push(`CURRENT GOALS: ${ctx.goals.join(", ")}`);
  if (ctx.competitors.length) lines.push(`COMPETITORS: ${ctx.competitors.join(", ")}`);
  if (ctx.preferredPlatforms.length)
    lines.push(`PREFERRED PLATFORMS: ${ctx.preferredPlatforms.join(", ")}`);
  if (ctx.contentPillars.length) {
    lines.push(
      `CONTENT PILLARS (rotate across these, avoid repeating the same pillar back to back):\n` +
        ctx.contentPillars.map((p) => `- ${p.name}: ${p.description}`).join("\n")
    );
  }
  lines.push(`\nBRAND VOICE: ${ctx.brandVoice}\n${brandVoiceInstruction(ctx)}`);
  return lines.join("\n");
}

export const CONTENT_QUALITY_RULES = `
Quality rules that always apply:
- Never invent statistics, testimonials, awards, reviews, or claims about the business that were not given to you.
- Never guarantee specific results (e.g. "you will get X customers", "guaranteed to double your sales").
- Never use misleading urgency/scarcity ("only 2 left") unless the business profile actually states a real promotion with those terms.
- Avoid generic AI-sounding filler ("In today's fast-paced world...", "Unlock the power of...", excessive emoji, hashtag spam).
- Every piece should have a genuine hook, a clear point, and a natural call to action that matches its goal — never force a sales CTA onto educational content.
- Write like a skilled human strategist for this specific business, not a generic template.
`.trim();

export function buildSystemPrompt(ctx: BusinessContext, roleInstruction: string): string {
  return [
    "You are an expert AI content strategist, copywriter, social media manager, and marketing assistant working exclusively for the business described below. You produce ready-to-post, high-quality marketing content — never generic filler.",
    "",
    buildBusinessContextBlock(ctx),
    "",
    CONTENT_QUALITY_RULES,
    "",
    roleInstruction,
  ].join("\n");
}
