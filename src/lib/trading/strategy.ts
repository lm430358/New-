/**
 * "Trend pullback" strategy: only buy things already in an uptrend that have
 * dipped, with a volatility-based stop and a target 1.5x the risk.
 *
 * Rules (daily bars):
 *  - Uptrend:  price > 50-day average AND 20-day average > 50-day average
 *  - Pullback: 14-day RSI <= 40 (temporarily oversold inside the uptrend)
 *  - Stop   = entry - 2 x ATR(14)
 *  - Target = entry + 3 x ATR(14)   (reward:risk = 1.5)
 */
import { atr, rsi, sma } from "./indicators";
import type { Bar } from "./alpaca";

export interface Signal {
  symbol: string;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  confidence: number;
  rationale: string;
}

export const STRATEGY_NAME = "Trend pullback (daily)";

const round = (n: number) =>
  n >= 100 ? Math.round(n * 100) / 100 : Math.round(n * 10000) / 10000;

export function evaluate(symbol: string, bars: Bar[], livePrice: number): Signal | null {
  if (bars.length < 60) return null;
  // Use the live price as today's close so intraday dips count.
  const closes = bars.map((b) => b.c);
  closes[closes.length - 1] = livePrice;

  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const rsi14 = rsi(closes, 14);
  const atr14 = atr(bars, 14);
  if (sma20 === null || sma50 === null || rsi14 === null || atr14 === null || atr14 <= 0) return null;

  const uptrend = livePrice > sma50 && sma20 > sma50;
  const pullback = rsi14 <= 40;
  if (!uptrend || !pullback) return null;

  const stop = livePrice - 2 * atr14;
  const target = livePrice + 3 * atr14;
  if (stop <= 0) return null;

  // Confidence: deeper pullback + stronger trend = higher, capped to stay humble.
  const trendStrength = Math.min(1, ((sma20 - sma50) / sma50) * 20); // 5% spread -> 1
  const dipDepth = Math.min(1, (40 - rsi14) / 15); // RSI 25 -> 1
  const confidence = Math.round(45 + 20 * trendStrength + 20 * dipDepth);

  const stopPct = ((livePrice - stop) / livePrice) * 100;
  const rationale =
    `${symbol} is in an uptrend (20-day avg ${round(sma20)} > 50-day avg ${round(sma50)}) ` +
    `and just pulled back (RSI ${rsi14.toFixed(0)}). Stop is 2x the daily range ` +
    `(${stopPct.toFixed(1)}% below); target is 1.5x the risk.`;

  return {
    symbol,
    entryPrice: round(livePrice),
    stopPrice: round(stop),
    targetPrice: round(target),
    confidence,
    rationale,
  };
}
