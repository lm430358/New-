"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

const FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: "businessName", label: "Business Name", required: true },
  { key: "industry", label: "Industry", required: true },
  { key: "goals", label: "Their Goals" },
  { key: "currentMarketing", label: "Current Marketing" },
  { key: "competitors", label: "Known Competitors" },
  { key: "onlineVisibility", label: "Online Visibility Notes" },
  { key: "website", label: "Website" },
  { key: "socialMedia", label: "Social Media" },
  { key: "googlePresence", label: "Google Presence" },
  { key: "customerAcquisition", label: "Customer Acquisition Today" },
  { key: "pricing", label: "Pricing" },
  { key: "offer", label: "Current Offer" },
  { key: "branding", label: "Branding" },
  { key: "conversionProblems", label: "Conversion Problems" },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.key, ""]));

export default function AuditPage() {
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else setResult(data.result);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-white">AI Consultant Report Generator</h1>
      <p className="mt-1 text-sm text-white/50">
        Fill in what the client actually told you during intake. The report is grounded only in these
        answers — review it before sending it to a client as a paid deliverable.
      </p>

      <Card className="mt-6">
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                required={f.required}
                className={inputClass}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </Field>
          ))}
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Generating full report…" : "Generate Full Audit Report"}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="mt-4 border-rose-500/30 bg-rose-500/10">
          <p className="text-sm text-rose-200">{error}</p>
        </Card>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <ReportSection title="Executive Summary" content={result.executiveSummary as string} />
          <ReportSection title="Current Situation" content={result.currentSituation as string} />
          <ReportList title="Major Problems" items={result.majorProblems as string[]} />
          <ReportList title="Missed Revenue Opportunities" items={result.missedRevenueOpportunities as string[]} />
          <ReportList title="Competitor Findings" items={result.competitorFindings as string[]} />
          <ReportList title="Priority Recommendations" items={result.priorityRecommendations as string[]} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReportList title="30-Day Plan" items={result.plan30Day as string[]} />
            <ReportList title="60-Day Plan" items={result.plan60Day as string[]} />
            <ReportList title="90-Day Plan" items={result.plan90Day as string[]} />
          </div>
          <ReportList title="Recommended Marketing Channels" items={result.recommendedMarketingChannels as string[]} />
          <ReportSection title="Content Strategy" content={result.contentStrategy as string} />
          <ReportSection title="Customer Acquisition Strategy" content={result.customerAcquisitionStrategy as string} />
          <Card>
            <h3 className="text-sm font-semibold text-white">Estimated Priorities</h3>
            <div className="mt-2 space-y-1 text-sm text-white/70">
              {(result.estimatedPriorities as { item: string; impact: string; effort: string }[]).map((p, i) => (
                <div key={i} className="flex justify-between rounded bg-white/5 px-2 py-1">
                  <span>{p.item}</span>
                  <span className="text-xs text-white/40">impact: {p.impact} · effort: {p.effort}</span>
                </div>
              ))}
            </div>
          </Card>
          <ReportList title="KPIs" items={result.kpis as string[]} />
          <ReportList title="Next Actions" items={result.nextActions as string[]} />
        </div>
      )}
    </div>
  );
}

function ReportSection({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{content}</p>
    </Card>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-white/70">
        {items?.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </Card>
  );
}
