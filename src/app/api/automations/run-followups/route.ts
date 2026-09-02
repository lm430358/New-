import { NextResponse } from "next/server";
import { runFollowUpScheduler } from "@/lib/automations/followupScheduler";

// Manual/on-demand trigger for the same scan the background instrumentation
// hook (src/instrumentation.ts) runs on a timer. Exists so the scheduler is
// testable without waiting for the timer, and so an operator can force a
// run from the dashboard.
export async function POST() {
  const result = await runFollowUpScheduler();
  return NextResponse.json(result);
}
