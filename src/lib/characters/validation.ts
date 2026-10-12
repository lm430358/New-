import { z } from "zod";

export const createCharacterSchema = z.object({
  name: z.string().optional(),
  description: z.string().min(10, "Describe the character in a bit more detail"),
  style: z.enum(["realistic", "semi_realistic", "cartoon", "anime", "3d_animated", "other"]),
  species: z.string().optional(),
});
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export const updateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  physicalDescription: z.string().min(1).optional(),
  faceDescriptor: z.string().optional(),
  defaultOutfitDescription: z.string().optional(),
  personalityTraits: z.array(z.string()).optional(),
  personalitySummary: z.string().optional(),
  background: z.string().optional(),
  voiceDescription: z.string().optional(),
  negativePrompt: z.string().optional(),
  identityLockMode: z.enum(["reference_image", "lora", "seed_only"]).optional(),
});
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;

export const createOutfitSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const createRelationshipSchema = z.object({
  toCharacterId: z.string().min(1),
  relationshipType: z.string().min(1),
  description: z.string().optional(),
});

export const sceneCharacterSchema = z.object({
  characterId: z.string().min(1),
  outfitDescription: z.string().optional(),
});

export const generateSceneSchema = z.object({
  characters: z.array(sceneCharacterSchema).min(1).max(6),
  environment: z.string().min(1),
  pose: z.string().optional(),
  expression: z.string().optional(),
  cameraAngle: z.string().optional(),
  lighting: z.string().optional(),
  additionalDetails: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type GenerateSceneInput = z.infer<typeof generateSceneSchema>;

export const uploadReferenceImageSchema = z.object({
  url: z.string().url(),
  angle: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
