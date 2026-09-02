import type { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL, type Effort } from "./client";

export class AiGenerationError extends Error {}

/**
 * Calls Claude and parses its response directly into the given Zod schema
 * using the Messages API's structured-output mode.
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
  let response;
  try {
    response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      output_config: {
        format: zodOutputFormat(schema),
        effort,
      },
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    if (err instanceof Error && /parse structured output/i.test(err.message)) {
      throw new AiGenerationError(
        `The AI response was cut off before it finished (likely exceeded the ${maxTokens}-token budget for this generator) and couldn't be parsed. Try again, or raise maxTokens for this call.`
      );
    }
    throw err;
  }

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
