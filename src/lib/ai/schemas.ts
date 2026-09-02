import { z } from "zod";

export const PartIdentificationSchema = z.object({
  likelyPartCategory: z.string().describe("Best-guess general part category, e.g. 'Front brake pads'"),
  relatedSystem: z.string().describe("The vehicle system this belongs to, e.g. 'Braking system'"),
  interpretationNotes: z.string().describe("Brief plain-language explanation of how the category was identified from the query"),
  compatibilityStatement: z
    .string()
    .describe("Must always include an honest compatibility caveat — e.g. 'Compatibility needs to be verified.' when fitment isn't confirmed"),
  suggestedSearchTerms: z.array(z.string()).describe("2-6 concrete search terms/part names to use when contacting vendors or searching catalogs"),
  clarifyingQuestions: z.array(z.string()).describe("Questions to ask the user if the query was ambiguous (empty array if not needed)"),
});
export type PartIdentification = z.infer<typeof PartIdentificationSchema>;

export const ResellOpportunitySchema = z.object({
  opportunities: z.array(
    z.object({
      category: z.string(),
      rationale: z.string().describe("Why this category may be worth reselling, grounded in the signals given"),
      demandSignal: z.string().describe("Qualitative demand reasoning, e.g. common wear item on popular models"),
      estimatedMarginRangePct: z.string().describe("A labeled estimate range like '15-30% (estimate, not guaranteed)'"),
      risks: z.array(z.string()),
      caution: z.string().describe("Always include a caution that this is an estimate, not a profitability guarantee"),
    })
  ),
  overallCaveat: z.string().describe("Standing reminder that these are estimates based on general patterns, not verified market data or guaranteed profits"),
});
export type ResellOpportunities = z.infer<typeof ResellOpportunitySchema>;

export const VendorContactMessageSchema = z.object({
  subject: z.string(),
  body: z.string().describe("Professional email/message body the user can review and edit before sending"),
});
export type VendorContactMessageDraft = z.infer<typeof VendorContactMessageSchema>;

export const SmartSourcingPlanSchema = z.object({
  interpretation: z.string().describe("Plain-language restatement of what vehicle/part/quantity was requested"),
  identifiedPartCategory: z.string(),
  compatibilityStatement: z.string(),
  rankedOptions: z.array(
    z.object({
      vendorName: z.string().describe("Must be a vendor name that was actually provided in the candidate list, never invented"),
      rank: z.number().int(),
      reasoning: z.string(),
      estimatedUnitCost: z.string().describe("A dollar estimate string, or 'unknown — not in provided price data' if not available"),
      uncertainties: z.array(z.string()),
    })
  ),
  totalEstimatedCostNote: z.string().describe("Explain total cost estimate and its uncertainty, or state it cannot be computed without more price data"),
  noMatchingVendorsNote: z.string().describe("If the candidate vendor list was empty or none fit, say so plainly here; otherwise empty string"),
  overallRecommendation: z.string(),
});
export type SmartSourcingPlan = z.infer<typeof SmartSourcingPlanSchema>;
