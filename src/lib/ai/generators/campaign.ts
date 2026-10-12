import { z } from "zod";
import type { BusinessContext } from "@/lib/types";
import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { generateSocialPost } from "./social";
import { generateVideoScript } from "./video";
import { generateEmail } from "./writing";
import { campaignSchema, type CampaignContent } from "../schemas";

export interface CampaignBrief {
  productOrService: string;
  targetCustomer: string;
  offer: string;
  price?: string;
  goal: string;
  lengthDays: number;
}

const strategyCoreSchema = z.object({
  title: z.string(),
  strategySummary: z.string(),
  keyMessages: z.array(z.string()).min(3),
  headlines: z.array(z.string()).min(3),
  ctas: z.array(z.string()).min(3),
  adCopyVariants: z
    .array(
      z.object({
        headline: z.string(),
        primaryText: z.string(),
        description: z.string(),
        cta: z.string(),
      })
    )
    .min(2),
  promotionalMessages: z.array(z.string()).min(3),
  followUpContent: z.array(z.string()).min(2),
});

const campaignPlatformsSchema = z.object({
  platforms: z.array(z.string()).min(2).max(4),
});

async function generateCampaignCore(ctx: BusinessContext, brief: CampaignBrief) {
  const system = buildSystemPrompt(
    ctx,
    `Design the strategic core of a ${brief.lengthDays}-day marketing campaign for the offer below. Give a tight strategy summary, key messages, headline options, CTA options, 2+ ad copy variants (for the platforms this business actually uses), promotional messages for social/email, and follow-up content ideas for after someone converts.`
  );
  const prompt = [
    `PRODUCT/SERVICE: ${brief.productOrService}`,
    `TARGET CUSTOMER: ${brief.targetCustomer}`,
    `OFFER: ${brief.offer}`,
    brief.price ? `PRICE: ${brief.price}` : null,
    `CAMPAIGN GOAL: ${brief.goal}`,
    `CAMPAIGN LENGTH: ${brief.lengthDays} days`,
  ]
    .filter(Boolean)
    .join("\n");
  return generateStructured({ system, prompt, schema: strategyCoreSchema, effort: "high", maxTokens: 5000 });
}

async function pickCampaignPlatforms(ctx: BusinessContext, brief: CampaignBrief): Promise<string[]> {
  if (ctx.preferredPlatforms.length >= 2) return ctx.preferredPlatforms.slice(0, 3);
  const system = buildSystemPrompt(
    ctx,
    "Pick the 2-4 best social platforms for this specific campaign and business, based on the target customer and offer."
  );
  const result = await generateStructured({
    system,
    prompt: `TARGET CUSTOMER: ${brief.targetCustomer}\nOFFER: ${brief.offer}`,
    schema: campaignPlatformsSchema,
    effort: "low",
    maxTokens: 500,
  });
  return result.platforms;
}

/**
 * "Build My Campaign": strategy core + content assets generated in parallel,
 * grounded in the same offer/audience/goal brief.
 */
export async function generateCampaign(ctx: BusinessContext, brief: CampaignBrief): Promise<CampaignContent> {
  const [core, platforms] = await Promise.all([
    generateCampaignCore(ctx, brief),
    pickCampaignPlatforms(ctx, brief),
  ]);

  const campaignTopic = `${brief.offer} for ${brief.productOrService}. Key messages: ${core.keyMessages.join("; ")}`;

  const [socialPosts, videoScript, email] = await Promise.all([
    Promise.all(
      platforms
        .slice(0, 3)
        .map((platform) => generateSocialPost(ctx, { platform, topic: campaignTopic, goal: brief.goal }))
    ),
    generateVideoScript(ctx, { topic: campaignTopic, lengthLabel: "30-60 seconds" }),
    generateEmail(ctx, { topic: campaignTopic, purpose: `Promote this campaign: ${brief.offer}` }),
  ]);

  const assembled: CampaignContent = {
    title: core.title,
    strategySummary: core.strategySummary,
    keyMessages: core.keyMessages,
    headlines: core.headlines,
    ctas: core.ctas,
    socialPosts,
    videoScripts: [videoScript],
    emails: [email],
    adCopyVariants: core.adCopyVariants,
    promotionalMessages: core.promotionalMessages,
    followUpContent: core.followUpContent,
  };

  return campaignSchema.parse(assembled);
}
