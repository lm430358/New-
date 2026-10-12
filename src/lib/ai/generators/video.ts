import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { videoScriptSchema, type VideoScript } from "../schemas";
import type { BusinessContext } from "@/lib/types";

export async function generateVideoScript(
  ctx: BusinessContext,
  params: { topic: string; platform?: string; lengthLabel: string }
): Promise<VideoScript> {
  const system = buildSystemPrompt(
    ctx,
    `Write a ${params.lengthLabel} short-form video script${
      params.platform ? ` for ${params.platform}` : ""
    } about the topic below. Structure it as: HOOK -> PROBLEM -> VALUE/STORY/SOLUTION -> PROOF OR EXAMPLE -> CTA, broken into clearly labeled sections. For each section give the exact voiceover/dialogue line(s), on-screen text, a concrete b-roll/visual suggestion (stock footage, screen recording, demonstration, photo — be specific), and a camera direction (framing, movement). Pace the script realistically for the target length — do not write a script that would take far longer or shorter to read aloud than ${params.lengthLabel}.`
  );
  const result = await generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: videoScriptSchema,
    effort: "medium",
    maxTokens: 4000,
  });
  return { ...result, length: params.lengthLabel };
}
