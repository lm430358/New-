/**
 * Provider-agnostic contract for image generation. Every image backend
 * (Replicate today; fal.ai, OpenAI Images, Google Imagen, etc. later) is a
 * class implementing this interface. Nothing outside src/lib/image/ should
 * import a provider directly — always go through getImageProvider().
 */

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  /** Reference image URL(s) for identity-locked / face-consistent generation. */
  referenceImageUrls?: string[];
  width?: number;
  height?: number;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  model: string;
}

export interface TrainIdentityInput {
  /** 10-20 reference images of the same character/subject. */
  imageUrls: string[];
  triggerWord: string;
}

export interface TrainIdentityResult {
  trainingId: string;
  status: "training" | "ready" | "failed";
  modelId?: string;
}

export interface ImageProvider {
  readonly name: string;

  /** Plain text-to-image generation — used for the first character sheet. */
  generateImage(input: GenerateImageInput): Promise<GenerateImageResult>;

  /**
   * Identity-locked generation: takes a face/reference image plus a new
   * prompt and produces a new image that keeps the same identity. This is
   * the method scene generation uses once a character has a reference image.
   */
  generateConsistentImage(input: GenerateImageInput): Promise<GenerateImageResult>;

  /**
   * Optional: kick off a per-character LoRA training job. Not required for
   * the MVP identity-lock path (reference_image mode) — implemented as a
   * capability flag so callers can detect support before using it.
   */
  trainIdentity?(input: TrainIdentityInput): Promise<TrainIdentityResult>;
  getTrainingStatus?(trainingId: string): Promise<TrainIdentityResult>;
}

export class ImageProviderError extends Error {}
