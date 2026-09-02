import type { BusinessProfile } from "@prisma/client";
import { safeJsonParse } from "@/lib/utils";

/**
 * Non-negotiable accuracy rules (Section 24 of the brief), injected into
 * every AI call in this app so they can't be dropped or diluted by a
 * feature-specific prompt.
 */
export const ACCURACY_RULES = `
You are the AI engine behind an automotive parts sourcing & vendor tool for real businesses (repair
shops, mobile mechanics, resellers, fleets, dealerships). You must NEVER:
- Fabricate vendors, vendor details, prices, inventory, availability, part numbers, warranties, or
  wholesale terms.
- Claim vehicle part compatibility/fitment is confirmed unless the data actually supports it. If you
  cannot confirm fitment, say plainly: "Compatibility needs to be verified."
- Guarantee vehicle fitment, profits, or vendor legitimacy.
- State a vendor is fraudulent/a scam outright. If a vendor looks unverifiable or risky, say:
  "This vendor could not be sufficiently verified. Proceed with caution."

You only know about vendors, prices, and part numbers that are given to you in the conversation
context (from the app's own database, a small reference list of well-known national suppliers, or
the user themselves). If asked about something not present in that context, say clearly that it is
not available/verified rather than inventing plausible-sounding details. When you're uncertain,
label the output as an estimate or a "potential match — verify before purchasing" rather than stating
it as fact.
`.trim();

export function buildBusinessContext(profile: BusinessProfile | null): string {
  if (!profile) {
    return "No business profile has been set up yet. Ask the user general questions if needed, but proceed helpfully with what they give you in this request.";
  }
  const preferredSuppliers = safeJsonParse<string[]>(profile.preferredSuppliers, []);
  const preferredBrands = safeJsonParse<string[]>(profile.preferredBrands, []);

  const roleTags = [
    profile.isRepairShop && "repair shop",
    profile.isMobileMechanic && "mobile mechanic",
    profile.resellsParts && "parts reseller",
    profile.operatesFleet && "fleet operator",
    profile.isDealership && "dealership",
  ].filter(Boolean);

  return `
Business profile for this workspace:
- Name: ${profile.businessName}
- Type: ${profile.businessType ?? "not set"}
- Roles: ${roleTags.length ? roleTags.join(", ") : "not specified"}
- Location: ${[profile.city, profile.state].filter(Boolean).join(", ") || "not set"}
- Industry: ${profile.industry ?? "not set"}
- Monthly parts budget: ${profile.monthlyPartsBudget != null ? `$${profile.monthlyPartsBudget}` : "not set"}
- Preferred suppliers: ${preferredSuppliers.length ? preferredSuppliers.join(", ") : "none set"}
- Preferred brands: ${preferredBrands.length ? preferredBrands.join(", ") : "none set"}
- Condition preference: ${profile.conditionPref}
- OEM/aftermarket preference: ${profile.sourcingPref}

Use this to tailor recommendations (e.g. prioritize wholesale/trade options for a repair shop or
reseller, flag budget fit, prefer their preferred suppliers/brands when relevant) without assuming
facts about their business beyond what's listed here.
`.trim();
}
