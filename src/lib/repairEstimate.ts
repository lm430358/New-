/**
 * Repair job price estimator — a transparent, rule-based quote calculator for
 * a mobile mechanic / repair shop. Every line item is shown separately so the
 * shop can see exactly why a number came out the way it did and adjust any
 * rate to match their own business, instead of trusting an opaque total.
 *
 * This is deterministic math over numbers the user enters — never an AI
 * guess — consistent with the rest of the app's "never fabricate a number"
 * rule. It is a planning estimate, not a binding quote: the UI always says so.
 */

export const LIABILITY_CUTOFF_YEAR = 1980;

export interface RepairEstimateInput {
  // Vehicle
  year: number | null;
  make: string;
  model: string;
  engineSize: "4cyl" | "6cyl" | "8cyl-plus";
  brakeType: "hydraulic" | "electronic";
  hasRust: boolean;
  starts: boolean;
  lastServiceDate: string | null; // ISO date string, optional

  // Job
  laborHours: number;
  laborRatePerHour: number;
  includeDiagnostic: boolean;

  // Travel (distance from shop's base, e.g. East-West Connector)
  distanceMiles: number;
  freeRadiusMiles: number;
  ratePerMileBeyondRadius: number;

  // Flat-fee rates (shop-configurable — defaults below are starting points,
  // not prescribed prices)
  diagnosticFee: number;
  rustSurcharge: number;
  nonRunningSurcharge: number;
  liabilitySurcharge: number;
  electronicBrakeSurcharge: number;
}

export const DEFAULT_REPAIR_ESTIMATE_RATES = {
  laborRatePerHour: 95,
  freeRadiusMiles: 10,
  ratePerMileBeyondRadius: 2.5,
  diagnosticFee: 125,
  rustSurcharge: 40,
  nonRunningSurcharge: 50,
  liabilitySurcharge: 75,
  electronicBrakeSurcharge: 25,
};

const ENGINE_SIZE_LABOR_MULTIPLIER: Record<RepairEstimateInput["engineSize"], number> = {
  "4cyl": 1,
  "6cyl": 1.1,
  "8cyl-plus": 1.2,
};

export interface RepairEstimateLineItem {
  label: string;
  amount: number;
  detail: string;
}

export interface RepairEstimateResult {
  lineItems: RepairEstimateLineItem[];
  subtotal: number;
  travelFee: number;
  total: number;
  advisories: string[];
  isLiabilityVehicle: boolean;
}

export function calculateRepairEstimate(input: RepairEstimateInput): RepairEstimateResult {
  const lineItems: RepairEstimateLineItem[] = [];
  const advisories: string[] = [];

  const engineMultiplier = ENGINE_SIZE_LABOR_MULTIPLIER[input.engineSize];
  const adjustedHours = Math.max(0, input.laborHours) * engineMultiplier;
  const laborCost = adjustedHours * Math.max(0, input.laborRatePerHour);
  lineItems.push({
    label: "Labor",
    amount: laborCost,
    detail: `${input.laborHours} hr × ${engineMultiplier}x (${input.engineSize}) × $${input.laborRatePerHour}/hr`,
  });

  if (input.includeDiagnostic) {
    lineItems.push({
      label: "Diagnostic fee",
      amount: input.diagnosticFee,
      detail: "Recommended for all vehicles before work begins",
    });
  }

  if (input.hasRust) {
    lineItems.push({
      label: "Rust / seized-fastener surcharge",
      amount: input.rustSurcharge,
      detail: "Extra time expected freeing corroded bolts/fasteners",
    });
    advisories.push("Vehicle has rust — budget extra time for seized fasteners; note this to the customer up front.");
  }

  if (!input.starts) {
    lineItems.push({
      label: "Non-running vehicle fee",
      amount: input.nonRunningSurcharge,
      detail: "Vehicle does not start — extra handling/diagnosis time",
    });
    advisories.push("Vehicle does not start — confirm access/power needs before the visit, and whether this is in addition to the diagnosed job.");
  }

  const isLiabilityVehicle = input.year != null && input.year < LIABILITY_CUTOFF_YEAR;
  if (isLiabilityVehicle) {
    lineItems.push({
      label: `Pre-${LIABILITY_CUTOFF_YEAR} liability surcharge`,
      amount: input.liabilitySurcharge,
      detail: `Vehicle is older than ${LIABILITY_CUTOFF_YEAR}`,
    });
    advisories.push(
      `This vehicle is older than ${LIABILITY_CUTOFF_YEAR} — our policy treats these as higher-liability jobs. Consider a signed waiver and confirm parts availability before committing to a price.`
    );
  }

  if (input.brakeType === "electronic") {
    lineItems.push({
      label: "Electronic parking brake surcharge",
      amount: input.electronicBrakeSurcharge,
      detail: "Needs a brake-reset/retraction procedure most hydraulic jobs don't",
    });
    advisories.push("Vehicle has an electronic parking brake — confirm you have the reset tool/procedure for this make before the appointment.");
  }

  if (input.lastServiceDate) {
    const days = Math.floor((Date.now() - new Date(input.lastServiceDate).getTime()) / 86400000);
    if (Number.isFinite(days) && days >= 0) {
      if (days > 180) {
        advisories.push(
          `Last service/oil change was ${days} days ago — overdue for routine maintenance. Consider recommending an oil change or multi-point inspection alongside this job.`
        );
      }
    }
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);

  const billableMiles = Math.max(0, input.distanceMiles - input.freeRadiusMiles);
  const travelFee = billableMiles * Math.max(0, input.ratePerMileBeyondRadius);
  if (travelFee > 0) {
    advisories.push(
      `Travel fee applies — ${billableMiles.toFixed(1)} mile(s) beyond the ${input.freeRadiusMiles}-mile free radius.`
    );
  }

  const total = subtotal + travelFee;

  return { lineItems, subtotal, travelFee, total, advisories, isLiabilityVehicle };
}
