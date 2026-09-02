import Anthropic from "@anthropic-ai/sdk";

// A single shared client. `new Anthropic()` resolves credentials from the
// environment (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN / an `ant auth login`
// profile) so no key needs to be hardcoded here.
export const anthropic = new Anthropic();

// Deployers can override the model via env without touching code.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";
