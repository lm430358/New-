// Runs the follow-up scheduler on a timer for as long as the server process
// is alive — no external cron service, no new accounts, nothing deployed.
// It only ever drafts messages and queues approval Tasks (see
// src/lib/automations/followupScheduler.ts); it never sends anything.
//
// FOLLOWUP_SCHEDULER_INTERVAL_MINUTES controls the cadence (default 60). Set
// FOLLOWUP_SCHEDULER_DISABLED=1 to turn this off entirely (e.g. if you wire
// up a real external cron instead, such as Vercel Cron in production, and
// don't want both running).

const globalForScheduler = globalThis as unknown as { followupSchedulerStarted?: boolean };

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.FOLLOWUP_SCHEDULER_DISABLED === "1") return;
  if (globalForScheduler.followupSchedulerStarted) return;
  globalForScheduler.followupSchedulerStarted = true;

  const { runFollowUpScheduler } = await import("@/lib/automations/followupScheduler");
  const intervalMinutes = Number(process.env.FOLLOWUP_SCHEDULER_INTERVAL_MINUTES) || 60;
  console.log(`[followup-scheduler] registered — checking every ${intervalMinutes} minute(s)`);

  const tick = async () => {
    try {
      const result = await runFollowUpScheduler();
      if (result.drafted.length > 0 || result.errors.length > 0) {
        console.log(
          `[followup-scheduler] scanned=${result.scanned} drafted=${result.drafted.length} skipped=${result.skipped.length} errors=${result.errors.length}`
        );
      }
    } catch (err) {
      console.error("[followup-scheduler] tick failed:", err);
    }
  };

  setInterval(tick, intervalMinutes * 60 * 1000);
}
