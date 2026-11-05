import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as alpaca from "@/lib/trading/alpaca";
import { brokerConfigured, smsConfigured, tradingEnv } from "@/lib/trading/config";
import { computeRiskState, inQuietHours } from "@/lib/trading/engine";
import { effectiveLimits } from "@/lib/trading/risk";
import { getTradingSettings, parseWatchlist } from "@/lib/trading/settings";
import { STRATEGY_NAME } from "@/lib/trading/strategy";

/** Everything the dashboard needs in one call. */
export async function GET() {
  const settings = await getTradingSettings();
  const [proposals, trades, events] = await Promise.all([
    prisma.tradeProposal.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.trade.findMany({ orderBy: { openedAt: "desc" }, take: 100 }),
    prisma.tradingEvent.findMany({ orderBy: { createdAt: "desc" }, take: 60 }),
  ]);

  let broker: { equity: number; cash: number; marketOpen: boolean; pnlTodayUsd: number } | null = null;
  let brokerError: string | null = null;
  if (brokerConfigured()) {
    try {
      const [account, clock] = await Promise.all([alpaca.getAccount(), alpaca.getClock()]);
      const risk = await computeRiskState(settings, account);
      broker = { equity: Number(account.equity), cash: Number(account.cash), marketOpen: clock.is_open, pnlTodayUsd: risk.pnlTodayUsd };
    } catch (e) {
      brokerError = (e as Error).message;
    }
  }

  const closed = trades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => (t.realizedPnl ?? 0) > 0).length;
  const decided = proposals.filter((p) => p.decidedAt);

  return NextResponse.json({
    env: { mode: tradingEnv().mode, brokerConfigured: brokerConfigured(), smsConfigured: smsConfigured() },
    strategy: STRATEGY_NAME,
    settings: { ...settings, watchlist: parseWatchlist(settings) },
    limits: effectiveLimits(settings),
    quietNow: inQuietHours(settings),
    paperDay: Math.floor((Date.now() - settings.paperStartedAt.getTime()) / 86_400_000) + 1,
    broker,
    brokerError,
    stats: {
      closedTrades: closed.length,
      wins,
      winRate: closed.length ? Math.round((wins / closed.length) * 100) : null,
      realizedPnl: Math.round(closed.reduce((a, t) => a + (t.realizedPnl ?? 0), 0) * 100) / 100,
      proposals: proposals.length,
      approved: decided.filter((p) => p.status !== "rejected").length,
      rejected: decided.filter((p) => p.status === "rejected").length,
    },
    proposals: proposals.map(({ token, ...p }) => ({ ...p, approveUrl: `/trading/approve/${p.id}?t=${token}` })),
    trades,
    events,
  });
}
