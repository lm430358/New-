import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { contentIdeasSchema, type ContentIdeas } from "../schemas";
import type { BusinessContext } from "@/lib/types";

export async function generateContentIdeas(
  ctx: BusinessContext,
  params: { recentTopics?: string[] } = {}
): Promise<ContentIdeas> {
  const system = buildSystemPrompt(
    ctx,
    `The business owner doesn't know what to post. Generate at least 10 concrete, specific content ideas (not generic categories) spread across these categories: Educational, Promotional, Storytelling, Engagement, Behind-the-scenes, Authority-building, Customer-focused. Tie each idea to one of the business's content pillars. Every idea must be something this specific business could realistically produce.${
      params.recentTopics?.length
        ? `\n\nAVOID repeating or closely resembling these recently-covered topics:\n${params.recentTopics.map((t) => `- ${t}`).join("\n")}`
        : ""
    }`
  );
  return generateStructured({
    system,
    prompt: "Generate the content ideas now.",
    schema: contentIdeasSchema,
    effort: "medium",
    maxTokens: 3000,
  });
}
