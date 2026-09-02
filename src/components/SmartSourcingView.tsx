"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { SmartSourcingPlan } from "@/lib/ai/schemas";

export function SmartSourcingView() {
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SmartSourcingPlan | null>(null);
  const [candidateCount, setCandidateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!request.trim()) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    const res = await fetch("/api/sourcing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Sourcing request failed.");
      return;
    }
    setPlan(data.plan);
    setCandidateCount(data.candidateCount);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardBody className="space-y-3">
          <Textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe what you need to source, quantities, and any constraints…"
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              Ranks only vendors already in your database ({candidateCount > 0 ? `${candidateCount} considered last run` : "add vendors first for a real ranking"}).
            </p>
            <Button type="button" onClick={run} disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Run sourcing agent
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardBody>
      </Card>

      {plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Understanding</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <p>{plan.interpretation}</p>
              <Badge tone="info">{plan.identifiedPartCategory}</Badge>
              <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 mt-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-800">{plan.compatibilityStatement}</p>
              </div>
            </CardBody>
          </Card>

          {plan.noMatchingVendorsNote && (
            <Card><CardBody className="text-sm text-amber-800 bg-amber-50">{plan.noMatchingVendorsNote}</CardBody></Card>
          )}

          {plan.rankedOptions.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Ranked options</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                {[...plan.rankedOptions].sort((a, b) => a.rank - b.rank).map((opt) => (
                  <div key={opt.vendorName} className="border-b border-[var(--border)] last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">#{opt.rank} · {opt.vendorName}</p>
                      <span className="text-sm text-[var(--text-muted)]">{opt.estimatedUnitCost}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{opt.reasoning}</p>
                    {opt.uncertainties.length > 0 && (
                      <ul className="list-disc pl-5 text-xs text-amber-700 mt-1">
                        {opt.uncertainties.map((u) => <li key={u}>{u}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Cost estimate & recommendation</CardTitle></CardHeader>
            <CardBody className="space-y-2 text-sm">
              <p className="text-[var(--text-muted)]">{plan.totalEstimatedCostNote}</p>
              <p>{plan.overallRecommendation}</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
