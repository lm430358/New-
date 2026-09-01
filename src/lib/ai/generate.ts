import type { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, type Effort } from "./client";

export class AiGenerationError extends Error {}

/**
 * Calls Claude and parses its response directly into the given Zod schema
 * using the Messages API's structured-output mode. This is the backbone of
 * every content-generation tool in the app: one call in, one validated,
 * typed object out.
 */
export async function generateStructured<T>({
  system,
  prompt,
  schema,
  maxTokens = 8000,
  effort = "medium",
}: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  effort?: Effort;
}): Promise<T> {
  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    output_config: {
      format: zodOutputFormat(schema),
      effort,
    },
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new AiGenerationError(
      "The AI declined to generate this content. Try rephrasing the request."
    );
  }

  if (!response.parsed_output) {
    throw new AiGenerationError("The AI response could not be parsed into the expected format.");
  }

  return response.parsed_output;
}
