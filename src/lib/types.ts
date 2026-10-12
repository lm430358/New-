import type { BusinessProfile } from "@prisma/client";

export const BRAND_VOICES = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "funny", label: "Funny" },
  { id: "bold", label: "Bold" },
  { id: "luxury", label: "Luxury" },
  { id: "inspirational", label: "Inspirational" },
  { id: "educational", label: "Educational" },
  { id: "conversational", label: "Conversational" },
  { id: "direct", label: "Direct" },
  { id: "playful", label: "Playful" },
  { id: "emotional", label: "Emotional" },
  { id: "storytelling", label: "Storytelling" },
  { id: "custom", label: "Create My Own Voice" },
] as const;

export type BrandVoiceId = (typeof BRAND_VOICES)[number]["id"];

export const CONTENT_GOALS = [
  "Awareness",
  "Engagement",
  "Leads",
  "Sales",
  "Education",
  "Trust",
  "Community",
  "Promotion",
] as const;

export const PLATFORMS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube / Shorts" },
  { id: "email", label: "Email" },
  { id: "blog", label: "Blog" },
  { id: "general", label: "General" },
] as const;

export const VIDEO_LENGTHS = [
  { id: "15s", label: "15 seconds", seconds: 15 },
  { id: "30s", label: "30 seconds", seconds: 30 },
  { id: "60s", label: "60 seconds", seconds: 60 },
  { id: "90s", label: "90 seconds", seconds: 90 },
  { id: "3m", label: "3 minutes", seconds: 180 },
  { id: "5m", label: "5 minutes", seconds: 300 },
  { id: "10m", label: "10 minutes", seconds: 600 },
] as const;

export const CALENDAR_LENGTHS = [7, 14, 30, 60, 90] as const;

export const LEAD_MAGNET_FORMATS = [
  { id: "ebook", label: "Ebook" },
  { id: "checklist", label: "Checklist" },
  { id: "guide", label: "Guide" },
  { id: "workbook", label: "Workbook" },
  { id: "resource_list", label: "Resource List" },
  { id: "template", label: "Template" },
  { id: "quiz", label: "Quiz" },
  { id: "free_report", label: "Free Report" },
  { id: "cheat_sheet", label: "Cheat Sheet" },
] as const;

export const CONTENT_IMPROVER_ACTIONS = [
  { id: "better", label: "Make It Better" },
  { id: "engaging", label: "Make It More Engaging" },
  { id: "shorter", label: "Make It Shorter" },
  { id: "professional", label: "Make It More Professional" },
  { id: "persuasive", label: "Make It More Persuasive" },
  { id: "emotional", label: "Make It More Emotional" },
  { id: "viral", label: "Make It Viral-Style" },
  { id: "hooks", label: "Create Better Hooks" },
  { id: "cta", label: "Add a CTA" },
  { id: "brand_voice", label: "Rewrite for My Brand Voice" },
] as const;

export function safeParseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export interface BusinessContext {
  businessName: string;
  industry: string;
  productsServices: string;
  targetAudience: string;
  brandVoice: string;
  customVoiceName?: string;
  customVoiceNotes?: string;
  voiceSamples: string[];
  location?: string;
  website?: string;
  socialAccounts: Record<string, string>;
  brandDescription?: string;
  usp?: string;
  pricingInfo?: string;
  currentPromotions?: string;
  goals: string[];
  competitors: string[];
  preferredPlatforms: string[];
  contentPillars: ContentPillar[];
}

export interface ContentPillar {
  name: string;
  description: string;
}

export function toBusinessContext(profile: BusinessProfile | null): BusinessContext {
  if (!profile) {
    return {
      businessName: "The user's business",
      industry: "General business",
      productsServices: "Not specified yet",
      targetAudience: "General audience",
      brandVoice: "conversational",
      voiceSamples: [],
      socialAccounts: {},
      goals: [],
      competitors: [],
      preferredPlatforms: [],
      contentPillars: [],
    };
  }
  return {
    businessName: profile.businessName,
    industry: profile.industry,
    productsServices: profile.productsServices,
    targetAudience: profile.targetAudience,
    brandVoice: profile.brandVoice,
    customVoiceName: profile.customVoiceName ?? undefined,
    customVoiceNotes: profile.customVoiceNotes ?? undefined,
    voiceSamples: safeParseJsonArray(profile.voiceSamples),
    location: profile.location ?? undefined,
    website: profile.website ?? undefined,
    socialAccounts: safeParseJson(profile.socialAccounts, {} as Record<string, string>),
    brandDescription: profile.brandDescription ?? undefined,
    usp: profile.usp ?? undefined,
    pricingInfo: profile.pricingInfo ?? undefined,
    currentPromotions: profile.currentPromotions ?? undefined,
    goals: safeParseJsonArray(profile.goals),
    competitors: safeParseJsonArray(profile.competitors),
    preferredPlatforms: safeParseJsonArray(profile.preferredPlatforms),
    contentPillars: safeParseJson(profile.contentPillars, [] as ContentPillar[]),
  };
}
