import { generateStructured } from "./generate";
import { buildSystemPrompt } from "./context";
import { qualityReportSchema, type QualityReport } from "./schemas";
import type { BusinessContext } from "@/lib/types";

/**
 * Runs every generated piece of content back through Claude as an
 * independent quality check before it's shown to the user — grammar,
 * clarity, brand-voice fit, hook strength, CTA presence, platform fit,
 * originality, and a flag list for anything misleading or invented.
 */
export async function scoreContent(
  ctx: BusinessContext,
  params: { content: string; platform?: string; contentType?: string }
): Promise<QualityReport> {
  const system = buildSystemPrompt(
    ctx,
    "You are now acting as a strict content quality reviewer, not a writer. Evaluate the content below honestly — do not inflate the score. A generic or cliché piece should score below 70. A piece with an invented statistic, fake testimonial, or guaranteed-results claim must be flagged and scored below 50."
  );
  const prompt = [
    params.contentType ? `CONTENT TYPE: ${params.contentType}` : null,
    params.platform ? `PLATFORM: ${params.platform}` : null,
    `CONTENT TO REVIEW:\n"""\n${params.content}\n"""`,
  ]
    .filter(Boolean)
    .join("\n");

  return generateStructured({
    system,
    prompt,
    schema: qualityReportSchema,
    effort: "low",
    maxTokens: 2000,
  });
}
