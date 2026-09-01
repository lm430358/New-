import { generateStructured } from "@/lib/ai/generate";
import { PartIdentificationSchema } from "@/lib/ai/schemas";
import { buildBusinessContext } from "@/lib/ai/context";
import type { BusinessProfile } from "@prisma/client";

export interface PartSearchInput {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  vin?: string;
  vinDecoded?: string; // human-readable decoded VIN summary, if looked up
  partName?: string;
  partNumber?: string;
  oemPartNumber?: string;
  aftermarketNumber?: string;
  symptoms?: string;
  rawQuery?: string;
}

export async function identifyPart(input: PartSearchInput, profile: BusinessProfile | null) {
  const lines = Object.entries(input)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  return generateStructured({
    schema: PartIdentificationSchema,
    schemaName: "PartIdentification",
    systemExtra: buildBusinessContext(profile),
    prompt: `A user is searching for an automotive part. Identify the most likely part category and
related vehicle system from the details below. Only state compatibility/fitment is confirmed if the
year/make/model/engine/part number given is specific enough to be reasonably confident — otherwise,
your compatibilityStatement MUST say "Compatibility needs to be verified." (optionally with more
detail about what's missing). Do not invent a specific part number if one wasn't given.

Search details:
${lines || "(no structured fields — see raw query)"}
`,
  });
}
