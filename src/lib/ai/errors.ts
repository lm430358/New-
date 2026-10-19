/** Turns a raw SDK/auth error into a message safe to show in the UI. */
export function describeAiError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("Could not resolve authentication method")) {
    return "AI features aren't configured yet — set ANTHROPIC_API_KEY (see .env.example) or sign in with `ant auth login`.";
  }
  return `AI request failed: ${message}`;
}
