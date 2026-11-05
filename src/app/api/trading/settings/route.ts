import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/trading/engine";
import { getTradingSettings, settingsUpdateSchema } from "@/lib/trading/settings";

export async function GET() {
  return NextResponse.json({ settings: await getTradingSettings() });
}

export async function PUT(request: Request) {
  const parsed = settingsUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { watchlist, ...rest } = parsed.data;
  if (rest.timezone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: rest.timezone });
    } catch {
      return NextResponse.json({ error: "Unknown timezone" }, { status: 400 });
    }
  }
  await getTradingSettings();
  const settings = await prisma.tradingSettings.update({
    where: { id: "singleton" },
    data: { ...rest, ...(watchlist ? { watchlist: JSON.stringify([...new Set(watchlist)]) } : {}) },
  });
  await log("info", "Settings updated");
  return NextResponse.json({ settings });
}
