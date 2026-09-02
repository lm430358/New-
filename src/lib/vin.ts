/**
 * VIN decoding via the NHTSA vPIC API — a real, free, keyless, public U.S.
 * government vehicle-information service (https://vpic.nhtsa.dot.gov/api/).
 * We never fabricate VIN data: if the API can't decode a field, it comes
 * back blank and we pass that through as-is.
 */

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export interface DecodedVin {
  vin: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  series?: string;
  bodyClass?: string;
  engineCylinders?: string;
  engineDisplacementL?: string;
  engineModel?: string;
  fuelType?: string;
  driveType?: string;
  transmissionStyle?: string;
  plantCountry?: string;
  errorCode?: string;
  errorText?: string;
  raw: Record<string, string | null>;
}

const FIELD_MAP: Record<string, keyof DecodedVin> = {
  "Model Year": "year",
  Make: "make",
  Model: "model",
  Trim: "trim",
  Series: "series",
  "Body Class": "bodyClass",
  "Engine Number of Cylinders": "engineCylinders",
  "Displacement (L)": "engineDisplacementL",
  "Engine Model": "engineModel",
  "Fuel Type - Primary": "fuelType",
  "Drive Type": "driveType",
  "Transmission Style": "transmissionStyle",
  "Plant Country": "plantCountry",
  "Error Code": "errorCode",
  "Error Text": "errorText",
};

export async function decodeVin(vin: string): Promise<DecodedVin> {
  const cleanVin = vin.trim().toUpperCase();
  const url = `${VPIC_BASE}/decodevinvalues/${encodeURIComponent(cleanVin)}?format=json`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`NHTSA vPIC lookup failed (${res.status})`);
  }
  const json = (await res.json()) as { Results?: Record<string, string | null>[] };
  const row = json.Results?.[0] ?? {};

  const decoded: DecodedVin = { vin: cleanVin, raw: row };
  for (const [nhtsaKey, ourKey] of Object.entries(FIELD_MAP)) {
    const value = row[nhtsaKey];
    if (value && value !== "Not Applicable") {
      (decoded[ourKey] as string | undefined) = value;
    }
  }
  return decoded;
}

export function isPlausibleVin(vin: string): boolean {
  const v = vin.trim().toUpperCase();
  // 17 chars, no I/O/Q (real VIN rule), alphanumeric.
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
}
