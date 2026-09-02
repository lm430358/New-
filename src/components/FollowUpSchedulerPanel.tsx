"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RunResult {
  scanned: number;
  drafted: { leadId: string; businessName: string; stage: string }[];
  skipped: { leadId: string; businessName: string; reason: string }[];
  errors: { leadId: string; businessName: string; error: string }[];
}

export function FollowUpSchedulerPanel() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/automations/run-followups", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Follow-Up Scheduler</h2>
          <p className="mt-1 text-xs text-white/40">
            Runs automatically every hour while the server is up (see <code className="rounded bg-white/10 px-1">src/instrumentation.ts</code>).
            Drafts the next follow-up for leads past their due date and queues it for approval — never sends anything.
          </p>
        </div>
        <Button variant="secondary" onClick={run} disabled={running}>
          {running ? "Running…" : "Run Now"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      {result && (
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-white/60">
            Scanned {result.scanned} due lead{result.scanned === 1 ? "" : "s"} — drafted {result.drafted.length}, skipped{" "}
            {result.skipped.length}, errors {result.errors.length}.
          </p>
          {result.drafted.map((d) => (
            <div key={d.leadId} className="rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">
              Drafted {d.stage.replace(/_/g, " ")} for {d.businessName}
            </div>
          ))}
          {result.skipped.map((s, i) => (
            <div key={i} className="rounded bg-white/5 px-2 py-1 text-white/50">
              Skipped {s.businessName}: {s.reason}
            </div>
          ))}
          {result.errors.map((e, i) => (
            <div key={i} className="rounded bg-rose-500/10 px-2 py-1 text-rose-300">
              Error on {e.businessName}: {e.error}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
