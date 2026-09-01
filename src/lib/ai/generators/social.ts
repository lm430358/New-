import { generateStructured } from "../generate";
import { buildSystemPrompt } from "../context";
import { socialPostSchema, carouselSchema, hookSetSchema, type SocialPost, type CarouselContent, type HookSet } from "../schemas";
import type { BusinessContext } from "@/lib/types";

const PLATFORM_STYLE: Record<string, string> = {
  facebook:
    "Facebook: written for conversation and shareability among an older, local, community-minded audience. Slightly longer is fine. Ask a genuine question or invite comments. Minimal to no hashtags.",
  instagram:
    "Instagram: visual-first, punchy caption with a strong first line (it gets cut off), line breaks for readability, warm/aspirational tone, 3-8 relevant hashtags at the end.",
  "instagram-story":
    "Instagram Story: extremely short, single idea, casual and immediate, written to sit over an image/video with a poll/question sticker style CTA if relevant.",
  "instagram-reel":
    "Instagram Reels caption: short, hook-first caption that complements a video, casual tone, 3-6 hashtags.",
  tiktok:
    "TikTok: short, native, no corporate tone, written like a real person talking to camera. Minimal hashtags (2-4), often niche + broad mix.",
  linkedin:
    "LinkedIn: professional but human, leads with a business insight, lesson, or result — not a sales pitch. Short paragraphs, no more than 1-2 hashtags, ends with a discussion-style CTA or clear professional CTA.",
  youtube:
    "YouTube / Shorts: caption supports searchability — include a clear, keyword-relevant description line plus a CTA to subscribe or watch more.",
  email: "Email: written to be read in an inbox, not scrolled past — this field is unused for email pieces.",
  blog: "Blog: written to be read in an inbox, not scrolled past — this field is unused for blog pieces.",
  general: "General-purpose post suitable for a website or unspecified channel — clear, platform-neutral.",
};

export async function generateSocialPost(
  ctx: BusinessContext,
  params: { platform: string; topic: string; goal?: string }
): Promise<SocialPost> {
  const styleGuide = PLATFORM_STYLE[params.platform] ?? PLATFORM_STYLE.general;
  const system = buildSystemPrompt(
    ctx,
    `Write ONE ${params.platform} post about the topic below. Adapt fully to this platform's real style and norms — never repurpose another platform's copy verbatim.\n\nPLATFORM STYLE GUIDE: ${styleGuide}${
      params.goal ? `\n\nThis post's primary goal is: ${params.goal}. Make sure the CTA matches that goal.` : ""
    }`
  );
  return generateStructured({
    system,
    prompt: `TOPIC / IDEA: ${params.topic}`,
    schema: socialPostSchema,
    effort: "medium",
    maxTokens: 3000,
  });
}

export async function generateCarousel(
  ctx: BusinessContext,
  params: { topic: string; slideCount?: number }
): Promise<CarouselContent> {
  const system = buildSystemPrompt(
    ctx,
    `Build an Instagram/LinkedIn carousel outline (${params.slideCount ?? "5-8"} slides) about the topic below. Slide 1 must hook hard. Each slide should carry one clear idea with a short headline and supporting body text a designer could drop straight into Canva. The final slide should include the CTA.`
  );
  return generateStructured({
    system,
    prompt: `TOPIC / IDEA: ${params.topic}`,
    schema: carouselSchema,
    effort: "medium",
    maxTokens: 3000,
  });
}

export async function generateHooks(
  ctx: BusinessContext,
  params: { topic: string }
): Promise<HookSet> {
  const system = buildSystemPrompt(
    ctx,
    "Write exactly 10 different short-form video hooks for the topic below. Each hook must use a genuinely different style/angle (vary across: mistake, warning, question, surprising fact, problem, myth, before/after, story, demonstration, comparison, contrarian insight) — never repeat a style. Each hook is the first spoken/on-screen line of a video, 1-2 sentences max, designed to stop the scroll. No misleading claims."
  );
  return generateStructured({
    system,
    prompt: `TOPIC: ${params.topic}`,
    schema: hookSetSchema,
    effort: "medium",
    maxTokens: 2500,
  });
}
