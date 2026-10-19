"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { calculateBulkOpportunity } from "@/lib/profit";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function BulkBuyingCalculator() {
  const [unitsInLot, setUnitsInLot] = useState("50");
  const [lotPrice, setLotPrice] = useState("1500");
  const [shippingCost, setShippingCost] = useState("120");
  const [storageCostTotal, setStorageCostTotal] = useState("0");
  const [singleUnitPrice, setSingleUnitPrice] = useState("45");
  const [expectedSellThroughUnits, setExpectedSellThroughUnits] = useState("40");
  const [expectedSellPricePerUnit, setExpectedSellPricePerUnit] = useState("65");

  const result = useMemo(
    () =>
      calculateBulkOpportunity({
        unitsInLot: Number(unitsInLot) || 0,
        lotPrice: Number(lotPrice) || 0,
        shippingCost: Number(shippingCost) || 0,
        storageCostTotal: Number(storageCostTotal) || 0,
        singleUnitPrice: Number(singleUnitPrice) || 0,
        expectedSellThroughUnits: Number(expectedSellThroughUnits) || 0,
        expectedSellPricePerUnit: expectedSellPricePerUnit ? Number(expectedSellPricePerUnit) : undefined,
      }),
    [unitsInLot, lotPrice, shippingCost, storageCostTotal, singleUnitPrice, expectedSellThroughUnits, expectedSellPricePerUnit]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <Card>
        <CardHeader><CardTitle>Bulk lot details</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Field label="Units in the lot"><Input type="number" value={unitsInLot} onChange={(e) => setUnitsInLot(e.target.value)} /></Field>
          <Field label="Total lot price (USD)"><Input type="number" value={lotPrice} onChange={(e) => setLotPrice(e.target.value)} /></Field>
          <Field label="Shipping cost for the lot (USD)"><Input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} /></Field>
          <Field label="Extra storage cost, if any (USD)"><Input type="number" value={storageCostTotal} onChange={(e) => setStorageCostTotal(e.target.value)} /></Field>
          <Field label="Normal per-unit price sourced individually (USD)"><Input type="number" value={singleUnitPrice} onChange={(e) => setSingleUnitPrice(e.target.value)} /></Field>
          <Field label="Units you realistically expect to sell/use" hint="Leftover units are 'dead stock' — capital tied up unsold"><Input type="number" value={expectedSellThroughUnits} onChange={(e) => setExpectedSellThroughUnits(e.target.value)} /></Field>
          <Field label="If reselling: expected sell price per unit (USD, optional)"><Input type="number" value={expectedSellPricePerUnit} onChange={(e) => setExpectedSellPricePerUnit(e.target.value)} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Does this bulk buy make sense?</CardTitle></CardHeader>
        <CardBody className="space-y-3 text-sm">
          <Row label="Total lot cost" value={formatCurrency(result.totalLotCost)} />
          <Row label="Effective cost per unit" value={formatCurrency(result.perUnitBulkCost)} />
          <Row label="Savings vs. buying individually" value={`${formatCurrency(result.perUnitSavings)} / unit (${result.savingsPct.toFixed(1)}%)`} emphasize={result.perUnitSavings >= 0 ? "success" : "danger"} />
          <Row label="Projected dead stock" value={`${result.deadStockUnits} unit(s), ${formatCurrency(result.capitalAtRisk)} tied up`} emphasize={result.deadStockUnits > 0 ? "danger" : undefined} />
          {result.projectedResaleProfit != null && (
            <Row label="Projected resale profit on sell-through units" value={formatCurrency(result.projectedResaleProfit)} emphasize={result.projectedResaleProfit >= 0 ? "success" : "danger"} />
          )}
          <div className="pt-2 border-t border-[var(--border)]">
            {result.deadStockUnits > 0 ? (
              <Badge tone="warning">Some capital will likely sit in unsold inventory — factor in storage/carrying cost and time-to-sell risk.</Badge>
            ) : (
              <Badge tone="success">Expected sell-through covers the full lot.</Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            This is a planning estimate based on the numbers you entered — not a guarantee of actual
            sell-through, resale price, or profit.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: "success" | "danger" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={`font-semibold ${emphasize === "success" ? "text-emerald-600" : emphasize === "danger" ? "text-red-600" : ""}`}>{value}</span>
    </div>
  );
}
