import { generateStructured } from "@/lib/ai/generate";
import { VendorContactMessageSchema } from "@/lib/ai/schemas";
import { buildBusinessContext } from "@/lib/ai/context";
import type { BusinessProfile, Vendor } from "@prisma/client";

export type ContactPurpose = "wholesale_inquiry" | "availability" | "general";

export async function draftVendorMessage(
  vendor: Vendor,
  purpose: ContactPurpose,
  profile: BusinessProfile | null,
  extraContext?: string
) {
  const purposeText: Record<ContactPurpose, string> = {
    wholesale_inquiry:
      "Ask about wholesale/trade pricing, opening a dealer/reseller/repair-shop account, minimum order requirements, and payment terms.",
    availability:
      "Ask about current availability, lead time, and shipping for a specific part.",
    general:
      "A general introductory inquiry covering availability, wholesale pricing, minimum order, shipping, warranty, and return policy.",
  };

  return generateStructured({
    schema: VendorContactMessageSchema,
    schemaName: "VendorContactMessage",
    systemExtra: buildBusinessContext(profile),
    prompt: `Draft a short, professional inquiry message from this business to the vendor below.
Purpose: ${purposeText[purpose]}
${extraContext ? `Additional context from the user: ${extraContext}` : ""}

Vendor: ${vendor.name} (${vendor.vendorType})
${vendor.website ? `Website: ${vendor.website}` : ""}

The message should ask about whichever of the following are relevant and not already known: wholesale
pricing, dealer/reseller/repair-shop account setup, availability, minimum order, shipping, warranty,
return policy, and payment terms. Keep it concise (under 180 words), polite, and businesslike. This
is a DRAFT the user will review and edit before sending themselves — do not include any promise to
purchase or any information you don't actually have.`,
  });
}
