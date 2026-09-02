"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader2 } from "lucide-react";
import type { ResellOpportunities } from "@/lib/ai/schemas";

export function ResellOpportunitiesView() {
  const [focusArea, setFocusArea] = useState("");
  const [localMarket, setLocalMarket] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResellOpportunities | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/resell-opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focusArea, localMarket }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data.result);
    else setError(data.error || "Failed to find opportunities.");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardBody className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Focus area (optional)</p>
            <Input value={focusArea} onChange={(e) => setFocusArea(e.target.value)} placeholder="e.g. brake components, lighting" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-[var(--text-muted)] mb-1">Local market (optional)</p>
            <Input value={localMarket} onChange={(e) => setLocalMarket(e.target.value)} placeholder="e.g. Atlanta, GA" />
          </div>
          <Button type="button" onClick={run} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Find opportunities
          </Button>
        </CardBody>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-4">
          <p className="text-sm text-amber-800 bg-amber-50 rounded-md p-3">{result.overallCaveat}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.opportunities.map((o) => (
              <Card key={o.category}>
                <CardHeader><CardTitle>{o.category}</CardTitle></CardHeader>
                <CardBody className="space-y-2 text-sm">
                  <Badge tone="info">Est. margin: {o.estimatedMarginRangePct}</Badge>
                  <p className="text-[var(--text-muted)]">{o.rationale}</p>
                  <p><span className="font-medium">Demand signal:</span> {o.demandSignal}</p>
                  {o.risks.length > 0 && (
                    <div>
                      <p className="font-medium">Risks</p>
                      <ul className="list-disc pl-5 text-[var(--text-muted)]">
                        {o.risks.map((r) => <li key={r}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs italic text-[var(--text-muted)]">{o.caution}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
