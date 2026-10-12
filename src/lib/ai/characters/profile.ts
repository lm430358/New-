import { generateStructured } from "../generate";
import { characterProfileSchema, type CharacterProfile } from "./schemas";

export const CHARACTER_STYLES = [
  { id: "realistic", label: "Photorealistic human" },
  { id: "semi_realistic", label: "Semi-realistic / stylized human" },
  { id: "cartoon", label: "Cartoon" },
  { id: "anime", label: "Anime" },
  { id: "3d_animated", label: "3D animated (Pixar-style)" },
  { id: "other", label: "Other / custom style" },
] as const;

const STYLE_GUIDE: Record<string, string> = {
  realistic: "Photorealistic human, natural skin texture and lighting, like a high-end portrait photograph.",
  semi_realistic: "Semi-realistic illustrated style: recognizably human proportions with a clean painterly/digital-art finish.",
  cartoon: "Western cartoon style: bold clean lines, simplified but expressive features, flat or cel-shaded coloring.",
  anime: "Anime/manga style: characteristic eye shape and line work, consistent with modern anime art direction.",
  "3d_animated": "3D animated feature-film style (Pixar/DreamWorks-like): stylized proportions, soft global illumination, rendered look.",
  other: "A distinct custom art style as described by the user — do not default to photorealism.",
};

/**
 * Turns a free-text description into the structured character profile that
 * becomes the character's permanent memory. This runs exactly once at
 * creation (and again only if the user explicitly edits the character) —
 * every later generation reuses the fields this produces, it never re-reads
 * the original free text.
 */
export async function generateCharacterProfile(params: {
  name?: string;
  description: string;
  style: string;
  species?: string;
}): Promise<CharacterProfile> {
  const styleGuide = STYLE_GUIDE[params.style] ?? STYLE_GUIDE.other;
  const system = [
    "You are a character designer for an AI character-generation platform. Your job is to turn a user's free-text character idea into a complete, visually concrete, internally consistent character profile that will be reused unchanged across hundreds of future image generations.",
    "",
    `ART STYLE: ${params.style} — ${styleGuide}`,
    params.species ? `SPECIES/TYPE: ${params.species}` : "",
    "",
    "Rules:",
    "- Be specific and visually concrete in physicalDescription and faceDescriptor — vague traits ('nice smile', 'average build') cause inconsistent regeneration. Give exact hair color/style, eye color, skin tone, build, age range, and any distinguishing marks.",
    "- Never contradict anything the user explicitly stated; fill in only what they left unspecified, in a way that fits the rest of the description.",
    "- characterSheetPrompt must be a complete, standalone image-generation prompt (it will be sent to an image model with no other context).",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = [
    params.name ? `CHARACTER NAME: ${params.name}` : "CHARACTER NAME: not given — suggest one that fits",
    `DESCRIPTION FROM USER:\n"""${params.description}"""`,
  ].join("\n\n");

  return generateStructured({
    system,
    prompt,
    schema: characterProfileSchema,
    effort: "high",
    maxTokens: 4000,
  });
}
