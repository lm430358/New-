"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Proposal {
  code: string;
  symbol: string;
  notionalUsd: number;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  maxLossUsd: number;
  confidence: number;
  rationale: string;
  status: string;
  statusDetail: string | null;
  expiresAt: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

/** Opened from the link in the text message. The token in the URL authorizes it. */
export default function ApprovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSearchParams().get("t") ?? "";
  const [p, setP] = useState<Proposal | null>(null);
  const [mode, setMode] = useState<string>("paper");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/trading/proposals/${id}?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("This link is invalid."))))
      .then((d) => {
        setP(d.proposal);
        setMode(d.mode);
      })
      .catch((e) => setMsg(e.message));
  }, [id, token]);

  async function decide(decision: "yes" | "no") {
    setBusy(true);
    const r = await fetch(`/api/trading/proposals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, decision }),
    }).then((res) => res.json());
    setMsg(r.message ?? r.error);
    setP((prev) => (prev ? { ...prev, status: decision === "yes" && r.ok ? "approved" : decision === "no" && r.ok ? "rejected" : prev.status } : prev));
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardBody className="space-y-3">
          <p className={mode === "paper" ? "text-emerald-700 text-xs font-semibold" : "text-red-700 text-xs font-semibold"}>
            {mode === "paper" ? "PAPER TRADE (fake money)" : "REAL MONEY"}
          </p>
          {p ? (
            <>
              <h1 className="text-xl font-semibold">
                {p.code}: Buy {usd(p.notionalUsd)} of {p.symbol}
              </h1>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>Price now: ~{p.entryPrice}</li>
                <li>Auto-sell if it falls to {p.stopPrice} (max loss ~{usd(p.maxLossUsd)})</li>
                <li>Auto-sell if it rises to {p.targetPrice} (target)</li>
                <li>Confidence: {p.confidence}/100</li>
                <li>Answer by {new Date(p.expiresAt).toLocaleTimeString()}</li>
              </ul>
              <p className="text-sm text-slate-500">{p.rationale}</p>
              {p.status === "pending" ? (
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" loading={busy} onClick={() => decide("yes")}>YES</Button>
                  <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide("no")}>NO</Button>
                </div>
              ) : (
                <p className="text-sm font-medium">Status: {p.status}{p.statusDetail ? ` (${p.statusDetail})` : ""}</p>
              )}
            </>
          ) : (
            !msg && <p className="text-slate-500">Loading…</p>
          )}
          {msg && <p className="text-sm bg-slate-50 rounded-lg px-3 py-2">{msg}</p>}
        </CardBody>
      </Card>
    </div>
  );
}
