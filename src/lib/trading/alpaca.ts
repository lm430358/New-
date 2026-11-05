/**
 * Minimal Alpaca REST client (trading + market data). Paper by default; see config.ts.
 * Docs: https://docs.alpaca.markets/reference
 */
import { tradingEnv } from "./config";

export interface Bar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface AlpacaAccount {
  equity: string;
  last_equity: string;
  cash: string;
  buying_power: string;
  non_marginable_buying_power?: string;
  daytrade_count: number;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  account_blocked: boolean;
  status: string;
}

export interface AlpacaOrder {
  id: string;
  symbol: string;
  status: string;
  side: string;
  filled_qty: string;
  filled_avg_price: string | null;
}

export interface AlpacaPosition {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price: string;
  unrealized_pl: string;
}

export const isCrypto = (symbol: string) => symbol.includes("/");
/** Alpaca positions report crypto as "BTCUSD" while orders/data use "BTC/USD". */
export const positionSymbol = (symbol: string) => symbol.replace("/", "");

async function call<T>(base: string, path: string, init: RequestInit = {}): Promise<T> {
  const env = tradingEnv();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "APCA-API-KEY-ID": env.alpacaKeyId,
      "APCA-API-SECRET-KEY": env.alpacaSecret,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Alpaca ${init.method ?? "GET"} ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const trading = <T>(path: string, init?: RequestInit) => call<T>(tradingEnv().tradingBaseUrl, path, init);
const data = <T>(path: string) => call<T>(tradingEnv().dataBaseUrl, path);

export const getAccount = () => trading<AlpacaAccount>("/v2/account");
export const getClock = () => trading<{ is_open: boolean; next_open: string; next_close: string }>("/v2/clock");
export const getOrder = (id: string) => trading<AlpacaOrder>(`/v2/orders/${id}`);
export const getPositions = () => trading<AlpacaPosition[]>("/v2/positions");

/** Market buy by dollar amount (fractional). */
export function buyNotional(symbol: string, notionalUsd: number) {
  return trading<AlpacaOrder>("/v2/orders", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      side: "buy",
      type: "market",
      notional: notionalUsd.toFixed(2),
      time_in_force: isCrypto(symbol) ? "gtc" : "day",
    }),
  });
}

/** Market sell of an exact quantity (what we bought). */
export function sellQty(symbol: string, qty: number) {
  return trading<AlpacaOrder>("/v2/orders", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      side: "sell",
      type: "market",
      qty: String(qty),
      time_in_force: isCrypto(symbol) ? "gtc" : "day",
    }),
  });
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** ~100 trading days of daily bars, oldest first. */
export async function getDailyBars(symbol: string): Promise<Bar[]> {
  const start = encodeURIComponent(isoDaysAgo(160));
  if (isCrypto(symbol)) {
    const r = await data<{ bars: Record<string, Bar[]> }>(
      `/v1beta3/crypto/us/bars?symbols=${encodeURIComponent(symbol)}&timeframe=1Day&start=${start}&limit=1000`
    );
    return r.bars?.[symbol] ?? [];
  }
  const r = await data<{ bars: Bar[] | null }>(
    `/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=1Day&start=${start}&limit=1000&feed=iex&adjustment=all`
  );
  return r.bars ?? [];
}

export async function getLatestPrice(symbol: string): Promise<number> {
  if (isCrypto(symbol)) {
    const r = await data<{ trades: Record<string, { p: number }> }>(
      `/v1beta3/crypto/us/latest/trades?symbols=${encodeURIComponent(symbol)}`
    );
    const p = r.trades?.[symbol]?.p;
    if (!p) throw new Error(`No latest price for ${symbol}`);
    return p;
  }
  const r = await data<{ trade: { p: number } }>(
    `/v2/stocks/${encodeURIComponent(symbol)}/trades/latest?feed=iex`
  );
  if (!r.trade?.p) throw new Error(`No latest price for ${symbol}`);
  return r.trade.p;
}
