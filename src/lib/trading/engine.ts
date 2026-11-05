/**
 * The trading loop: reconcile orders, manage exits, find new trades, and
 * execute only what the owner approves.
 */
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import * as alpaca from "./alpaca";
import { brokerConfigured, HARD_LIMITS, tradingEnv } from "./config";
import { dailyLimitHit, effectiveLimits, sizePosition, type RiskState } from "./risk";
import { getTradingSettings, parseWatchlist, type TradingSettingsRow } from "./settings";
import { sendText } from "./sms";
import { evaluate, type Signal } from "./strategy";

const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;

export async function log(level: "info" | "warn" | "error" | "trade", message: string) {
  await prisma.tradingEvent.create({ data: { level, message } });
}

// ── Time helpers ──────────────────────────────────────────────────────────────

function localParts(tz: string, d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0) % 24;
  return { hour: get("hour"), minute: Number(parts.find((p) => p.type === "minute")?.value ?? 0), second: Number(parts.find((p) => p.type === "second")?.value ?? 0) };
}

export function startOfLocalDay(tz: string, now = new Date()) {
  const { hour, minute, second } = localParts(tz, now);
  return new Date(now.getTime() - ((hour * 60 + minute) * 60 + second) * 1000 - now.getMilliseconds());
}

export function inQuietHours(s: TradingSettingsRow, now = new Date()) {
  const { hour } = localParts(s.timezone, now);
  const { quietStartHour: a, quietEndHour: b } = s;
  if (a === b) return false;
  return a < b ? hour >= a && hour < b : hour >= a || hour < b;
}

// ── Risk state ────────────────────────────────────────────────────────────────

async function priceOrNull(symbol: string) {
  try {
    return await alpaca.getLatestPrice(symbol);
  } catch {
    return null;
  }
}

export async function computeRiskState(s: TradingSettingsRow, account: alpaca.AlpacaAccount): Promise<RiskState> {
  const dayStart = startOfLocalDay(s.timezone);
  const [active, closedToday] = await Promise.all([
    prisma.trade.findMany({ where: { status: { in: ["pending_fill", "open", "closing"] } } }),
    prisma.trade.findMany({ where: { status: "closed", closedAt: { gte: dayStart } } }),
  ]);
  let unrealized = 0;
  let exposure = 0;
  for (const t of active) {
    exposure += t.notionalUsd;
    if (t.qty && t.entryPrice) {
      const p = await priceOrNull(t.symbol);
      if (p) unrealized += (p - t.entryPrice) * t.qty;
    }
  }
  const realized = closedToday.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0);
  return {
    pnlTodayUsd: realized + unrealized,
    openExposureUsd: exposure,
    openPositions: active.length,
    brokerCashUsd: Number(account.non_marginable_buying_power ?? account.cash),
    dayTradesUsed: account.daytrade_count ?? 0,
    brokerEquityUsd: Number(account.equity),
  };
}

// ── Order reconciliation ──────────────────────────────────────────────────────

async function reconcile() {
  const trades = await prisma.trade.findMany({ where: { status: { in: ["pending_fill", "closing"] } } });
  for (const t of trades) {
    const orderId = t.status === "pending_fill" ? t.entryOrderId : t.exitOrderId;
    if (!orderId) continue;
    const o = await alpaca.getOrder(orderId);
    const filled = o.status === "filled";
    const dead = ["canceled", "expired", "rejected", "done_for_day"].includes(o.status);
    if (t.status === "pending_fill") {
      if (filled) {
        await prisma.trade.update({
          where: { id: t.id },
          data: { status: "open", qty: Number(o.filled_qty), entryPrice: Number(o.filled_avg_price), openedAt: new Date() },
        });
        await log("trade", `Bought ${Number(Number(o.filled_qty).toFixed(6))} ${t.symbol} @ ${Number(o.filled_avg_price)}`);
      } else if (dead) {
        await prisma.trade.update({ where: { id: t.id }, data: { status: "failed" } });
        await log("warn", `Buy order for ${t.symbol} ${o.status}`);
      }
    } else if (filled) {
      const exit = Number(o.filled_avg_price);
      const pnl = Math.round((exit - (t.entryPrice ?? exit)) * (t.qty ?? 0) * 100) / 100;
      await prisma.trade.update({
        where: { id: t.id },
        data: { status: "closed", exitPrice: exit, realizedPnl: pnl, closedAt: new Date() },
      });
      await log("trade", `Sold ${t.symbol} @ ${exit} (${t.exitReason}). P&L ${pnl > 0 ? "+" : ""}${usd(pnl)}`);
      await sendText(
        `${tradingEnv().mode === "paper" ? "PAPER" : "REAL"}: Closed ${t.symbol} (${t.exitReason}) @ ${exit}. P&L ${pnl > 0 ? "+" : ""}${usd(pnl)}.`
      );
    } else if (dead) {
      // Exit didn't go through; put it back to open so the next cycle retries.
      await prisma.trade.update({ where: { id: t.id }, data: { status: "open", exitOrderId: null } });
      await log("warn", `Sell order for ${t.symbol} ${o.status}; will retry`);
    }
  }
}

// ── Exits (pre-approved as part of the trade plan) ───────────────────────────

async function manageExits(s: TradingSettingsRow, marketOpen: boolean) {
  const open = await prisma.trade.findMany({ where: { status: "open" } });
  for (const t of open) {
    if (!t.qty || !t.entryPrice) continue;
    if (!alpaca.isCrypto(t.symbol) && !marketOpen) continue;
    const price = await priceOrNull(t.symbol);
    if (!price) continue;
    const ageDays = (Date.now() - t.openedAt.getTime()) / 86_400_000;
    const reason =
      price <= t.stopPrice ? "stop" : price >= t.targetPrice ? "target" : ageDays >= s.maxHoldDays ? "time" : null;
    if (!reason) continue;
    try {
      const order = await alpaca.sellQty(t.symbol, t.qty);
      await prisma.trade.update({ where: { id: t.id }, data: { status: "closing", exitOrderId: order.id, exitReason: reason } });
      await log("trade", `Exit triggered for ${t.symbol} (${reason}) at ~${price}`);
    } catch (e) {
      await log("error", `Could not sell ${t.symbol}: ${(e as Error).message}`);
    }
  }
}

// ── Finding trades ────────────────────────────────────────────────────────────

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() {
  const bytes = crypto.randomBytes(3);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

function proposalText(p: { code: string; id: string; token: string; symbol: string; notionalUsd: number; entryPrice: number; stopPrice: number; targetPrice: number; maxLossUsd: number; confidence: number }, ttl: number) {
  const env = tradingEnv();
  const link = `${env.publicBaseUrl}/trading/approve/${p.id}?t=${p.token}`;
  return (
    `${env.mode === "paper" ? "PAPER" : "REAL MONEY"} trade idea ${p.code}: BUY ${usd(p.notionalUsd)} of ${p.symbol} @ ~${p.entryPrice}. ` +
    `Auto-sell at ${p.stopPrice} (max loss ~${usd(p.maxLossUsd)}) or ${p.targetPrice} (target). ` +
    `Confidence ${p.confidence}/100. Reply YES ${p.code} or NO ${p.code} within ${ttl} min. ${link}`
  );
}

async function findEntry(s: TradingSettingsRow, account: alpaca.AlpacaAccount, marketOpen: boolean) {
  const dayStart = startOfLocalDay(s.timezone);
  const proposedToday = await prisma.tradeProposal.count({ where: { createdAt: { gte: dayStart } } });
  if (proposedToday >= s.maxProposalsPerDay) return "Daily proposal limit reached";
  if (await prisma.tradeProposal.count({ where: { status: "pending" } })) return "Waiting on your answer to a pending idea";

  const risk = await computeRiskState(s, account);
  if (dailyLimitHit(s, risk)) return `Daily loss limit hit (${usd(risk.pnlTodayUsd)} today); no new trades until tomorrow`;

  const busy = new Set(
    (await prisma.trade.findMany({ where: { status: { in: ["pending_fill", "open", "closing"] } } })).map((t) => t.symbol)
  );
  const candidates = parseWatchlist(s).filter(
    (sym) => !busy.has(sym) && (alpaca.isCrypto(sym) ? s.allowCrypto : marketOpen)
  );

  const signals: Signal[] = [];
  for (const sym of candidates) {
    try {
      const [bars, price] = await Promise.all([alpaca.getDailyBars(sym), alpaca.getLatestPrice(sym)]);
      const sig = evaluate(sym, bars, price);
      if (sig) signals.push(sig);
    } catch (e) {
      await log("warn", `Skipped ${sym}: ${(e as Error).message}`);
    }
  }
  if (!signals.length) return `Scanned ${candidates.length} symbols; nothing met the rules`;

  signals.sort((a, b) => b.confidence - a.confidence);
  for (const sig of signals) {
    const size = sizePosition(s, risk, sig.entryPrice, sig.stopPrice, alpaca.isCrypto(sig.symbol) ? "crypto" : "stock");
    if (!size.ok) {
      await log("info", `${sig.symbol} qualified but skipped: ${size.reason}`);
      continue;
    }
    let code = newCode();
    while (await prisma.tradeProposal.findUnique({ where: { code } })) code = newCode();
    const p = await prisma.tradeProposal.create({
      data: {
        code,
        token: crypto.randomBytes(16).toString("hex"),
        symbol: sig.symbol,
        assetClass: alpaca.isCrypto(sig.symbol) ? "crypto" : "stock",
        notionalUsd: size.notionalUsd,
        entryPrice: sig.entryPrice,
        stopPrice: sig.stopPrice,
        targetPrice: sig.targetPrice,
        maxLossUsd: size.maxLossUsd,
        confidence: sig.confidence,
        rationale: sig.rationale,
        expiresAt: new Date(Date.now() + s.proposalTtlMinutes * 60_000),
      },
    });
    const sent = await sendText(proposalText(p, s.proposalTtlMinutes));
    await log(
      "info",
      `Proposed ${p.code}: buy ${usd(p.notionalUsd)} ${p.symbol}` + (sent.sent ? " (texted)" : ` (not texted: ${sent.error}; approve on dashboard)`)
    );
    return `Proposed ${p.code} (${p.symbol})`;
  }
  return "Signals found but none passed risk rules";
}

// ── The cycle ─────────────────────────────────────────────────────────────────

let running = false;

export async function runCycle(): Promise<{ ok: boolean; summary: string[] }> {
  if (!brokerConfigured()) return { ok: false, summary: ["Alpaca keys are not set (ALPACA_KEY_ID / ALPACA_SECRET_KEY)"] };
  if (running) return { ok: false, summary: ["A scan is already running"] };
  running = true;
  const summary: string[] = [];
  try {
    const s = await getTradingSettings();
    await reconcile();

    const expired = await prisma.tradeProposal.updateMany({
      where: { status: "pending", expiresAt: { lt: new Date() } },
      data: { status: "expired" },
    });
    if (expired.count) summary.push(`${expired.count} idea(s) expired unanswered`);

    const [clock, account] = await Promise.all([alpaca.getClock(), alpaca.getAccount()]);
    if (account.trading_blocked || account.account_blocked) {
      summary.push("Broker account is blocked from trading");
      return { ok: false, summary };
    }

    // Exits always run (even paused / quiet hours) — they protect money already at risk.
    await manageExits(s, clock.is_open);
    await reconcile();

    if (s.paused) summary.push("Paused: not looking for new trades");
    else if (inQuietHours(s)) summary.push("Quiet hours: not texting new ideas");
    else summary.push(await findEntry(s, account, clock.is_open));

    return { ok: true, summary };
  } catch (e) {
    const msg = (e as Error).message;
    await log("error", `Scan failed: ${msg}`);
    summary.push(`Error: ${msg}`);
    return { ok: false, summary };
  } finally {
    running = false;
  }
}

// ── Decisions ─────────────────────────────────────────────────────────────────

export async function decide(
  proposalId: string,
  decision: "yes" | "no",
  via: "sms" | "web"
): Promise<{ ok: boolean; message: string }> {
  const p = await prisma.tradeProposal.findUnique({ where: { id: proposalId } });
  if (!p) return { ok: false, message: "Trade idea not found" };
  if (p.status !== "pending") return { ok: false, message: `${p.code} is already ${p.status}` };
  if (p.expiresAt < new Date()) {
    await prisma.tradeProposal.update({ where: { id: p.id }, data: { status: "expired" } });
    return { ok: false, message: `${p.code} expired; prices may have moved. I'll look again.` };
  }

  if (decision === "no") {
    await prisma.tradeProposal.update({ where: { id: p.id }, data: { status: "rejected", decidedVia: via, decidedAt: new Date() } });
    await log("info", `You declined ${p.code} (${p.symbol})`);
    return { ok: true, message: `OK, skipped ${p.code} (${p.symbol}).` };
  }

  // Claim the proposal atomically so a double "YES" can't buy twice.
  const claimed = await prisma.tradeProposal.updateMany({
    where: { id: p.id, status: "pending" },
    data: { status: "approved", decidedVia: via, decidedAt: new Date() },
  });
  if (!claimed.count) return { ok: false, message: `${p.code} was already handled` };

  const fail = async (detail: string) => {
    await prisma.tradeProposal.update({ where: { id: p.id }, data: { status: "failed", statusDetail: detail } });
    await log("warn", `${p.code} not executed: ${detail}`);
    return { ok: false, message: `${p.code} NOT placed: ${detail}` };
  };

  try {
    const s = await getTradingSettings();
    if (s.paused) return fail("trading is paused");
    const [clock, account] = await Promise.all([alpaca.getClock(), alpaca.getAccount()]);
    if (p.assetClass === "stock" && !clock.is_open) return fail("stock market is closed");

    const price = await alpaca.getLatestPrice(p.symbol);
    const drift = Math.abs(price - p.entryPrice) / p.entryPrice * 100;
    if (drift > HARD_LIMITS.maxPriceDriftPct) return fail(`price moved ${drift.toFixed(1)}% since the idea`);
    if (price <= p.stopPrice) return fail("price is already at the stop");

    // Re-check every risk rule with fresh numbers, and never exceed what you approved.
    const risk = await computeRiskState(s, account);
    const size = sizePosition(s, risk, price, p.stopPrice, p.assetClass as "stock" | "crypto");
    if (!size.ok) return fail(size.reason);
    const notional = Math.min(size.notionalUsd, p.notionalUsd);

    const order = await alpaca.buyNotional(p.symbol, notional);
    await prisma.trade.create({
      data: {
        proposalId: p.id,
        symbol: p.symbol,
        assetClass: p.assetClass,
        notionalUsd: notional,
        stopPrice: p.stopPrice,
        targetPrice: p.targetPrice,
        entryOrderId: order.id,
      },
    });
    await log("trade", `You approved ${p.code}: buy order placed for ${usd(notional)} of ${p.symbol}`);
    // Market orders usually fill in a moment; record the fill now if so.
    await new Promise((r) => setTimeout(r, 1500));
    await reconcile().catch(() => {});
    return {
      ok: true,
      message: `Placed: BUY ${usd(notional)} of ${p.symbol}. Auto-sell at ${p.stopPrice} (stop) or ${p.targetPrice} (target).`,
    };
  } catch (e) {
    return fail((e as Error).message.slice(0, 200));
  }
}

// ── SMS commands ──────────────────────────────────────────────────────────────

export async function handleCommand(text: string): Promise<string> {
  const words = text.trim().toUpperCase().split(/\s+/);
  const cmd = words[0] ?? "";
  const code = words[1];

  if (["YES", "Y", "NO", "N"].includes(cmd)) {
    const p = code
      ? await prisma.tradeProposal.findUnique({ where: { code } })
      : await prisma.tradeProposal.findFirst({ where: { status: "pending" }, orderBy: { createdAt: "desc" } });
    if (!p) return code ? `No trade idea with code ${code}.` : "There's no trade idea waiting for an answer.";
    const r = await decide(p.id, cmd.startsWith("Y") ? "yes" : "no", "sms");
    return r.message;
  }
  if (cmd === "PAUSE") {
    await prisma.tradingSettings.update({ where: { id: "singleton" }, data: { paused: true } });
    await log("warn", "Paused by text");
    return "Paused. I won't propose new trades. Open positions still keep their stop/target. Text RESUME to restart.";
  }
  if (cmd === "RESUME") {
    await getTradingSettings();
    await prisma.tradingSettings.update({ where: { id: "singleton" }, data: { paused: false } });
    await log("info", "Resumed by text");
    return "Resumed. I'll text you when I find a trade.";
  }
  if (cmd === "STATUS") {
    const s = await getTradingSettings();
    const open = await prisma.trade.findMany({ where: { status: { in: ["open", "pending_fill", "closing"] } } });
    const dayStart = startOfLocalDay(s.timezone);
    const closed = await prisma.trade.findMany({ where: { status: "closed", closedAt: { gte: dayStart } } });
    const realized = closed.reduce((a, t) => a + (t.realizedPnl ?? 0), 0);
    return (
      `${s.paused ? "PAUSED. " : ""}Open: ${open.map((t) => t.symbol).join(", ") || "none"}. ` +
      `Realized today: ${usd(realized)}. Daily loss limit: ${usd(effectiveLimits(s).dailyLoss)}.`
    );
  }
  return "Commands: YES <code>, NO <code>, PAUSE, RESUME, STATUS.";
}
