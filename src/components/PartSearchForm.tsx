"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { PartIdentification } from "@/lib/ai/schemas";
import type { DecodedVin } from "@/lib/vin";

const emptyForm = {
  year: "",
  make: "",
  model: "",
  trim: "",
  engine: "",
  vin: "",
  partName: "",
  partNumber: "",
  oemPartNumber: "",
  aftermarketNumber: "",
  symptoms: "",
  rawQuery: "",
};

export function PartSearchForm() {
  const [form, setForm] = useState(emptyForm);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<DecodedVin | null>(null);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PartIdentification | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function lookupVin() {
    if (!form.vin) return;
    setVinLoading(true);
    setVinError(null);
    setDecoded(null);
    const res = await fetch("/api/vin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin: form.vin }),
    });
    const data = await res.json();
    setVinLoading(false);
    if (!res.ok) {
      setVinError(data.error || "VIN lookup failed.");
      return;
    }
    setDecoded(data.decoded);
    setForm((f) => ({
      ...f,
      year: data.decoded.year || f.year,
      make: data.decoded.make || f.make,
      model: data.decoded.model || f.model,
      trim: data.decoded.trim || f.trim,
      engine: [data.decoded.engineDisplacementL && `${data.decoded.engineDisplacementL}L`, data.decoded.engineCylinders && `${data.decoded.engineCylinders}-cyl`]
        .filter(Boolean)
        .join(" ") || f.engine,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setResult(null);
    const vinDecoded = decoded
      ? `${decoded.year ?? ""} ${decoded.make ?? ""} ${decoded.model ?? ""} ${decoded.trim ?? ""}`.trim()
      : undefined;
    const res = await fetch("/api/parts/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, vinDecoded }),
    });
    const data = await res.json();
    setSearching(false);
    if (!res.ok) {
      setError(data.error || "Search failed.");
      return;
    }
    setResult(data.result);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>VIN lookup (optional)</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="17-character VIN"
                value={form.vin}
                onChange={(e) => update("vin", e.target.value.toUpperCase())}
                maxLength={17}
              />
              <Button type="button" variant="secondary" onClick={lookupVin} disabled={vinLoading || form.vin.length !== 17}>
                {vinLoading ? <Loader2 size={14} className="animate-spin" /> : "Decode"}
              </Button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Uses the free NHTSA vPIC vehicle database. VIN identification does not automatically
              guarantee part compatibility — always verify fitment before ordering.
            </p>
            {vinError && <p className="text-xs text-red-600">{vinError}</p>}
            {decoded && (
              <div className="rounded-md bg-[var(--surface-muted)] p-3 text-xs space-y-1">
                <p className="font-medium">Decoded vehicle</p>
                <p>
                  {[decoded.year, decoded.make, decoded.model, decoded.trim].filter(Boolean).join(" ") || "Limited data returned"}
                </p>
                {decoded.engineDisplacementL && (
                  <p>
                    Engine: {decoded.engineDisplacementL}L {decoded.engineCylinders ? `${decoded.engineCylinders}-cyl` : ""} {decoded.fuelType ?? ""}
                  </p>
                )}
                {decoded.errorText && decoded.errorText !== "0 - VIN decoded clean. Check Digit (9th position) is correct" && (
                  <p className="text-amber-700">{decoded.errorText}</p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle & part details</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Field label="Year"><Input value={form.year} onChange={(e) => update("year", e.target.value)} /></Field>
            <Field label="Make"><Input value={form.make} onChange={(e) => update("make", e.target.value)} /></Field>
            <Field label="Model"><Input value={form.model} onChange={(e) => update("model", e.target.value)} /></Field>
            <Field label="Trim"><Input value={form.trim} onChange={(e) => update("trim", e.target.value)} /></Field>
            <Field label="Engine"><Input value={form.engine} onChange={(e) => update("engine", e.target.value)} /></Field>
            <Field label="Part name"><Input value={form.partName} onChange={(e) => update("partName", e.target.value)} placeholder="e.g. Front brake pads" /></Field>
            <Field label="Part number"><Input value={form.partNumber} onChange={(e) => update("partNumber", e.target.value)} /></Field>
            <Field label="OEM part number"><Input value={form.oemPartNumber} onChange={(e) => update("oemPartNumber", e.target.value)} /></Field>
            <div className="col-span-2">
              <Field label="Symptoms / problem description" hint="e.g. squealing when braking, pulsing pedal">
                <Textarea value={form.symptoms} onChange={(e) => update("symptoms", e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Or just describe it in one line" hint='e.g. "2019 Honda Accord 2.0 turbo front brake pads"'>
                <Input value={form.rawQuery} onChange={(e) => update("rawQuery", e.target.value)} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Button type="submit" disabled={searching}>
          {searching ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
          Identify part
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div>
        {!result && (
          <Card>
            <CardBody className="text-sm text-[var(--text-muted)]">
              Results will appear here once you identify a part. This step only identifies the likely
              part category — head to <span className="font-medium">Vendors</span> or the{" "}
              <span className="font-medium">Smart Sourcing Agent</span> next to find suppliers.
            </CardBody>
          </Card>
        )}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{result.likelyPartCategory}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              <div>
                <Badge tone="info">{result.relatedSystem}</Badge>
              </div>
              <p className="text-[var(--text-muted)]">{result.interpretationNotes}</p>

              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-800">{result.compatibilityStatement}</p>
              </div>

              {result.suggestedSearchTerms.length > 0 && (
                <div>
                  <p className="font-medium mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Suggested search terms
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestedSearchTerms.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.clarifyingQuestions.length > 0 && (
                <div>
                  <p className="font-medium mb-1.5">To narrow this down further</p>
                  <ul className="list-disc pl-5 space-y-1 text-[var(--text-muted)]">
                    {result.clarifyingQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--border)] flex gap-2">
                <Link href="/vendors" className="text-sm text-[var(--brand)] font-medium">
                  Find vendors for this part →
                </Link>
                <Link href="/sourcing" className="text-sm text-[var(--brand)] font-medium">
                  Run smart sourcing →
                </Link>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
