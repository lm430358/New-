"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PriceCheck, Vendor, VendorContactMessage } from "@prisma/client";
import { VENDOR_STATUSES } from "@/lib/types";
import { Star, Trash2, Loader2 } from "lucide-react";

export function VendorQuickActions({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [status, setStatus] = useState(vendor.status);
  const [favorite, setFavorite] = useState(vendor.favorite);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/vendors/${vendor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Remove ${vendor.name} from your vendor database? This can't be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/vendors/${vendor.id}`, { method: "DELETE" });
    router.push("/vendors");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          patch({ status: e.target.value });
        }}
        className="max-w-[180px]"
      >
        {VENDOR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </Select>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setFavorite(!favorite);
          patch({ favorite: !favorite });
        }}
      >
        <Star size={14} className={favorite ? "fill-amber-500 text-amber-500" : ""} />
        {favorite ? "Favorited" : "Favorite"}
      </Button>
      {saving && <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />}
      <Button type="button" variant="danger" size="sm" onClick={remove} disabled={deleting} className="ml-auto">
        <Trash2 size={14} /> Remove
      </Button>
    </div>
  );
}

export function PriceCheckPanel({ vendorId, priceChecks }: { vendorId: string; priceChecks: PriceCheck[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    partDescription: "",
    partNumber: "",
    brand: "",
    condition: "new",
    price: "",
    shippingCost: "",
    availability: "",
    warranty: "",
    returnPolicy: "",
    sourceUrl: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/vendors/${vendorId}/price-checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setOpen(false);
    setForm({ partDescription: "", partNumber: "", brand: "", condition: "new", price: "", shippingCost: "", availability: "", warranty: "", returnPolicy: "", sourceUrl: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Price checks</CardTitle>
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : "+ Log a price check"}
        </Button>
      </CardHeader>
      <CardBody className="space-y-4">
        {open && (
          <form onSubmit={submit} className="grid grid-cols-2 gap-3 pb-4 border-b border-[var(--border)]">
            <div className="col-span-2"><Field label="Part description"><Input required value={form.partDescription} onChange={(e) => update("partDescription", e.target.value)} /></Field></div>
            <Field label="Part number"><Input value={form.partNumber} onChange={(e) => update("partNumber", e.target.value)} /></Field>
            <Field label="Brand"><Input value={form.brand} onChange={(e) => update("brand", e.target.value)} /></Field>
            <Field label="Condition">
              <Select value={form.condition} onChange={(e) => update("condition", e.target.value)}>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="remanufactured">Remanufactured</option>
              </Select>
            </Field>
            <Field label="Price (USD)"><Input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} /></Field>
            <Field label="Shipping cost (USD)"><Input type="number" step="0.01" value={form.shippingCost} onChange={(e) => update("shippingCost", e.target.value)} /></Field>
            <Field label="Availability"><Input value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="e.g. In stock, ships in 2 days" /></Field>
            <Field label="Warranty"><Input value={form.warranty} onChange={(e) => update("warranty", e.target.value)} /></Field>
            <Field label="Return policy"><Input value={form.returnPolicy} onChange={(e) => update("returnPolicy", e.target.value)} /></Field>
            <Field label="Source URL"><Input value={form.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} /></Field>
            <div className="col-span-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save price check"}</Button>
            </div>
          </form>
        )}
        {priceChecks.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No price checks logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
                  <th className="py-1.5 pr-3">Part</th>
                  <th className="py-1.5 pr-3">Brand</th>
                  <th className="py-1.5 pr-3">Price</th>
                  <th className="py-1.5 pr-3">Shipping</th>
                  <th className="py-1.5 pr-3">Total</th>
                  <th className="py-1.5 pr-3">Checked</th>
                </tr>
              </thead>
              <tbody>
                {priceChecks.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-1.5 pr-3">{p.partDescription}{p.partNumber ? ` (${p.partNumber})` : ""}</td>
                    <td className="py-1.5 pr-3">{p.brand ?? "—"}</td>
                    <td className="py-1.5 pr-3">{formatCurrency(p.price)}</td>
                    <td className="py-1.5 pr-3">{formatCurrency(p.shippingCost)}</td>
                    <td className="py-1.5 pr-3 font-medium">{formatCurrency(p.totalCost)}</td>
                    <td className="py-1.5 pr-3">{formatDateTime(p.checkedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              Prices can change — these are manually logged observations, not live pricing.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function ContactAssistantPanel({ vendorId, existing }: { vendorId: string; existing: VendorContactMessage[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState("wholesale_inquiry");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(
    existing[0] ? { subject: existing[0].subject ?? "", body: existing[0].body } : null
  );
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/vendors/${vendorId}/contact-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, extraContext: extra }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setDraft({ subject: data.message.subject ?? "", body: data.message.body });
      router.refresh();
    } else {
      setError(data.error || "Failed to draft message.");
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Contact this vendor</CardTitle></CardHeader>
      <CardBody className="space-y-3">
        <div className="flex gap-2">
          <Select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="max-w-[220px]">
            <option value="wholesale_inquiry">Wholesale / dealer account inquiry</option>
            <option value="availability">Availability inquiry</option>
            <option value="general">General inquiry</option>
          </Select>
          <Input placeholder="Optional: specific part or context" value={extra} onChange={(e) => setExtra(e.target.value)} />
          <Button type="button" onClick={generate} disabled={loading}>{loading ? "Drafting…" : "Draft message"}</Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {draft && (
          <div className="rounded-md border border-[var(--border)] p-3 space-y-2 bg-[var(--surface-muted)]">
            <div className="flex items-center gap-2">
              <Badge tone="warning">Draft — review before sending</Badge>
            </div>
            <p className="text-sm font-medium">{draft.subject}</p>
            <p className="text-sm whitespace-pre-wrap">{draft.body}</p>
          </div>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          This is drafted for you to review, edit, and send yourself (email, phone, or the vendor&apos;s
          contact form) — the app never sends anything on your behalf.
        </p>
      </CardBody>
    </Card>
  );
}
