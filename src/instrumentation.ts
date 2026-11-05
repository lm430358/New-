/**
 * Optional in-process scheduler: set TRADING_AUTOSCAN_MINUTES (e.g. 5) to run the
 * trading scan on a timer while the server is up. Only for a long-running server
 * (`npm start` on your own machine/VPS) — on serverless hosts use an external cron
 * that POSTs to /api/trading/scan instead.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const minutes = Number(process.env.TRADING_AUTOSCAN_MINUTES ?? 0);
  if (!minutes || minutes < 1) return;
  const { runCycle } = await import("./lib/trading/engine");
  const tick = () =>
    runCycle()
      .then((r) => console.log(`[trading] ${r.summary.join(" | ")}`))
      .catch((e) => console.error("[trading] scan error", e));
  setInterval(tick, minutes * 60_000);
  setTimeout(tick, 10_000);
  console.log(`[trading] auto-scan every ${minutes} min`);
}
