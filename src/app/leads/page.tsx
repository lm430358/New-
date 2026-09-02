"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, inputClass } from "@/components/ui/Field";
import { OWNER_COLOR, stageById } from "@/lib/content/workflow";

interface Lead {
  id: string;
  businessName: string;
  industry: string;
  city: string | null;
  stage: string;
  leadScore: number | null;
  closedStatus: string;
  potentialDealSize: number | null;
}

const EMPTY_FORM = {
  businessName: "",
  ownerName: "",
  industry: "",
  city: "",
  website: "",
  email: "",
  phone: "",
  instagram: "",
  facebook: "",
  googleBusinessProfile: "",
  leadSource: "",
  researchNotes: "",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaving(false);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads / CRM</h1>
          <p className="mt-1 text-sm text-white/50">
            Add real leads with genuine research notes — AI scoring and outreach are grounded only in
            what you write here.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ Add Lead"}</Button>
      </div>

      {showForm && (
        <Card className="mt-4">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Business Name">
              <input
                required
                className={inputClass}
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </Field>
            <Field label="Industry">
              <input
                required
                className={inputClass}
                placeholder="e.g. Mobile Detailing"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </Field>
            <Field label="Owner Name">
              <input className={inputClass} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
            </Field>
            <Field label="City">
              <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="Website">
              <input className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Instagram">
              <input className={inputClass} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            </Field>
            <Field label="Facebook">
              <input className={inputClass} value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
            </Field>
            <Field label="Google Business Profile">
              <input
                className={inputClass}
                value={form.googleBusinessProfile}
                onChange={(e) => setForm({ ...form, googleBusinessProfile: e.target.value })}
              />
            </Field>
            <Field label="Lead Source">
              <input className={inputClass} value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Research Notes" hint="What you actually observed — this is the only thing the AI is allowed to use.">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={form.researchNotes}
                  onChange={(e) => setForm({ ...form, researchNotes: e.target.value })}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Add Lead"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-white/40">No leads yet. Add your first one above.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40">
                <th className="py-2 pr-4 font-medium">Business</th>
                <th className="py-2 pr-4 font-medium">Industry</th>
                <th className="py-2 pr-4 font-medium">City</th>
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 pr-4 font-medium">Est. Value</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const stage = stageById(l.stage);
                return (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-2 pr-4">
                      <Link href={`/leads/${l.id}`} className="text-violet-300 hover:underline">
                        {l.businessName}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-white/70">{l.industry}</td>
                    <td className="py-2 pr-4 text-white/70">{l.city ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <Badge className={OWNER_COLOR[stage.owner]}>{stage.label}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-white/70">{l.leadScore ?? "—"}</td>
                    <td className="py-2 pr-4 text-white/70">
                      {l.potentialDealSize ? `$${l.potentialDealSize.toLocaleString()}` : "—"}
                    </td>
                    <td className="py-2 pr-4 text-white/70 capitalize">{l.closedStatus}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
