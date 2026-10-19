import type { ProfitResult } from "@/lib/types";

/**
 * Purchase cost + shipping + other costs = total cost.
 * Gross profit = selling price - total cost.
 * Gross margin = gross profit / selling price (profit as a % of what the customer paid).
 * Markup = gross profit / total cost (profit as a % of what it cost you).
 * These are frequently confused, so both are always shown together.
 */
export function calculateProfit(input: {
  purchaseCost: number;
  shipping: number;
  otherCosts: number;
  sellingPrice: number;
}): ProfitResult {
  const totalCost = input.purchaseCost + input.shipping + input.otherCosts;
  const grossProfit = input.sellingPrice - totalCost;
  const grossMarginPct = input.sellingPrice > 0 ? (grossProfit / input.sellingPrice) * 100 : 0;
  const markupPct = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  return { totalCost, grossProfit, grossMarginPct, markupPct };
}

/** Bulk-buy math: is the per-unit price break worth the larger upfront spend? */
export function calculateBulkOpportunity(input: {
  unitsInLot: number;
  lotPrice: number;
  shippingCost: number;
  singleUnitPrice: number; // what one unit normally costs sourced individually
  expectedSellThroughUnits: number; // how many units you realistically expect to sell/use
  expectedSellPricePerUnit?: number; // optional, for resellers
  storageCostTotal?: number;
}) {
  const totalLotCost = input.lotPrice + input.shippingCost + (input.storageCostTotal ?? 0);
  const perUnitBulkCost = input.unitsInLot > 0 ? totalLotCost / input.unitsInLot : 0;
  const perUnitSavings = input.singleUnitPrice - perUnitBulkCost;
  const savingsPct = input.singleUnitPrice > 0 ? (perUnitSavings / input.singleUnitPrice) * 100 : 0;
  const deadStockUnits = Math.max(0, input.unitsInLot - input.expectedSellThroughUnits);
  const capitalAtRisk = deadStockUnits * perUnitBulkCost;

  let projectedResaleProfit: number | null = null;
  if (input.expectedSellPricePerUnit !== undefined) {
    projectedResaleProfit =
      input.expectedSellThroughUnits * (input.expectedSellPricePerUnit - perUnitBulkCost);
  }

  return {
    totalLotCost,
    perUnitBulkCost,
    perUnitSavings,
    savingsPct,
    deadStockUnits,
    capitalAtRisk,
    projectedResaleProfit,
  };
}
