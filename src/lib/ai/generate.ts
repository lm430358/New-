import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL } from "@/lib/ai/client";
import { ACCURACY_RULES } from "@/lib/ai/context";

/**
 * Thin wrapper around `messages.parse()` — every structured generation call
 * in the app goes through here so the accuracy-rules system prompt is always
 * attached and callers just get back a typed, validated object.
 */
export async function generateStructured<S extends z.ZodType>(opts: {
  schema: S;
  schemaName: string;
  systemExtra?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const system = [ACCURACY_RULES, opts.systemExtra].filter(Boolean).join("\n\n");
  const message = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system,
    messages: [{ role: "user", content: opts.prompt }],
    output_config: {
      format: zodOutputFormat(opts.schema.describe(opts.schemaName)),
    },
  });
  if (!message.parsed_output) {
    throw new Error("AI response could not be parsed into the expected structure.");
  }
  return message.parsed_output;
}
