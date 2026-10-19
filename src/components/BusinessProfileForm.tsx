"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { BusinessProfile } from "@prisma/client";

export function BusinessProfileForm({ profile }: { profile: (BusinessProfile & { preferredSuppliersList?: string[]; preferredBrandsList?: string[] }) | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    id: profile?.id,
    businessName: profile?.businessName ?? "",
    businessType: profile?.businessType ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    industry: profile?.industry ?? "",
    isRepairShop: profile?.isRepairShop ?? false,
    isMobileMechanic: profile?.isMobileMechanic ?? false,
    resellsParts: profile?.resellsParts ?? false,
    operatesFleet: profile?.operatesFleet ?? false,
    isDealership: profile?.isDealership ?? false,
    monthlyPartsBudget: profile?.monthlyPartsBudget?.toString() ?? "",
    preferredSuppliers: (profile?.preferredSuppliersList ?? []).join(", "),
    preferredBrands: (profile?.preferredBrandsList ?? []).join(", "),
    conditionPref: profile?.conditionPref ?? "either",
    sourcingPref: profile?.sourcingPref ?? "either",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/business-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        preferredSuppliers: form.preferredSuppliers.split(",").map((s) => s.trim()).filter(Boolean),
        preferredBrands: form.preferredBrands.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    if (res.ok) {
      const { profile: saved } = await res.json();
      update("id", saved.id);
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business name">
            <Input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Ridgeline Auto Repair" />
          </Field>
          <Field label="Business type">
            <Input value={form.businessType} onChange={(e) => update("businessType", e.target.value)} placeholder="e.g. Independent repair shop" />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="e.g. GA" />
          </Field>
          <Field label="Industry">
            <Input value={form.industry} onChange={(e) => update("industry", e.target.value)} placeholder="e.g. Automotive repair & maintenance" />
          </Field>
          <Field label="Monthly parts budget (USD)">
            <Input type="number" min={0} value={form.monthlyPartsBudget} onChange={(e) => update("monthlyPartsBudget", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business role</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Checkbox label="We are a repair shop" checked={form.isRepairShop} onChange={(e) => update("isRepairShop", e.target.checked)} />
          <Checkbox label="We are a mobile mechanic" checked={form.isMobileMechanic} onChange={(e) => update("isMobileMechanic", e.target.checked)} />
          <Checkbox label="We resell parts" checked={form.resellsParts} onChange={(e) => update("resellsParts", e.target.checked)} />
          <Checkbox label="We operate a fleet" checked={form.operatesFleet} onChange={(e) => update("operatesFleet", e.target.checked)} />
          <Checkbox label="We are a dealership" checked={form.isDealership} onChange={(e) => update("isDealership", e.target.checked)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sourcing preferences</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Preferred suppliers" hint="Comma-separated">
            <Input value={form.preferredSuppliers} onChange={(e) => update("preferredSuppliers", e.target.value)} placeholder="e.g. WorldPac, NAPA" />
          </Field>
          <Field label="Preferred brands" hint="Comma-separated">
            <Input value={form.preferredBrands} onChange={(e) => update("preferredBrands", e.target.value)} placeholder="e.g. Motorcraft, ACDelco" />
          </Field>
          <Field label="New vs. used parts preference">
            <Select value={form.conditionPref} onChange={(e) => update("conditionPref", e.target.value)}>
              <option value="new">New only</option>
              <option value="used">Used/recycled OK</option>
              <option value="either">Either</option>
            </Select>
          </Field>
          <Field label="OEM vs. aftermarket preference">
            <Select value={form.sourcingPref} onChange={(e) => update("sourcingPref", e.target.value)}>
              <option value="oem">OEM only</option>
              <option value="aftermarket">Aftermarket OK</option>
              <option value="either">Either</option>
            </Select>
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save business profile"}
        </Button>
        {saved && <span className="text-sm text-emerald-600">Saved.</span>}
      </div>
    </form>
  );
}
