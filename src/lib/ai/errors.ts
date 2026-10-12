import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { AiGenerationError } from "./generate";

/**
 * Turns an error from a generation call into a JSON response with a message the user can
 * act on, instead of surfacing raw SDK text.
 */
export function aiErrorResponse(err: unknown) {
  const [status, error] = describe(err);
  if (status >= 500 && !(err instanceof AiGenerationError)) console.error("[ai]", err);
  return NextResponse.json({ error }, { status });
}

function describe(err: unknown): [number, string] {
  if (err instanceof AiGenerationError) return [502, err.message];
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return [502, "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in your .env file."];
  }
  if (err instanceof Anthropic.RateLimitError) {
    return [429, "The AI service is busy right now. Wait a moment and try again."];
  }
  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    return [504, "The AI took too long to respond. Try again, or try a smaller request."];
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return [502, "Couldn't reach the AI service. Check your internet connection and try again."];
  }
  if (err instanceof Anthropic.APIError) {
    return [502, `The AI service returned an error (${err.status ?? "unknown"}). Please try again.`];
  }
  // With no credentials at all the SDK throws a plain Error (no typed class to check).
  if (err instanceof Error && /authentication method/i.test(err.message)) {
    return [500, "AI isn't set up yet: add ANTHROPIC_API_KEY to your .env file (see README) and restart the app."];
  }
  return [500, err instanceof Error ? err.message : "Something went wrong."];
}
