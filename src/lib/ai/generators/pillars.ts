import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { contentPillarsSchema } from "../schemas";
import type { BusinessContext, ContentPillar } from "@/lib/types";

export async function generateContentPillars(ctx: BusinessContext): Promise<ContentPillar[]> {
  const system = buildSystemPrompt(
    ctx,
    "Identify 4-7 content pillars for this specific business — the recurring themes its content should rotate through so posting never feels repetitive. Tailor them to this exact business and audience; don't return a generic list. Cover a mix of education, trust-building, storytelling, behind-the-scenes, and promotion appropriate to this business."
  );
  const result = await generateStructured({
    system,
    prompt: "Generate the content pillars now.",
    schema: contentPillarsSchema,
    effort: "medium",
    maxTokens: 2000,
  });
  return result.pillars;
}
