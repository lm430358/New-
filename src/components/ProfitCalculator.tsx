"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { calculateProfit } from "@/lib/profit";
import { formatCurrency } from "@/lib/utils";

export function ProfitCalculator() {
  const [purchaseCost, setPurchaseCost] = useState("80");
  const [shipping, setShipping] = useState("10");
  const [otherCosts, setOtherCosts] = useState("0");
  const [sellingPrice, setSellingPrice] = useState("140");

  const result = useMemo(
    () =>
      calculateProfit({
        purchaseCost: Number(purchaseCost) || 0,
        shipping: Number(shipping) || 0,
        otherCosts: Number(otherCosts) || 0,
        sellingPrice: Number(sellingPrice) || 0,
      }),
    [purchaseCost, shipping, otherCosts, sellingPrice]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <Card>
        <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Field label="Purchase cost (USD)"><Input type="number" step="0.01" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} /></Field>
          <Field label="Shipping (USD)"><Input type="number" step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} /></Field>
          <Field label="Other costs (USD)" hint="Fees, packaging, labor, etc."><Input type="number" step="0.01" value={otherCosts} onChange={(e) => setOtherCosts(e.target.value)} /></Field>
          <Field label="Selling price (USD)"><Input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Result</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          <Row label="Total cost" value={formatCurrency(result.totalCost)} />
          <Row label="Gross profit" value={formatCurrency(result.grossProfit)} emphasize={result.grossProfit >= 0 ? "success" : "danger"} />
          <Row label="Gross margin" value={`${result.grossMarginPct.toFixed(1)}%`} hint="Profit as a % of the selling price" />
          <Row label="Markup" value={`${result.markupPct.toFixed(1)}%`} hint="Profit as a % of your total cost" />
          <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            Margin and markup are frequently confused: margin is profit ÷ selling price; markup is
            profit ÷ cost. They will always differ unless profit is zero.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value, hint, emphasize }: { label: string; value: string; hint?: string; emphasize?: "success" | "danger" }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        {hint && <p className="text-[11px] text-[var(--text-muted)]">{hint}</p>}
      </div>
      <p className={`text-lg font-semibold ${emphasize === "success" ? "text-emerald-600" : emphasize === "danger" ? "text-red-600" : ""}`}>{value}</p>
    </div>
  );
}
