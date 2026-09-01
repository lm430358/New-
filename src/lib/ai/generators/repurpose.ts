import { z } from "zod";
import type { BusinessContext } from "@/lib/types";
import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { generateSocialPost, generateHooks } from "./social";
import { generateVideoScript } from "./video";
import { generateEmail, generateBlogPost } from "./writing";
import {
  socialPostSchema,
  carouselSchema,
  repurposeOutputSchema,
  type RepurposeOutput,
} from "../schemas";

const sourceSummarySchema = z.object({
  summary: z.string().describe("1-2 sentence summary of what the source content is about"),
  coreIdeas: z.array(z.string()).min(3).max(8).describe("The distinct core ideas/moments worth repurposing"),
});

const tiktokIdeasSchema = z.object({
  ideas: z
    .array(z.object({ concept: z.string(), hook: z.string() }))
    .length(5),
});

async function summarizeSource(ctx: BusinessContext, sourceContent: string) {
  const system = buildSystemPrompt(
    ctx,
    "The user pasted a long piece of existing content (blog post, transcript, article, notes, or similar) that they want repurposed into many smaller pieces. First, extract a short summary and the distinct core ideas worth turning into standalone content — do not invent anything not present in the source."
  );
  return generateStructured({
    system,
    prompt: `SOURCE CONTENT:\n"""\n${sourceContent}\n"""`,
    schema: sourceSummarySchema,
    effort: "medium",
    maxTokens: 2000,
  });
}

async function generateInstagramCaptions(ctx: BusinessContext, sourceContent: string, ideas: string[]) {
  const system = buildSystemPrompt(
    ctx,
    "Based on the source content below, write 3 distinct Instagram captions, each focused on a different core idea from the source (not the same idea rephrased 3 times). Adapt fully to Instagram's style."
  );
  const schema = z.object({ captions: z.array(socialPostSchema).length(3) });
  const result = await generateStructured({
    system,
    prompt: `SOURCE CONTENT:\n"""\n${sourceContent}\n"""\n\nCORE IDEAS TO DRAW FROM:\n${ideas.join("\n")}`,
    schema,
    effort: "medium",
    maxTokens: 4000,
  });
  return result.captions;
}

async function generateTiktokIdeas(ctx: BusinessContext, sourceContent: string, ideas: string[]) {
  const system = buildSystemPrompt(
    ctx,
    "Based on the source content below, generate 5 distinct TikTok video concepts (concept + hook only, not full scripts), each covering a different angle from the source."
  );
  const result = await generateStructured({
    system,
    prompt: `SOURCE CONTENT SUMMARY CONTEXT:\n"""\n${sourceContent}\n"""\n\nCORE IDEAS:\n${ideas.join("\n")}`,
    schema: tiktokIdeasSchema,
    effort: "medium",
    maxTokens: 2000,
  });
  return result.ideas;
}

async function generateShortFormScripts(ctx: BusinessContext, ideas: string[]) {
  const scripts = await Promise.all(
    ideas
      .slice(0, 5)
      .map((idea) => generateVideoScript(ctx, { topic: idea, lengthLabel: "30-45 seconds" }))
  );
  while (scripts.length < 5 && ideas.length) {
    scripts.push(await generateVideoScript(ctx, { topic: ideas[0], lengthLabel: "30-45 seconds" }));
  }
  return scripts.slice(0, 5);
}

async function generateCarouselFromSource(ctx: BusinessContext, sourceContent: string) {
  const system = buildSystemPrompt(
    ctx,
    "Turn the source content below into a carousel outline (5-8 slides) hitting its most valuable points in sequence."
  );
  return generateStructured({
    system,
    prompt: `SOURCE CONTENT:\n"""\n${sourceContent}\n"""`,
    schema: carouselSchema,
    effort: "medium",
    maxTokens: 3000,
  });
}

/**
 * "Turn One Piece of Content Into 20 Pieces." Fans a single source piece
 * (blog post, transcript, article, notes...) out into every major format via
 * parallel focused calls, grounded in the source's actual content.
 */
export async function generateRepurposeOutput(
  ctx: BusinessContext,
  sourceContent: string
): Promise<RepurposeOutput> {
  const { summary, coreIdeas } = await summarizeSource(ctx, sourceContent);
  const topIdea = coreIdeas[0] ?? summary;

  const [
    facebookPost,
    linkedinPost,
    instagramCaptions,
    tiktokIdeasRaw,
    shortFormScripts,
    email,
    blogPost,
    carousel,
    hooks,
  ] = await Promise.all([
    generateSocialPost(ctx, { platform: "facebook", topic: `${summary}\n\nSource excerpt:\n${sourceContent.slice(0, 4000)}` }),
    generateSocialPost(ctx, { platform: "linkedin", topic: `${summary}\n\nSource excerpt:\n${sourceContent.slice(0, 4000)}` }),
    generateInstagramCaptions(ctx, sourceContent.slice(0, 6000), coreIdeas),
    generateTiktokIdeas(ctx, summary, coreIdeas),
    generateShortFormScripts(ctx, coreIdeas.length ? coreIdeas : [summary]),
    generateEmail(ctx, { topic: `${summary}\n\nSource excerpt:\n${sourceContent.slice(0, 4000)}` }),
    generateBlogPost(ctx, { topic: `Repurpose and expand on:\n${summary}\n\nSource excerpt:\n${sourceContent.slice(0, 6000)}` }),
    generateCarouselFromSource(ctx, sourceContent.slice(0, 6000)),
    generateHooks(ctx, { topic: topIdea }),
  ]);

  const assembled: RepurposeOutput = {
    sourceSummary: summary,
    facebookPost,
    linkedinPost,
    instagramCaptions,
    tiktokIdeas: tiktokIdeasRaw,
    shortFormScripts,
    email,
    blogPost,
    carousel,
    hooks,
  };

  return repurposeOutputSchema.parse(assembled);
}

