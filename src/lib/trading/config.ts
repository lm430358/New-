/** Environment-derived configuration for the trading assistant. */

export const HARD_LIMITS = {
  /** No settings change can raise the daily loss limit above this. */
  maxDailyLossUsd: 5,
  /** No settings change can raise the per-trade risk above this. */
  maxRiskPerTradeUsd: 2.5,
  /** Alpaca's minimum notional order size. */
  minOrderUsd: 1,
  /** Reject an approval if price moved more than this since the proposal. */
  maxPriceDriftPct: 1,
} as const;

export function tradingEnv() {
  const liveEnabled = process.env.ALPACA_LIVE_ENABLED === "true";
  return {
    alpacaKeyId: process.env.ALPACA_KEY_ID ?? "",
    alpacaSecret: process.env.ALPACA_SECRET_KEY ?? "",
    mode: liveEnabled ? ("live" as const) : ("paper" as const),
    tradingBaseUrl: liveEnabled
      ? "https://api.alpaca.markets"
      : "https://paper-api.alpaca.markets",
    dataBaseUrl: "https://data.alpaca.markets",
    twilioSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    twilioToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    twilioFrom: process.env.TWILIO_FROM_NUMBER ?? "",
    ownerPhone: process.env.OWNER_PHONE_NUMBER ?? "",
    publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
    cronSecret: process.env.TRADING_CRON_SECRET ?? "",
  };
}

export function brokerConfigured() {
  const env = tradingEnv();
  return Boolean(env.alpacaKeyId && env.alpacaSecret);
}

export function smsConfigured() {
  const env = tradingEnv();
  return Boolean(env.twilioSid && env.twilioToken && env.twilioFrom && env.ownerPhone);
}
