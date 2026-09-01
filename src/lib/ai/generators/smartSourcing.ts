import { generateStructured } from "@/lib/ai/generate";
import { SmartSourcingPlanSchema } from "@/lib/ai/schemas";
import { buildBusinessContext } from "@/lib/ai/context";
import type { BusinessProfile } from "@prisma/client";

export interface SourcingCandidateVendor {
  name: string;
  vendorType: string;
  wholesaleStatus: string;
  city: string | null;
  state: string | null;
  lastKnownPrice?: string;
  sourcingScore?: number;
  notes: string | null;
}

export async function buildSmartSourcingPlan(
  request: string,
  candidates: SourcingCandidateVendor[],
  profile: BusinessProfile | null
) {
  const candidateBlock = candidates.length
    ? candidates
        .map(
          (c, i) =>
            `${i + 1}. ${c.name} — type: ${c.vendorType}, wholesale: ${c.wholesaleStatus}, location: ${
              [c.city, c.state].filter(Boolean).join(", ") || "unknown"
            }${c.lastKnownPrice ? `, last known price: ${c.lastKnownPrice}` : ""}${
              c.sourcingScore != null ? `, sourcing score: ${c.sourcingScore}/100` : ""
            }${c.notes ? `, notes: ${c.notes}` : ""}`
        )
        .join("\n")
    : "(none — the user's vendor database has no matching candidates yet)";

  return generateStructured({
    schema: SmartSourcingPlanSchema,
    schemaName: "SmartSourcingPlan",
    systemExtra: buildBusinessContext(profile),
    prompt: `The user made this sourcing request:
"${request}"

Here is the ONLY list of candidate vendors you may reference or rank — never invent a vendor that
isn't in this list. If it's empty or nothing fits, say so plainly in noMatchingVendorsNote and
recommend the user add vendors (from their own research or the app's reference list of well-known
national suppliers) before a real ranking is possible.

Candidate vendors:
${candidateBlock}

Understand the vehicle/part requirement, identify the likely part category, note any compatibility
uncertainty, rank the given candidates (don't invent ones not listed), explain each ranking, and be
explicit about what's uncertain (e.g. price not yet confirmed, wholesale status unverified).`,
  });
}
