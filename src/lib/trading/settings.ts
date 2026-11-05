import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { HARD_LIMITS } from "./config";

export async function getTradingSettings() {
  return prisma.tradingSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
}

export type TradingSettingsRow = Awaited<ReturnType<typeof getTradingSettings>>;

export function parseWatchlist(s: TradingSettingsRow): string[] {
  try {
    const list = JSON.parse(s.watchlist);
    return Array.isArray(list) ? list.map(String) : [];
  } catch {
    return [];
  }
}

const symbol = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z.]{1,6}$|^[A-Z]{2,6}\/USD$/, "Use tickers like SPY or crypto pairs like BTC/USD");

export const settingsUpdateSchema = z
  .object({
    paused: z.boolean(),
    accountSizeUsd: z.number().min(1).max(100_000),
    dailyLossLimitUsd: z.number().min(0.5).max(HARD_LIMITS.maxDailyLossUsd),
    maxRiskPerTradeUsd: z.number().min(0.1).max(HARD_LIMITS.maxRiskPerTradeUsd),
    maxPositionUsd: z.number().min(1).max(100_000),
    maxOpenPositions: z.number().int().min(1).max(10),
    maxProposalsPerDay: z.number().int().min(1).max(20),
    proposalTtlMinutes: z.number().int().min(2).max(120),
    allowCrypto: z.boolean(),
    watchlist: z.array(symbol).min(1).max(40),
    timezone: z.string().min(1),
    quietStartHour: z.number().int().min(0).max(23),
    quietEndHour: z.number().int().min(0).max(23),
    maxHoldDays: z.number().int().min(1).max(60),
  })
  .partial();
