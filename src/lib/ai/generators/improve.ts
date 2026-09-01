import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { improvedContentSchema, type ImprovedContent } from "../schemas";
import type { BusinessContext } from "@/lib/types";
import { CONTENT_IMPROVER_ACTIONS } from "@/lib/types";

const ACTION_INSTRUCTIONS: Record<string, string> = {
  better: "Improve this content overall: stronger hook, clearer flow, tighter writing, better CTA.",
  engaging: "Make this more engaging: sharper hook, more natural voice, add a moment of curiosity or tension.",
  shorter: "Cut this down significantly while keeping the core message and CTA intact. Remove filler, not substance.",
  professional: "Rewrite this to sound more professional and polished, while staying warm and human — not stiff.",
  persuasive: "Make this more persuasive using ethical persuasion: clearer benefit, sharper stakes, stronger CTA. Do not add fake claims, stats, or urgency that isn't already true.",
  emotional: "Rewrite this to connect more emotionally — bring out the human stakes, feeling, or story already present. Do not invent a story or emotion that wasn't implied by the original.",
  viral: "Rewrite this in a viral-style short-form format: pattern-interrupt hook, punchy short lines, strong pacing. Keep it honest — no clickbait that doesn't pay off.",
  hooks: "Rewrite only the opening hook/first line to be significantly stronger, then keep the rest of the content but adjust flow to match the new hook.",
  cta: "Keep the content itself the same, but add or strengthen a clear, specific call to action that fits the content's purpose.",
  brand_voice: "Rewrite this so it fully matches the business's brand voice described in your instructions, without changing the underlying message or facts.",
};

export async function improveContent(
  ctx: BusinessContext,
  params: { content: string; action: string }
): Promise<ImprovedContent> {
  const label = CONTENT_IMPROVER_ACTIONS.find((a) => a.id === params.action)?.label ?? params.action;
  const instruction = ACTION_INSTRUCTIONS[params.action] ?? ACTION_INSTRUCTIONS.better;
  const system = buildSystemPrompt(
    ctx,
    `The user pasted existing content and asked you to: "${label}". ${instruction}\n\nCRITICAL: Preserve the original meaning and every fact/claim exactly as given — do not invent new facts, statistics, promotions, or claims that weren't in the original.`
  );
  return generateStructured({
    system,
    prompt: `ORIGINAL CONTENT:\n"""\n${params.content}\n"""`,
    schema: improvedContentSchema,
    effort: "medium",
    maxTokens: 3000,
  });
}
