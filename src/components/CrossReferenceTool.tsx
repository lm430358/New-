"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Field";
import type { CrossReference } from "@prisma/client";

type Row = CrossReference & { vendor?: { id: string; name: string } | null };

export function CrossReferenceTool() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Row[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    originalPartNumber: "",
    originalIsOem: true,
    alternatePartNumber: "",
    manufacturer: "",
    compatibilityNotes: "",
    source: "",
    status: "potential",
  });

  async function search(q: string) {
    const res = await fetch(`/api/cross-reference?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    setSearched(true);
  }

  useEffect(() => {
    fetch("/api/cross-reference").then((r) => r.json()).then((d) => setResults(d.results ?? []));
  }, []);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/cross-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setShowAdd(false);
      setForm({ originalPartNumber: "", originalIsOem: true, alternatePartNumber: "", manufacturer: "", compatibilityNotes: "", source: "", status: "potential" });
      search(query);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardBody className="flex gap-2">
          <Input
            placeholder="Enter an OEM or aftermarket part number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
          />
          <Button type="button" onClick={() => search(query)}>Search</Button>
          <Button type="button" variant="secondary" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? "Cancel" : "+ Add cross-reference"}
          </Button>
        </CardBody>
      </Card>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Add a confirmed or potential cross-reference</CardTitle></CardHeader>
          <CardBody>
            <form onSubmit={addEntry} className="grid grid-cols-2 gap-3">
              <Field label="Original part number"><Input required value={form.originalPartNumber} onChange={(e) => setForm((f) => ({ ...f, originalPartNumber: e.target.value }))} /></Field>
              <Field label="Alternate part number"><Input required value={form.alternatePartNumber} onChange={(e) => setForm((f) => ({ ...f, alternatePartNumber: e.target.value }))} /></Field>
              <Field label="Manufacturer"><Input value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} /></Field>
              <Field label="Source">
                <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="e.g. vendor catalog, manufacturer TSB" />
              </Field>
              <div className="col-span-2"><Field label="Compatibility notes"><Textarea value={form.compatibilityNotes} onChange={(e) => setForm((f) => ({ ...f, compatibilityNotes: e.target.value }))} /></Field></div>
              <Field label="Verification status">
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="potential">Potential match — verify before purchasing</option>
                  <option value="verified">Verified</option>
                </Select>
              </Field>
              <div className="flex items-end">
                <Checkbox label="Original number is OEM (unchecked = aftermarket)" checked={form.originalIsOem} onChange={(e) => setForm((f) => ({ ...f, originalIsOem: e.target.checked }))} />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save cross-reference"}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{searched ? `Results` : "All saved cross-references"}</CardTitle></CardHeader>
        <CardBody>
          {results.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No cross-references found. Never treat an unmatched search as &quot;no equivalent exists&quot; —
              it just means nothing has been confirmed and saved here yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                    <th className="py-2 pr-4">Original</th>
                    <th className="py-2 pr-4">Alternate</th>
                    <th className="py-2 pr-4">Manufacturer</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2 pr-4 font-medium">{r.originalPartNumber}<div className="text-xs text-[var(--text-muted)]">{r.originalIsOem ? "OEM" : "Aftermarket"}</div></td>
                      <td className="py-2 pr-4">{r.alternatePartNumber}</td>
                      <td className="py-2 pr-4">{r.manufacturer ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={r.status === "verified" ? "success" : "warning"}>
                          {r.status === "verified" ? "Verified" : "Potential match — verify before purchasing"}
                        </Badge>
                        {r.compatibilityNotes && <p className="text-xs text-[var(--text-muted)] mt-1">{r.compatibilityNotes}</p>}
                      </td>
                      <td className="py-2 pr-4">{r.source ?? r.vendor?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
