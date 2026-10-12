import type { Character } from "@prisma/client";
import { generateStructured } from "../generate";
import { scenePromptSchema, type ScenePromptResult } from "./schemas";
import { safeParseJsonArray } from "@/lib/types";

export interface SceneParams {
  environment: string;
  pose?: string;
  expression?: string;
  cameraAngle?: string;
  lighting?: string;
  additionalDetails?: string;
}

export interface SceneCharacterInput {
  character: Character;
  outfitDescription?: string; // overrides the character's defaultOutfitDescription for this scene
}

/**
 * The part of the prompt that must NEVER drift between generations: the
 * character's canonical identity, reused verbatim every time instead of
 * being re-described from memory.
 */
export function buildIdentityBlock(character: Character, outfitOverride?: string): string {
  const traits = safeParseJsonArray(character.personalityTraits);
  const lines = [
    `${character.name} (${character.age ?? "unspecified age"}, ${character.gender ?? "unspecified"}): ${character.physicalDescription}`,
    character.faceDescriptor ? `Face: ${character.faceDescriptor}` : "",
    `Outfit: ${outfitOverride || character.defaultOutfitDescription || "unspecified — choose something consistent with the character"}`,
    traits.length ? `Demeanor/expression tendencies: ${traits.join(", ")}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

const STYLE_PHRASE: Record<string, string> = {
  realistic: "photorealistic photograph",
  semi_realistic: "semi-realistic digital illustration",
  cartoon: "western cartoon illustration",
  anime: "anime illustration",
  "3d_animated": "3D animated feature-film style render",
  other: "custom illustrated style",
};

const ANGLE_PHRASE: Record<string, string> = {
  front: "front-facing, looking directly at camera",
  three_quarter: "three-quarter angle view",
  side: "side profile view",
  closeup: "close-up headshot framing",
  full_body: "full body, standing, front-facing",
};

/**
 * Builds an additional character-sheet reference prompt (a new angle) from
 * the character's already-stored canonical fields — used whenever the user
 * asks for another reference angle after creation, so it never has to fall
 * back to re-describing the character from scratch.
 */
export function buildCharacterSheetPrompt(character: Character, angle: string): string {
  const stylePhrase = STYLE_PHRASE[character.style] ?? STYLE_PHRASE.other;
  const anglePhrase = ANGLE_PHRASE[angle] ?? ANGLE_PHRASE.front;
  return [
    `A ${stylePhrase} character reference image of ${character.name}.`,
    character.physicalDescription,
    character.faceDescriptor,
    `Wearing: ${character.defaultOutfitDescription || "their default outfit"}.`,
    `${anglePhrase}, neutral studio background, even clear lighting, neutral calm expression, consistent with a reference/model sheet.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Compiles a single, ready-to-use scene prompt from one or more characters'
 * canonical identity blocks plus the requested scene parameters. Claude only
 * assembles and phrases the final prompt — it is instructed never to alter
 * the identity details, which are passed in verbatim from the database.
 */
export async function compileScenePrompt(
  characters: SceneCharacterInput[],
  scene: SceneParams,
  relationshipNotes?: string[]
): Promise<ScenePromptResult> {
  const identityBlocks = characters
    .map((c, i) => `CHARACTER ${i + 1} — ${c.character.name}:\n${buildIdentityBlock(c.character, c.outfitDescription)}`)
    .join("\n\n");

  const system = [
    "You compile image-generation prompts for an AI character platform. You are given one or more characters' FIXED identity descriptions and a requested scene. Combine them into one well-formed prompt for an image model.",
    "",
    "Rules:",
    "- Copy the physical/face/outfit details for each character through essentially unchanged — do not invent new physical traits, and do not soften or drop any given detail.",
    "- Clearly separate/stage multiple characters in the composition (e.g. 'on the left... on the right...') so they don't blend into one person.",
    "- Apply the requested pose, expression, environment, camera angle, and lighting to the scene as a whole.",
    "- Output one flowing prompt paragraph (or the model's preferred prompt style), not a list.",
  ].join("\n");

  const prompt = [
    identityBlocks,
    relationshipNotes?.length ? `RELATIONSHIPS IN THIS SCENE:\n${relationshipNotes.join("\n")}` : "",
    "SCENE REQUEST:",
    `Environment/location: ${scene.environment}`,
    scene.pose ? `Pose/action: ${scene.pose}` : "",
    scene.expression ? `Expression: ${scene.expression}` : "",
    scene.cameraAngle ? `Camera angle: ${scene.cameraAngle}` : "",
    scene.lighting ? `Lighting: ${scene.lighting}` : "",
    scene.additionalDetails ? `Additional details: ${scene.additionalDetails}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return generateStructured({
    system,
    prompt,
    schema: scenePromptSchema,
    effort: "medium",
    maxTokens: 2000,
  });
}
