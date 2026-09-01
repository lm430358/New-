import { generateStructured } from "@/lib/ai/generate";
import { ResellOpportunitySchema } from "@/lib/ai/schemas";
import { buildBusinessContext } from "@/lib/ai/context";
import type { BusinessProfile } from "@prisma/client";

export async function findResellOpportunities(
  input: { focusArea?: string; localMarket?: string },
  profile: BusinessProfile | null
) {
  return generateStructured({
    schema: ResellOpportunitySchema,
    schemaName: "ResellOpportunities",
    systemExtra: buildBusinessContext(profile),
    prompt: `Suggest 4-6 general categories of automotive parts that may be reasonable resale
opportunities for this business, reasoning from well-known general patterns (common wear items,
popular/high-volume vehicle platforms, typical demand seasonality, shipping-cost-to-value ratio,
how saturated a category typically is). ${input.focusArea ? `Focus area requested: ${input.focusArea}.` : ""}
${input.localMarket ? `Local market context: ${input.localMarket}.` : ""}

These are directional, educational estimates only — never state a guaranteed profit or claim
verified current market data. Every opportunity must include realistic risks/caveats.`,
  });
}
