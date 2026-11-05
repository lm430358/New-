/** Position sizing and the hard rules every trade must pass. Pure functions. */
import { HARD_LIMITS } from "./config";

export interface RiskSettings {
  accountSizeUsd: number;
  dailyLossLimitUsd: number;
  maxRiskPerTradeUsd: number;
  maxPositionUsd: number;
  maxOpenPositions: number;
}

export interface RiskState {
  /** Realized P&L today plus unrealized P&L of open bot positions (negative = loss). */
  pnlTodayUsd: number;
  /** Dollars currently tied up in open bot positions. */
  openExposureUsd: number;
  openPositions: number;
  /** Cash the broker says is available without margin. */
  brokerCashUsd: number;
  /** For stocks in small accounts: day trades used in the last 5 days. */
  dayTradesUsed: number;
  brokerEquityUsd: number;
}

export type SizeResult =
  | { ok: true; notionalUsd: number; maxLossUsd: number }
  | { ok: false; reason: string };

export function effectiveLimits(s: RiskSettings) {
  return {
    dailyLoss: Math.min(s.dailyLossLimitUsd, HARD_LIMITS.maxDailyLossUsd),
    riskPerTrade: Math.min(s.maxRiskPerTradeUsd, HARD_LIMITS.maxRiskPerTradeUsd),
  };
}

export function dailyLimitHit(s: RiskSettings, st: RiskState) {
  return st.pnlTodayUsd <= -effectiveLimits(s).dailyLoss;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

export function sizePosition(
  s: RiskSettings,
  st: RiskState,
  entry: number,
  stop: number,
  assetClass: "stock" | "crypto"
): SizeResult {
  const lim = effectiveLimits(s);
  if (dailyLimitHit(s, st)) return { ok: false, reason: `Daily loss limit (${usd(lim.dailyLoss)}) reached` };
  if (st.openPositions >= s.maxOpenPositions)
    return { ok: false, reason: `Already holding ${st.openPositions} positions (max ${s.maxOpenPositions})` };
  if (assetClass === "stock" && st.brokerEquityUsd < 25_000 && st.dayTradesUsed >= 3)
    return { ok: false, reason: "Day-trade limit for small accounts reached (3 in 5 days)" };
  if (stop >= entry) return { ok: false, reason: "Stop must be below entry" };

  // Risk for this trade: the per-trade cap, but never more than what's left of today's limit.
  const roomToday = lim.dailyLoss + Math.min(0, st.pnlTodayUsd);
  const riskUsd = Math.min(lim.riskPerTrade, roomToday);
  const stopFraction = (entry - stop) / entry;

  const budgetLeft = s.accountSizeUsd - st.openExposureUsd;
  let notional = Math.min(riskUsd / stopFraction, s.maxPositionUsd, budgetLeft, st.brokerCashUsd);
  notional = Math.floor(notional * 100) / 100;

  if (notional < HARD_LIMITS.minOrderUsd)
    return { ok: false, reason: `Position would be ${usd(Math.max(0, notional))}, below the $1 minimum` };

  return { ok: true, notionalUsd: notional, maxLossUsd: Math.round(notional * stopFraction * 100) / 100 };
}
