"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Pause, Play, RefreshCw, ScanSearch, ShieldCheck } from "lucide-react";

interface Proposal {
  id: string;
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
  createdAt: string;
  approveUrl: string;
}

interface Trade {
  id: string;
  symbol: string;
  status: string;
  notionalUsd: number;
  qty: number | null;
  entryPrice: number | null;
  stopPrice: number;
  targetPrice: number;
  exitPrice: number | null;
  exitReason: string | null;
  realizedPnl: number | null;
  openedAt: string;
}

interface Settings {
  paused: boolean;
  accountSizeUsd: number;
  dailyLossLimitUsd: number;
  maxRiskPerTradeUsd: number;
  maxPositionUsd: number;
  maxOpenPositions: number;
  maxProposalsPerDay: number;
  proposalTtlMinutes: number;
  allowCrypto: boolean;
  watchlist: string[];
  timezone: string;
  quietStartHour: number;
  quietEndHour: number;
  maxHoldDays: number;
  paperStartedAt: string;
}

interface Status {
  env: { mode: "paper" | "live"; brokerConfigured: boolean; smsConfigured: boolean };
  strategy: string;
  settings: Settings;
  limits: { dailyLoss: number; riskPerTrade: number };
  quietNow: boolean;
  paperDay: number;
  broker: { equity: number; cash: number; marketOpen: boolean; pnlTodayUsd: number } | null;
  brokerError: string | null;
  stats: { closedTrades: number; wins: number; winRate: number | null; realizedPnl: number; proposals: number; approved: number; rejected: number };
  proposals: Proposal[];
  trades: Trade[];
  events: { id: string; level: string; message: string; createdAt: string }[];
}

const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;
const time = (s: string) => new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const NUMBER_FIELDS: { key: keyof Settings; label: string; hint: string; step?: string }[] = [
  { key: "accountSizeUsd", label: "Budget the bot may use ($)", hint: "Even if the paper account holds more", step: "1" },
  { key: "dailyLossLimitUsd", label: "Daily loss limit ($)", hint: "Hard max $5", step: "0.5" },
  { key: "maxRiskPerTradeUsd", label: "Max loss per trade ($)", hint: "If the stop is hit", step: "0.1" },
  { key: "maxPositionUsd", label: "Largest position ($)", hint: "", step: "1" },
  { key: "maxOpenPositions", label: "Max open positions", hint: "" },
  { key: "maxProposalsPerDay", label: "Max texts per day", hint: "" },
  { key: "proposalTtlMinutes", label: "Minutes to answer", hint: "Then the idea expires" },
  { key: "maxHoldDays", label: "Max days to hold", hint: "Then auto-sell" },
  { key: "quietStartHour", label: "Quiet hours start (0-23)", hint: "No texts" },
  { key: "quietEndHour", label: "Quiet hours end (0-23)", hint: "" },
];

export default function TradingPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [watchText, setWatchText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/trading/status", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const s: Status = await res.json();
      setStatus(s);
      setDraft((d) => d ?? s.settings);
      setWatchText((w) => w || s.settings.watchlist.join(", "));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 20_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  async function scan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/trading/scan", { method: "POST" });
      const r = await res.json();
      setScanResult(r.summary.join(" · "));
    } catch (e) {
      setScanResult((e as Error).message);
    }
    setScanning(false);
    load();
  }

  async function save(patch: Partial<Settings>) {
    setSaving(true);
    const res = await fetch("/api/trading/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert("Not saved: " + JSON.stringify(body.error ?? body));
      return;
    }
    const { settings } = await res.json();
    setDraft({ ...settings, watchlist: JSON.parse(settings.watchlist) });
    load();
  }

  async function decide(p: Proposal, decision: "yes" | "no") {
    const token = new URL(p.approveUrl, location.origin).searchParams.get("t");
    const res = await fetch(`/api/trading/proposals/${p.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, decision }),
    });
    const r = await res.json();
    alert(r.message ?? r.error);
    load();
  }

  if (error && !status) return <p className="text-red-600">Couldn&apos;t load trading status: {error}</p>;
  if (!status || !draft) return <p className="text-slate-500">Loading…</p>;

  const pending = status.proposals.filter((p) => p.status === "pending");
  const open = status.trades.filter((t) => ["open", "pending_fill", "closing"].includes(t.status));
  const closed = status.trades.filter((t) => t.status === "closed");
  const paperDay = status.paperDay;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Trading Assistant</h1>
          <p className="text-sm text-slate-500">
            {status.strategy} · finds trades, texts you, and only buys when you say YES.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save({ paused: !status.settings.paused })} loading={saving}>
            {status.settings.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {status.settings.paused ? "Resume" : "Pause"}
          </Button>
          <Button onClick={scan} loading={scanning}>
            <ScanSearch className="h-4 w-4" /> Scan now
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className={status.env.mode === "paper" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
          {status.env.mode === "paper" ? `PAPER (fake money) · day ${paperDay}` : "LIVE — REAL MONEY"}
        </Badge>
        <Badge className={status.env.brokerConfigured ? "" : "bg-amber-100 text-amber-700"}>
          Broker: {status.env.brokerConfigured ? "connected" : "add Alpaca keys"}
        </Badge>
        <Badge className={status.env.smsConfigured ? "" : "bg-amber-100 text-amber-700"}>
          Texts: {status.env.smsConfigured ? "on" : "off (approve here)"}
        </Badge>
        {status.settings.paused && <Badge className="bg-amber-100 text-amber-700">Paused</Badge>}
        {status.quietNow && <Badge>Quiet hours</Badge>}
        {status.broker && <Badge>Stock market {status.broker.marketOpen ? "open" : "closed"}</Badge>}
      </div>
      {status.brokerError && <p className="text-sm text-red-600">Broker error: {status.brokerError}</p>}
      {scanResult && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{scanResult}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Today's P&L" value={status.broker ? usd(status.broker.pnlTodayUsd) : "—"} sub={`Limit -${usd(status.limits.dailyLoss)}`} tone={status.broker && status.broker.pnlTodayUsd < 0 ? "bad" : "good"} />
        <Stat label="Total realized" value={usd(status.stats.realizedPnl)} sub={`${status.stats.closedTrades} closed trades`} tone={status.stats.realizedPnl < 0 ? "bad" : "good"} />
        <Stat label="Win rate" value={status.stats.winRate === null ? "—" : `${status.stats.winRate}%`} sub={`${status.stats.wins} wins`} />
        <Stat label="Ideas" value={String(status.stats.proposals)} sub={`${status.stats.approved} yes · ${status.stats.rejected} no`} />
      </div>

      {pending.length > 0 && (
        <Card className="border-violet-300">
          <CardHeader><CardTitle>Waiting for your answer</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            {pending.map((p) => (
              <div key={p.id} className="space-y-2">
                <p className="font-medium">
                  {p.code}: BUY {usd(p.notionalUsd)} of {p.symbol} @ ~{p.entryPrice}
                </p>
                <p className="text-sm text-slate-600">
                  Stop {p.stopPrice} (max loss ~{usd(p.maxLossUsd)}) · Target {p.targetPrice} · Confidence {p.confidence}/100 · expires {time(p.expiresAt)}
                </p>
                <p className="text-sm text-slate-500">{p.rationale}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(p, "yes")}>YES, place it</Button>
                  <Button size="sm" variant="outline" onClick={() => decide(p, "no")}>NO, skip</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Open positions</CardTitle></CardHeader>
        <CardBody>
          {open.length === 0 ? (
            <p className="text-sm text-slate-500">None.</p>
          ) : (
            <Table
              head={["Symbol", "Status", "Size", "Entry", "Stop", "Target", "Opened"]}
              rows={open.map((t) => [t.symbol, t.status.replace("_", " "), usd(t.notionalUsd), t.entryPrice ?? "…", t.stopPrice, t.targetPrice, time(t.openedAt)])}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Trade journal</CardTitle></CardHeader>
        <CardBody>
          {closed.length === 0 ? (
            <p className="text-sm text-slate-500">No closed trades yet. Every trade lands here with its result so you can review the paper week.</p>
          ) : (
            <Table
              head={["Symbol", "Entry", "Exit", "Why", "P&L", "Opened"]}
              rows={closed.map((t) => [
                t.symbol,
                t.entryPrice ?? "",
                t.exitPrice ?? "",
                t.exitReason ?? "",
                <span key="p" className={(t.realizedPnl ?? 0) < 0 ? "text-red-600" : "text-emerald-600"}>{usd(t.realizedPnl ?? 0)}</span>,
                time(t.openedAt),
              ])}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent ideas</CardTitle></CardHeader>
        <CardBody>
          {status.proposals.length === 0 ? (
            <p className="text-sm text-slate-500">No ideas yet. Click &quot;Scan now&quot; or let the scheduler run.</p>
          ) : (
            <Table
              head={["Code", "Symbol", "Size", "Conf.", "Status", "When"]}
              rows={status.proposals.map((p) => [p.code, p.symbol, usd(p.notionalUsd), p.confidence, p.status + (p.statusDetail ? ` (${p.statusDetail})` : ""), time(p.createdAt)])}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Rules</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Built in and not changeable here: buys only (no shorting, margin, options, or leverage), fractional market orders,
            every buy needs your YES, auto-sell at stop/target/time, daily loss capped at $5 max.
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {NUMBER_FIELDS.map((f) => (
              <div key={f.key}>
                <Label hint={f.hint || undefined}>{f.label}</Label>
                <Input
                  type="number"
                  step={f.step ?? "1"}
                  value={String(draft[f.key])}
                  onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                />
              </div>
            ))}
            <div>
              <Label hint="e.g. America/Chicago">Time zone</Label>
              <Input value={draft.timezone} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label hint="Stocks/ETFs like SPY, crypto like BTC/USD">Watchlist</Label>
            <Input value={watchText} onChange={(e) => setWatchText(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.allowCrypto} onChange={(e) => setDraft({ ...draft, allowCrypto: e.target.checked })} />
            Allow crypto (trades 24/7)
          </label>
          <Button
            loading={saving}
            onClick={() => {
              const { paperStartedAt: _p, paused: _q, ...rest } = draft;
              void _p;
              void _q;
              save({ ...rest, watchlist: watchText.split(/[\s,]+/).filter(Boolean) });
            }}
          >
            Save rules
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Activity</CardTitle>
          <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
        </CardHeader>
        <CardBody>
          <ul className="space-y-1.5 text-sm">
            {status.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="text-slate-400 shrink-0 w-32">{time(e.createdAt)}</span>
                <span className={cn(e.level === "error" && "text-red-600", e.level === "warn" && "text-amber-700", e.level === "trade" && "font-medium")}>{e.message}</span>
              </li>
            ))}
            {status.events.length === 0 && <li className="text-slate-500">Nothing yet.</li>}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <Card>
      <CardBody className="p-4">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn("text-xl font-semibold", tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : "text-slate-900")}>{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </CardBody>
    </Card>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            {head.map((h) => <th key={h} className="font-medium pb-2 pr-4">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => <td key={j} className="py-2 pr-4 whitespace-nowrap">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
