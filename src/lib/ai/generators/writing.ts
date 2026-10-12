import { z } from "zod";
import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import {
  emailSchema,
  blogPostSchema,
  websiteCopyBundleSchema,
  salesContentSchema,
  leadMagnetSchema,
  imagePromptSchema,
  type EmailContent,
  type BlogPost,
  type WebsiteCopyBundle,
  type SalesContent,
  type LeadMagnetContent,
} from "../schemas";
import type { BusinessContext } from "@/lib/types";
import { LEAD_MAGNET_FORMATS } from "@/lib/types";

export async function generateEmail(
  ctx: BusinessContext,
  params: { topic: string; purpose?: string }
): Promise<EmailContent> {
  const system = buildSystemPrompt(
    ctx,
    `Write a marketing email about the topic below${
      params.purpose ? ` for the purpose of: ${params.purpose}` : ""
    }. Write like a real person emailing their list, not a corporate newsletter. Give 2-4 subject line options to A/B test.`
  );
  return generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: emailSchema,
    effort: "medium",
    maxTokens: 2500,
  });
}

export async function generateBlogPost(
  ctx: BusinessContext,
  params: { topic: string }
): Promise<BlogPost> {
  const system = buildSystemPrompt(
    ctx,
    "Write a complete, well-structured blog post about the topic below. Use clear headings (markdown ##), short paragraphs, and genuinely useful information for the target audience — not filler. End with a natural CTA."
  );
  return generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: blogPostSchema,
    effort: "high",
    maxTokens: 6000,
  });
}

const quoteCtaSchema = z.object({
  quote: z.string().describe("A short, punchy standalone line for a quote graphic, max ~20 words"),
  cta: z.string(),
  imagePrompt: imagePromptSchema,
});
export type QuoteCta = z.infer<typeof quoteCtaSchema>;

export async function generateQuoteCta(
  ctx: BusinessContext,
  params: { topic: string }
): Promise<QuoteCta> {
  const system = buildSystemPrompt(
    ctx,
    "Extract one short, quotable, shareable line from this topic suitable for a standalone quote graphic, plus a matching CTA and image prompt."
  );
  return generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: quoteCtaSchema,
    effort: "low",
    maxTokens: 1200,
  });
}

export async function generateWebsiteCopy(
  ctx: BusinessContext,
  params: { focus?: string }
): Promise<WebsiteCopyBundle> {
  const system = buildSystemPrompt(
    ctx,
    `Write core website copy for this business${
      params.focus ? `, focused on: ${params.focus}` : ""
    }: a homepage hero (headline/subheadline/CTA), an about section, a description for each product/service mentioned in the business profile, and at least 4 FAQs a real prospective customer would actually ask.`
  );
  return generateStructured({
    system,
    prompt: "Generate the website copy now.",
    schema: websiteCopyBundleSchema,
    effort: "high",
    maxTokens: 5000,
  });
}

export async function generateSalesContent(
  ctx: BusinessContext,
  params: { offerName: string; price?: string; goal?: string }
): Promise<SalesContent> {
  const system = buildSystemPrompt(
    ctx,
    `Write a full sales content set for the offer described below. Be persuasive and specific to real customer objections and desires — never use deceptive claims, fabricated statistics, fake urgency, or guaranteed-results language. If no price is given, don't invent one.`
  );
  return generateStructured({
    system,
    prompt: [
      `OFFER: ${params.offerName}`,
      params.price ? `PRICE: ${params.price}` : null,
      params.goal ? `GOAL: ${params.goal}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    schema: salesContentSchema,
    effort: "high",
    maxTokens: 6000,
  });
}

export async function generateLeadMagnet(
  ctx: BusinessContext,
  params: { format: string; topic: string }
): Promise<LeadMagnetContent> {
  const formatLabel = LEAD_MAGNET_FORMATS.find((f) => f.id === params.format)?.label ?? params.format;
  const system = buildSystemPrompt(
    ctx,
    `Create a complete "${formatLabel}" lead magnet on the topic below: a title, subtitle, a clear outline, and the fully drafted content following that outline (in markdown) — genuinely useful, not a teaser. Also write a CTA to claim it and at least 2 promotional social posts (on platforms this business actually uses) to drive people to download it.`
  );
  const result = await generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: leadMagnetSchema,
    effort: "high",
    maxTokens: 8000,
  });
  return { ...result, format: params.format };
}
