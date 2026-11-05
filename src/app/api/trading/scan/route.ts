import { NextResponse } from "next/server";
import { runCycle } from "@/lib/trading/engine";

/**
 * Run one scan cycle. Called by the dashboard (behind the admin password via proxy.ts)
 * or by an external scheduler with `Authorization: Bearer $TRADING_CRON_SECRET`.
 */
export async function POST() {
  const result = await runCycle();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

