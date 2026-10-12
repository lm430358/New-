import type {
  Character,
  CharacterReferenceImage,
  CharacterOutfit,
  CharacterRelationship,
} from "@prisma/client";
import { safeParseJsonArray } from "@/lib/types";

export type CharacterWithRelations = Character & {
  referenceImages?: CharacterReferenceImage[];
  outfits?: CharacterOutfit[];
  relationshipsFrom?: (CharacterRelationship & { toCharacter: Character })[];
  relationshipsTo?: (CharacterRelationship & { fromCharacter: Character })[];
};

export function toCharacterDTO(character: CharacterWithRelations) {
  return {
    id: character.id,
    name: character.name,
    style: character.style,
    species: character.species,
    age: character.age,
    gender: character.gender,
    occupation: character.occupation,
    personalityTraits: safeParseJsonArray(character.personalityTraits),
    personalitySummary: character.personalitySummary,
    background: character.background,
    voiceDescription: character.voiceDescription,
    voiceProviderId: character.voiceProviderId,
    physicalDescription: character.physicalDescription,
    faceDescriptor: character.faceDescriptor,
    defaultOutfitDescription: character.defaultOutfitDescription,
    seed: character.seed,
    negativePrompt: character.negativePrompt,
    identityLockMode: character.identityLockMode,
    loraModelId: character.loraModelId,
    loraStatus: character.loraStatus,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
    referenceImages: character.referenceImages ?? [],
    primaryReferenceImageUrl:
      character.referenceImages?.find((r) => r.isPrimary)?.url ??
      character.referenceImages?.[0]?.url ??
      null,
    outfits: character.outfits ?? [],
    relationships: [
      ...(character.relationshipsFrom ?? []).map((r) => ({
        id: r.id,
        direction: "from" as const,
        otherCharacter: { id: r.toCharacter.id, name: r.toCharacter.name },
        relationshipType: r.relationshipType,
        description: r.description,
      })),
      ...(character.relationshipsTo ?? []).map((r) => ({
        id: r.id,
        direction: "to" as const,
        otherCharacter: { id: r.fromCharacter.id, name: r.fromCharacter.name },
        relationshipType: r.relationshipType,
        description: r.description,
      })),
    ],
  };
}
export type CharacterDTO = ReturnType<typeof toCharacterDTO>;

export const characterRelationsInclude = {
  referenceImages: { orderBy: { createdAt: "asc" as const } },
  outfits: { orderBy: { createdAt: "asc" as const } },
  relationshipsFrom: { include: { toCharacter: true } },
  relationshipsTo: { include: { fromCharacter: true } },
};
