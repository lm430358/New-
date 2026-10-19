"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { MapPin, Phone, Globe } from "lucide-react";
import type { Vendor } from "@prisma/client";

export function LocalFinder() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [results, setResults] = useState<Vendor[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    const res = await fetch(`/api/vendors?${params.toString()}`);
    const data = await res.json();
    setResults(data.vendors ?? []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">City</p>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Atlanta" className="w-48" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">State</p>
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. GA" className="w-32" />
          </div>
          <Button type="button" onClick={search} disabled={loading}>{loading ? "Searching…" : "Search"}</Button>
        </CardBody>
      </Card>

      {results === null ? (
        <p className="text-sm text-[var(--text-muted)]">
          Search your saved vendor database by city/state. This app doesn&apos;t invent local businesses —
          only vendors you&apos;ve added with a matching location will show up here.
        </p>
      ) : results.length === 0 ? (
        <Card><CardBody className="text-sm text-[var(--text-muted)]">
          No saved vendors match that location yet. Research local suppliers yourself (search engines,
          local business directories, industry associations) and add the ones you verify to your vendor
          database — they&apos;ll then show up here.
        </CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((v) => (
            <Link key={v.id} href={`/vendors/${v.id}`}>
              <Card className="hover:border-[var(--brand)]">
                <CardBody className="space-y-1.5">
                  <p className="font-semibold text-sm">{v.name}</p>
                  <Badge>{v.vendorType.replace(/_/g, " ")}</Badge>
                  <div className="text-xs text-[var(--text-muted)] space-y-1 mt-1">
                    {(v.street || v.city) && <p className="flex items-center gap-1"><MapPin size={12} />{[v.street, v.city, v.state, v.zip].filter(Boolean).join(", ")}</p>}
                    {v.phone && <p className="flex items-center gap-1"><Phone size={12} />{v.phone}</p>}
                    {v.website && <p className="flex items-center gap-1"><Globe size={12} />{v.website}</p>}
                    {v.hoursInfo && <p>Hours: {v.hoursInfo}</p>}
                    {!v.localVerified && <p className="text-amber-700">Local presence not yet verified.</p>}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
