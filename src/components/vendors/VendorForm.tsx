"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { VENDOR_TYPES, SUPPLY_KINDS, VENDOR_STATUSES } from "@/lib/types";
import type { Vendor } from "@prisma/client";

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: vendor?.name ?? "",
    vendorType: vendor?.vendorType ?? "wholesale_distributor",
    supplyKind: vendor?.supplyKind ?? "mixed",
    website: vendor?.website ?? "",
    phone: vendor?.phone ?? "",
    email: vendor?.email ?? "",
    street: vendor?.street ?? "",
    city: vendor?.city ?? "",
    state: vendor?.state ?? "",
    zip: vendor?.zip ?? "",
    shippingInfo: vendor?.shippingInfo ?? "",
    minimumOrder: vendor?.minimumOrder ?? "",
    wholesaleRequirements: vendor?.wholesaleRequirements ?? "",
    accountRequirements: vendor?.accountRequirements ?? "",
    returnPolicy: vendor?.returnPolicy ?? "",
    warrantyInfo: vendor?.warrantyInfo ?? "",
    hoursInfo: vendor?.hoursInfo ?? "",
    wholesaleStatus: vendor?.wholesaleStatus ?? "unverified",
    localVerified: vendor?.localVerified ?? false,
    status: vendor?.status ?? "researching",
    favorite: vendor?.favorite ?? false,
    internalRating: vendor?.internalRating?.toString() ?? "",
    notes: vendor?.notes ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = vendor ? `/api/vendors/${vendor.id}` : "/api/vendors";
    const method = vendor ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save vendor.");
      return;
    }
    router.push(`/vendors/${data.vendor.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader><CardTitle>Vendor identity</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Vendor name"><Input required value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
          </div>
          <Field label="Vendor type">
            <Select value={form.vendorType} onChange={(e) => update("vendorType", e.target.value)}>
              {VENDOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <Field label="OEM / Aftermarket / Wholesale / Used / Specialty">
            <Select value={form.supplyKind} onChange={(e) => update("supplyKind", e.target.value)}>
              {SUPPLY_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </Select>
          </Field>
          <Field label="Website"><Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Field label="Street"><Input value={form.street} onChange={(e) => update("street", e.target.value)} /></Field></div>
          <Field label="City"><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></Field>
          <Field label="State"><Input value={form.state} onChange={(e) => update("state", e.target.value)} /></Field>
          <Field label="ZIP"><Input value={form.zip} onChange={(e) => update("zip", e.target.value)} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Terms (only fill in what&apos;s actually confirmed)</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <Field label="Shipping info"><Input value={form.shippingInfo} onChange={(e) => update("shippingInfo", e.target.value)} /></Field>
          <Field label="Minimum order"><Input value={form.minimumOrder} onChange={(e) => update("minimumOrder", e.target.value)} /></Field>
          <Field label="Wholesale requirements"><Input value={form.wholesaleRequirements} onChange={(e) => update("wholesaleRequirements", e.target.value)} /></Field>
          <Field label="Account requirements"><Input value={form.accountRequirements} onChange={(e) => update("accountRequirements", e.target.value)} /></Field>
          <Field label="Return policy"><Input value={form.returnPolicy} onChange={(e) => update("returnPolicy", e.target.value)} /></Field>
          <Field label="Warranty information"><Input value={form.warrantyInfo} onChange={(e) => update("warrantyInfo", e.target.value)} /></Field>
          <Field label="Hours"><Input value={form.hoursInfo} onChange={(e) => update("hoursInfo", e.target.value)} /></Field>
          <Field label="Wholesale status">
            <Select value={form.wholesaleStatus} onChange={(e) => update("wholesaleStatus", e.target.value)}>
              <option value="unverified">Wholesale status could not be verified</option>
              <option value="verified">Wholesale availability verified</option>
            </Select>
          </Field>
          <div className="col-span-2">
            <Checkbox label="Local business presence verified (address/hours confirmed)" checked={form.localVerified} onChange={(e) => update("localVerified", e.target.checked)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your tracking</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
              {VENDOR_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Your internal rating (1-5)">
            <Input type="number" min={1} max={5} value={form.internalRating} onChange={(e) => update("internalRating", e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Checkbox label="Favorite" checked={form.favorite} onChange={(e) => update("favorite", e.target.checked)} />
          </div>
          <div className="col-span-2">
            <Field label="Notes"><Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
          </div>
        </CardBody>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : vendor ? "Save changes" : "Add vendor"}</Button>
    </form>
  );
}
