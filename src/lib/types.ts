export const VENDOR_TYPES = [
  { value: "wholesale_distributor", label: "Wholesale Distributor" },
  { value: "oem_supplier", label: "OEM Supplier" },
  { value: "aftermarket_supplier", label: "Aftermarket Supplier" },
  { value: "local_distributor", label: "Local Auto-Parts Distributor" },
  { value: "salvage_recycled", label: "Salvage / Recycled Parts" },
  { value: "specialty", label: "Specialty Supplier" },
  { value: "performance", label: "Performance Supplier" },
  { value: "fleet_supplier", label: "Fleet Supplier" },
  { value: "heavy_duty", label: "Heavy-Duty Supplier" },
  { value: "dealership", label: "Dealership Parts Department" },
  { value: "unknown", label: "Other / Unknown" },
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number]["value"];

export const SUPPLY_KINDS = ["oem", "aftermarket", "wholesale", "used", "specialty", "mixed"] as const;
export type SupplyKind = (typeof SUPPLY_KINDS)[number];

export const VENDOR_STATUSES = [
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "purchased", label: "Purchased" },
  { value: "do_not_use", label: "Do Not Use" },
] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number]["value"];

export const CONDITION_PREFS = ["new", "used", "either"] as const;
export const SOURCING_PREFS = ["oem", "aftermarket", "either"] as const;

export interface ScamFlagResult {
  flags: string[];
  riskLevel: "low" | "medium" | "high";
  summary: string;
}

export interface SourcingScoreResult {
  score: number; // 0-100
  factors: { label: string; points: number; maxPoints: number; explanation: string }[];
  summary: string;
}

export interface ProfitResult {
  totalCost: number;
  grossProfit: number;
  grossMarginPct: number;
  markupPct: number;
}
