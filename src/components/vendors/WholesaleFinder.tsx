"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VENDOR_REFERENCE_LIST } from "@/lib/vendorSeed";
import type { Vendor } from "@prisma/client";

export function WholesaleFinder() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data.vendors ?? []);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    load();
  }, []);

  const verified = vendors.filter((v) => v.wholesaleStatus === "verified");
  const unverified = vendors.filter((v) => v.wholesaleStatus !== "verified");
  const referenceCandidates = VENDOR_REFERENCE_LIST.filter((r) => r.commercialProgramKnown);
  const savedNames = new Set(vendors.map((v) => v.name));

  async function addReference(name: string) {
    setAdding(name);
    await fetch("/api/vendors/seed-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setAdding(null);
    load();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-emerald-700 mb-2">Wholesale availability verified</h2>
        {verified.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">None yet — verify wholesale terms directly with a vendor, then mark it verified on their vendor page.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {verified.map((v) => (
              <Link key={v.id} href={`/vendors/${v.id}`}>
                <Card className="hover:border-[var(--brand)]">
                  <CardBody>
                    <p className="font-semibold text-sm">{v.name}</p>
                    <Badge tone="success">Verified</Badge>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{v.wholesaleRequirements || "No requirements noted."}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Wholesale status could not be verified</h2>
        {unverified.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">None.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {unverified.map((v) => (
              <Link key={v.id} href={`/vendors/${v.id}`}>
                <Card className="hover:border-[var(--brand)]">
                  <CardBody>
                    <p className="font-semibold text-sm">{v.name}</p>
                    <Badge>Unverified</Badge>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-1">National suppliers commonly offering trade/dealer/wholesale accounts</h2>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Publicly known to run some kind of commercial program — exact terms (pricing, minimums,
          approval requirements) are not published and must be confirmed directly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {referenceCandidates.map((r) => (
            <Card key={r.name}>
              <CardBody className="space-y-2">
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{r.notes}</p>
                <Button type="button" variant="secondary" size="sm" disabled={savedNames.has(r.name) || adding === r.name} onClick={() => addReference(r.name)}>
                  {savedNames.has(r.name) ? "Added" : adding === r.name ? "Adding…" : "Track this vendor"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
