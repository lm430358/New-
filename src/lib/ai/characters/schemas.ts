import { z } from "zod";

/**
 * What Claude extracts from a user's free-text character description. This
 * is the structured "character memory" — never the raw description itself.
 * Every field here is designed to be reused verbatim in future prompts
 * instead of re-derived from scratch each time.
 */
export const characterProfileSchema = z.object({
  suggestedName: z.string().describe("A fitting first name if the user didn't give one, otherwise echo the given name"),
  age: z.string().describe("Apparent age, e.g. '32' or 'late 20s' or 'child, about 8'"),
  gender: z.string().describe("e.g. man, woman, non-binary, or the appropriate term for a non-human character"),
  occupation: z.string().optional().describe("Job or role, if any was given or clearly implied"),

  physicalDescription: z
    .string()
    .describe(
      "The single canonical appearance paragraph: face shape, skin tone, eye color, hair color/style/texture, body type/height build, and any distinguishing marks (scars, freckles, tattoos). Specific and visually concrete — written so an image model recreates the SAME person every time. 3-5 sentences."
    ),
  faceDescriptor: z
    .string()
    .describe(
      "A tighter, face-only description (bone structure, eyes, nose, mouth, eyebrows, skin texture) used to weight identity-locked generations. 1-2 sentences."
    ),
  defaultOutfitDescription: z
    .string()
    .describe("The character's signature/default outfit, specific enough to redraw consistently. 1-2 sentences."),

  personalityTraits: z
    .array(z.string())
    .min(3)
    .max(8)
    .describe("Short trait words/phrases, e.g. 'gruff but kind', 'quick-witted', 'anxious perfectionist'"),
  personalitySummary: z.string().describe("2-4 sentences on how this personality shows up in behavior and speech"),
  background: z.string().describe("2-5 sentence backstory/bio consistent with the given description"),

  voiceDescription: z
    .string()
    .describe("How this character sounds when speaking: tone, pace, pitch, accent, speech quirks. 1-3 sentences."),

  negativePrompt: z
    .string()
    .describe(
      "Comma-separated list of things that must NEVER appear when generating this character (e.g. features contradicting the description, wrong age range, extra limbs, wrong art style artifacts)."
    ),

  characterSheetPrompt: z
    .string()
    .describe(
      "A complete, ready-to-use image-generation prompt for an initial character reference sheet: neutral studio background, front-facing, clear even lighting, neutral expression, head-to-mid-torso framing. Must bake in the physical description and default outfit. Include the requested art style explicitly."
    ),
});
export type CharacterProfile = z.infer<typeof characterProfileSchema>;

export const scenePromptSchema = z.object({
  compiledPrompt: z
    .string()
    .describe("The full, ready-to-use image-generation prompt for this scene, combining every character's identity, the scene description, and the art style."),
  negativePrompt: z.string().describe("Comma-separated negative prompt covering all characters in the scene plus the scene-specific asks."),
});
export type ScenePromptResult = z.infer<typeof scenePromptSchema>;
