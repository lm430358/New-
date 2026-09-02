"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { computeSourcingScore, matchPreferences } from "@/lib/sourcingScore";
import { formatCurrency, safeJsonParse } from "@/lib/utils";
import type { BusinessProfile, Vendor, PriceCheck } from "@prisma/client";

type VendorFull = Vendor & { priceChecks?: PriceCheck[] };

export function VendorCompare() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, VendorFull>>({});
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors ?? []));
    fetch("/api/business-profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null));
  }, []);

  useEffect(() => {
    selected.forEach(async (id) => {
      if (details[id]) return;
      const res = await fetch(`/api/vendors/${id}`);
      const data = await res.json();
      setDetails((d) => ({ ...d, [id]: data.vendor }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 5 ? [...s, id] : s));
  }

  const rows = useMemo(() => {
    const preferredSuppliers = safeJsonParse<string[]>(profile?.preferredSuppliers, []);
    const preferredBrands = safeJsonParse<string[]>(profile?.preferredBrands, []);
    return selected
      .map((id) => {
        const v = details[id];
        if (!v) return null;
        const latestPrice = v.priceChecks?.[0];
        const vendorBrands = (v.priceChecks ?? []).map((p) => p.brand).filter((b): b is string => !!b);
        const { matchesPreferredSupplier, matchesPreferredBrand } = matchPreferences(
          preferredSuppliers,
          preferredBrands,
          v.name,
          vendorBrands
        );
        const score = computeSourcingScore({
          wholesaleStatus: v.wholesaleStatus,
          localVerified: v.localVerified,
          website: v.website,
          phone: v.phone,
          returnPolicy: v.returnPolicy,
          warrantyInfo: v.warrantyInfo,
          shippingInfo: v.shippingInfo,
          minimumOrder: v.minimumOrder,
          internalRating: v.internalRating,
          status: v.status,
          verificationDate: v.verificationDate,
          priceCheckCount: v.priceChecks?.length ?? 0,
          matchesPreferredSupplier,
          matchesPreferredBrand,
        });
        return { v, latestPrice, score };
      })
      .filter((r): r is NonNullable<typeof r> => !!r);
  }, [selected, details, profile]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <p className="text-sm font-medium mb-3">Select up to 5 vendors</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {vendors.map((v) => (
              <Checkbox key={v.id} label={v.name} checked={selected.includes(v.id)} onChange={() => toggle(v.id)} />
            ))}
          </div>
          {vendors.length === 0 && <p className="text-sm text-[var(--text-muted)]">No vendors saved yet.</p>}
        </CardBody>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardBody className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-[var(--text-muted)] font-medium">Vendor</th>
                  {rows.map(({ v }) => (
                    <th key={v.id} className="text-left py-2 pr-4 font-semibold">{v.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Sourcing score", render: (r: (typeof rows)[number]) => <Badge tone="info">{r.score.score}/100</Badge> },
                  { label: "Latest logged price", render: (r: (typeof rows)[number]) => (r.latestPrice ? formatCurrency(r.latestPrice.price) : "Not yet checked") },
                  { label: "Shipping", render: (r: (typeof rows)[number]) => (r.latestPrice ? formatCurrency(r.latestPrice.shippingCost) : r.v.shippingInfo ?? "—") },
                  { label: "Availability (last check)", render: (r: (typeof rows)[number]) => r.latestPrice?.availability ?? "—" },
                  { label: "Brand / supply kind", render: (r: (typeof rows)[number]) => r.v.supplyKind ?? "—" },
                  { label: "Warranty", render: (r: (typeof rows)[number]) => r.v.warrantyInfo ?? "—" },
                  { label: "Return policy", render: (r: (typeof rows)[number]) => r.v.returnPolicy ?? "—" },
                  { label: "Minimum order", render: (r: (typeof rows)[number]) => r.v.minimumOrder ?? "—" },
                  { label: "Location", render: (r: (typeof rows)[number]) => [r.v.city, r.v.state].filter(Boolean).join(", ") || "—" },
                  { label: "Wholesale status", render: (r: (typeof rows)[number]) => (r.v.wholesaleStatus === "verified" ? <Badge tone="success">Verified</Badge> : <Badge>Unverified</Badge>) },
                  { label: "Wholesale requirements", render: (r: (typeof rows)[number]) => r.v.wholesaleRequirements ?? "—" },
                  { label: "Your status", render: (r: (typeof rows)[number]) => r.v.status.replace(/_/g, " ") },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4 text-[var(--text-muted)]">{row.label}</td>
                    {rows.map((r) => (
                      <td key={r.v.id} className="py-2 pr-4">{row.render(r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Pricing/availability reflect the most recently logged price check for each vendor, not
              live data — prices can change.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
