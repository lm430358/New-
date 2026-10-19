"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Star, MapPin, Globe } from "lucide-react";
import { VENDOR_TYPES, VENDOR_STATUSES } from "@/lib/types";
import type { Vendor } from "@prisma/client";
import { VENDOR_REFERENCE_LIST } from "@/lib/vendorSeed";

type VendorWithCount = Vendor & { _count?: { priceChecks: number } };

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  researching: "neutral",
  contacted: "info",
  approved: "success",
  purchased: "success",
  do_not_use: "danger",
};

export function VendorList() {
  const [vendors, setVendors] = useState<VendorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorType, setVendorType] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [addingRef, setAddingRef] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (vendorType) params.set("vendorType", vendorType);
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/vendors?${params.toString()}`);
    const data = await res.json();
    setVendors(data.vendors ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data reload on filter change
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorType, status]);

  async function addReference(name: string) {
    setAddingRef(name);
    await fetch("/api/vendors/seed-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setAddingRef(null);
    load();
  }

  const savedNames = new Set(vendors.map((v) => v.name));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} className="max-w-xs" />
        <Select value={vendorType} onChange={(e) => setVendorType(e.target.value)} className="max-w-[200px]">
          <option value="">All vendor types</option>
          {VENDOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]">
          <option value="">All statuses</option>
          {VENDOR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Button type="button" variant="secondary" onClick={load}>Search</Button>
        <Link href="/vendors/new" className="ml-auto">
          <Button type="button">+ Add vendor</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : vendors.length === 0 ? (
        <Card><CardBody className="text-sm text-[var(--text-muted)]">
          No saved vendors yet. Add one you&apos;ve researched yourself, or start from a well-known supplier below.
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <Link key={v.id} href={`/vendors/${v.id}`}>
              <Card className="h-full hover:border-[var(--brand)] transition-colors">
                <CardBody className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{v.name}</p>
                    {v.favorite && <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>{VENDOR_TYPES.find((t) => t.value === v.vendorType)?.label ?? v.vendorType}</Badge>
                    <Badge tone={statusTone[v.status]}>{VENDOR_STATUSES.find((s) => s.value === v.status)?.label}</Badge>
                    <Badge tone={v.wholesaleStatus === "verified" ? "success" : "neutral"}>
                      {v.wholesaleStatus === "verified" ? "Wholesale verified" : "Wholesale unverified"}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    {(v.city || v.state) && (
                      <p className="flex items-center gap-1"><MapPin size={12} />{[v.city, v.state].filter(Boolean).join(", ")}</p>
                    )}
                    {v.website && <p className="flex items-center gap-1 truncate"><Globe size={12} />{v.website}</p>}
                    <p>{v._count?.priceChecks ?? 0} price check(s) logged</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-1">Well-known national suppliers</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          A static reference list of real, well-established suppliers — not live pricing or a guarantee
          of current terms. Add one to your own vendor database to start tracking it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {VENDOR_REFERENCE_LIST.map((r) => (
            <Card key={r.name}>
              <CardBody className="space-y-2">
                <p className="font-semibold text-sm">{r.name}</p>
                <Badge>{VENDOR_TYPES.find((t) => t.value === r.vendorType)?.label ?? r.vendorType}</Badge>
                <p className="text-xs text-[var(--text-muted)]">{r.description}</p>
                <p className="text-xs text-[var(--text-muted)] italic">{r.notes}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={savedNames.has(r.name) || addingRef === r.name}
                  onClick={() => addReference(r.name)}
                >
                  {savedNames.has(r.name) ? "Added" : addingRef === r.name ? "Adding…" : "Add to my vendors"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
