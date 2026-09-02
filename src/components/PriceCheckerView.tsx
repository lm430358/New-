"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PriceCheck } from "@prisma/client";

type Row = PriceCheck & { vendor: { id: string; name: string } };

export function PriceCheckerView() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(query = "") {
    setLoading(true);
    const res = await fetch(`/api/price-checks${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const data = await res.json();
    setRows(data.priceChecks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, []);

  const sorted = [...rows].sort((a, b) => (a.totalCost ?? Infinity) - (b.totalCost ?? Infinity));

  return (
    <div className="space-y-4 max-w-6xl">
      <Card>
        <CardBody className="flex gap-2">
          <Input placeholder="Search by part, part number, or brand…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(q)} />
          <Button type="button" onClick={() => load(q)}>Search</Button>
          <Link href="/vendors" className="ml-auto"><Button type="button" variant="secondary">Log a price check on a vendor →</Button></Link>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading…</p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No price checks logged yet. Prices shown here are only ones you or a verified check actually recorded — nothing is fetched live.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-2 pr-4">Vendor</th>
                  <th className="py-2 pr-4">Part</th>
                  <th className="py-2 pr-4">Brand</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Shipping</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Availability</th>
                  <th className="py-2 pr-4">Warranty</th>
                  <th className="py-2 pr-4">Checked</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4"><Link href={`/vendors/${r.vendor.id}`} className="text-[var(--brand)] font-medium">{r.vendor.name}</Link></td>
                    <td className="py-2 pr-4">{r.partDescription}{r.partNumber ? ` (${r.partNumber})` : ""}</td>
                    <td className="py-2 pr-4">{r.brand ?? "—"}</td>
                    <td className="py-2 pr-4">{formatCurrency(r.price)}</td>
                    <td className="py-2 pr-4">{formatCurrency(r.shippingCost)}</td>
                    <td className="py-2 pr-4 font-semibold">{formatCurrency(r.totalCost)}</td>
                    <td className="py-2 pr-4">{r.availability ?? "—"}</td>
                    <td className="py-2 pr-4">{r.warranty ?? "—"}</td>
                    <td className="py-2 pr-4 text-[var(--text-muted)]">{formatDateTime(r.checkedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Prices can change — each row shows exactly when it was checked, and is sorted by lowest
            total estimated cost.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
