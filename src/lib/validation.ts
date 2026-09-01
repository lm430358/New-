import { z } from "zod";

export const businessProfileInputSchema = z.object({
  id: z.string().optional(),
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  productsServices: z.string().min(1, "Tell us what you offer"),
  targetAudience: z.string().min(1, "Target audience is required"),
  brandVoice: z.string().min(1),
  customVoiceName: z.string().optional(),
  customVoiceNotes: z.string().optional(),
  voiceSamples: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  website: z.string().optional(),
  socialAccounts: z.record(z.string(), z.string()).optional().default({}),
  brandDescription: z.string().optional(),
  usp: z.string().optional(),
  pricingInfo: z.string().optional(),
  currentPromotions: z.string().optional(),
  goals: z.array(z.string()).optional().default([]),
  competitors: z.array(z.string()).optional().default([]),
  preferredPlatforms: z.array(z.string()).optional().default([]),
});
export type BusinessProfileInput = z.infer<typeof businessProfileInputSchema>;
