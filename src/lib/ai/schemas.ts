import { z } from "zod";

export const imagePromptSchema = z
  .string()
  .describe(
    "A detailed, professional image-generation prompt for a graphic to accompany this content: subject, setting, composition, mood, and note that it should leave space for headline text if it's a social graphic."
  );

export const qualityReportSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall content quality score, 0-100"),
  breakdown: z.object({
    grammarClarity: z.number().min(0).max(100),
    brandVoiceFit: z.number().min(0).max(100),
    hookStrength: z.number().min(0).max(100),
    ctaPresence: z.number().min(0).max(100),
    platformSuitability: z.number().min(0).max(100),
    originality: z.number().min(0).max(100).describe("Low if repetitive/generic/cliché"),
  }),
  strengths: z.array(z.string()).describe("2-4 short specific strengths"),
  improvements: z
    .array(z.string())
    .describe("2-4 short, specific, actionable suggestions to improve the content"),
  flags: z
    .array(z.string())
    .describe(
      "Any potentially misleading claims, guarantees, invented facts, or platform-mismatch issues. Empty array if none."
    ),
});
export type QualityReport = z.infer<typeof qualityReportSchema>;

export const contentPillarsSchema = z.object({
  pillars: z
    .array(
      z.object({
        name: z.string().describe("Short pillar name, 2-5 words"),
        description: z.string().describe("1-2 sentences on what this pillar covers and why it matters for this business"),
      })
    )
    .min(4)
    .max(7),
});

export const socialPostSchema = z.object({
  platform: z.string(),
  hook: z.string().describe("The opening line/hook that stops the scroll"),
  body: z.string().describe("The full post copy, formatted with line breaks as it should be posted"),
  hashtags: z.array(z.string()).describe("Relevant hashtags without the # symbol, empty array if platform doesn't suit hashtags"),
  cta: z.string().describe("The specific call to action"),
  imagePrompt: imagePromptSchema,
  notes: z.string().optional().describe("Any platform-specific posting tips, e.g. best format or timing"),
});
export type SocialPost = z.infer<typeof socialPostSchema>;

export const carouselSchema = z.object({
  title: z.string(),
  slides: z
    .array(
      z.object({
        slideNumber: z.number(),
        headline: z.string(),
        body: z.string(),
      })
    )
    .min(3)
    .max(10),
  caption: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: imagePromptSchema,
});
export type CarouselContent = z.infer<typeof carouselSchema>;

export const videoScriptSchema = z.object({
  length: z.string(),
  title: z.string(),
  hook: z.string().describe("First 1-3 seconds of spoken/on-screen hook"),
  script: z
    .array(
      z.object({
        section: z.string().describe("e.g. Hook, Problem, Value, Proof, CTA"),
        voiceover: z.string().describe("Exactly what the creator should say in this section"),
        onScreenText: z.string().describe("Text overlay for this section"),
        bRoll: z.string().describe("B-roll / visual suggestion for this section"),
        cameraDirection: z.string().describe("Camera/framing direction for this section"),
      })
    )
    .min(3),
  cta: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  imagePrompt: imagePromptSchema.describe("A thumbnail/cover image prompt for this video"),
});
export type VideoScript = z.infer<typeof videoScriptSchema>;

export const hookSetSchema = z.object({
  hooks: z
    .array(
      z.object({
        style: z
          .string()
          .describe("Hook style, e.g. mistake, warning, question, surprising fact, myth, before/after, story, contrarian"),
        text: z.string(),
      })
    )
    .length(10),
});
export type HookSet = z.infer<typeof hookSetSchema>;

export const emailSchema = z.object({
  subjectLines: z.array(z.string()).min(2).max(4),
  preheader: z.string(),
  body: z.string().describe("Full email body, formatted with paragraph breaks"),
  cta: z.string(),
});
export type EmailContent = z.infer<typeof emailSchema>;

export const blogPostSchema = z.object({
  title: z.string(),
  metaDescription: z.string(),
  outline: z.array(z.string()),
  body: z.string().describe("Full blog post body in markdown"),
  cta: z.string(),
  imagePrompt: imagePromptSchema,
});
export type BlogPost = z.infer<typeof blogPostSchema>;

export const everythingPackageSchema = z.object({
  idea: z.string(),
  facebookPost: socialPostSchema,
  instagramCaption: socialPostSchema,
  instagramCarousel: carouselSchema,
  tiktokScript: videoScriptSchema,
  reelsScript: videoScriptSchema,
  youtubeShortScript: videoScriptSchema,
  linkedinPost: socialPostSchema,
  email: emailSchema,
  blogPost: blogPostSchema,
  quoteGraphicText: z.string().describe("A short, punchy standalone quote/line for a quote graphic"),
  cta: z.string().describe("A single unifying call to action for this idea across the campaign"),
  imagePrompt: imagePromptSchema,
});
export type EverythingPackage = z.infer<typeof everythingPackageSchema>;

export const calendarEntrySchema = z.object({
  day: z.number(),
  date: z.string().describe("ISO date string YYYY-MM-DD"),
  platform: z.string(),
  contentType: z.string(),
  pillar: z.string(),
  topic: z.string(),
  hook: z.string(),
  captionOrScript: z.string(),
  cta: z.string(),
  visualIdea: z.string(),
  hashtags: z.array(z.string()),
  goal: z.string().describe("One of: Awareness, Engagement, Leads, Sales, Education, Trust, Community, Promotion"),
});
export type CalendarEntry = z.infer<typeof calendarEntrySchema>;

export const calendarSchema = z.object({
  title: z.string(),
  entries: z.array(calendarEntrySchema),
});
export type CalendarContent = z.infer<typeof calendarSchema>;

export const campaignSchema = z.object({
  title: z.string(),
  strategySummary: z.string().describe("2-4 sentence overview of the campaign approach"),
  keyMessages: z.array(z.string()),
  headlines: z.array(z.string()).min(3),
  ctas: z.array(z.string()).min(3),
  socialPosts: z.array(socialPostSchema).min(3),
  videoScripts: z.array(videoScriptSchema).min(1),
  emails: z.array(emailSchema).min(1),
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
  promotionalMessages: z.array(z.string()),
  followUpContent: z.array(z.string()).describe("Post-purchase / post-lead follow-up content ideas or messages"),
});
export type CampaignContent = z.infer<typeof campaignSchema>;

export const repurposeOutputSchema = z.object({
  sourceSummary: z.string().describe("1-2 sentence summary of what the source content was about"),
  facebookPost: socialPostSchema,
  linkedinPost: socialPostSchema,
  instagramCaptions: z.array(socialPostSchema).length(3),
  tiktokIdeas: z
    .array(z.object({ concept: z.string(), hook: z.string() }))
    .length(5),
  shortFormScripts: z.array(videoScriptSchema).length(5),
  email: emailSchema,
  blogPost: blogPostSchema,
  carousel: carouselSchema,
  hooks: hookSetSchema,
});
export type RepurposeOutput = z.infer<typeof repurposeOutputSchema>;

export const improvedContentSchema = z.object({
  improved: z.string().describe("The rewritten content, ready to use, preserving the original meaning and facts"),
  changesSummary: z.array(z.string()).describe("Short bullet list of what changed and why"),
});
export type ImprovedContent = z.infer<typeof improvedContentSchema>;

export const websiteCopyBundleSchema = z.object({
  homepageHero: z.object({ headline: z.string(), subheadline: z.string(), cta: z.string() }),
  aboutSection: z.string(),
  serviceDescriptions: z.array(z.object({ name: z.string(), description: z.string() })),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(4),
});
export type WebsiteCopyBundle = z.infer<typeof websiteCopyBundleSchema>;

export const salesContentSchema = z.object({
  salesPage: z.object({
    headline: z.string(),
    subheadline: z.string(),
    body: z.string().describe("Full sales page copy in markdown with sections"),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
    cta: z.string(),
  }),
  productDescription: z.string(),
  advertisements: z
    .array(z.object({ headline: z.string(), primaryText: z.string(), cta: z.string() }))
    .min(2),
  emailCampaign: z.array(emailSchema).min(1),
  promotionalPost: socialPostSchema,
  offers: z.array(z.string()),
  followUpMessages: z.array(z.string()),
});
export type SalesContent = z.infer<typeof salesContentSchema>;

export const leadMagnetSchema = z.object({
  format: z.string(),
  title: z.string(),
  subtitle: z.string(),
  outline: z.array(z.string()),
  content: z.string().describe("Full drafted content in markdown, following the outline"),
  cta: z.string(),
  promotionalPosts: z.array(socialPostSchema).min(2),
});
export type LeadMagnetContent = z.infer<typeof leadMagnetSchema>;

export const contentIdeaSchema = z.object({
  category: z
    .string()
    .describe("One of: Educational, Promotional, Storytelling, Engagement, Behind-the-scenes, Authority-building, Customer-focused"),
  pillar: z.string(),
  idea: z.string(),
  hookAngle: z.string(),
});

export const contentIdeasSchema = z.object({
  ideas: z.array(contentIdeaSchema).min(10),
});
export type ContentIdeas = z.infer<typeof contentIdeasSchema>;
