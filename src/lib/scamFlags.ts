import type { ScamFlagResult } from "@/lib/types";

export interface VendorForFlagging {
  website: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  returnPolicy: string | null;
  warrantyInfo: string | null;
  accountRequirements: string | null;
  notes: string | null;
  sourceType: string;
}

/**
 * Deterministic, explainable checks for common vendor red flags (Section 20).
 * This never accuses a vendor of fraud outright — it only surfaces which
 * specific signals are missing/present so the user can decide.
 */
export function detectScamFlags(v: VendorForFlagging): ScamFlagResult {
  const flags: string[] = [];

  if (!v.website) flags.push("No website on file.");
  if (!v.phone && !v.email) flags.push("No phone number or email on file.");
  if (!v.street) flags.push("No physical business address on file.");
  if (!v.returnPolicy) flags.push("No return policy recorded.");
  if (!v.warrantyInfo) flags.push("No warranty information recorded.");
  if (v.sourceType === "ai_suggested_unverified") {
    flags.push("This vendor came from an AI suggestion and has not been independently verified yet.");
  }

  const notesLower = (v.notes ?? "").toLowerCase();
  const paymentRedFlags = ["wire transfer only", "gift card", "crypto only", "cash app only", "zelle only", "no invoice"];
  for (const term of paymentRedFlags) {
    if (notesLower.includes(term)) flags.push(`Notes mention "${term}" — unusual/high-risk payment requests are a common scam pattern.`);
  }
  if (notesLower.includes("pay now") || notesLower.includes("price expires today") || notesLower.includes("act now")) {
    flags.push("Notes mention pressure to pay immediately — a common high-pressure scam tactic.");
  }

  let riskLevel: ScamFlagResult["riskLevel"] = "low";
  if (flags.length >= 4) riskLevel = "high";
  else if (flags.length >= 2) riskLevel = "medium";

  const summary =
    flags.length === 0
      ? "No common red flags detected based on the information recorded — this is not a guarantee of legitimacy, just an absence of the warning signs this checklist looks for."
      : "This vendor could not be sufficiently verified based on the information recorded. Proceed with caution and verify identity, return policy, and payment terms directly before purchasing.";

  return { flags, riskLevel, summary };
}
