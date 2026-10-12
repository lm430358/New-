import type { ImageProvider } from "./types";
import { ReplicateImageProvider } from "./providers/replicate";

export * from "./types";

const providers: Record<string, () => ImageProvider> = {
  replicate: () => new ReplicateImageProvider(),
};

/**
 * Single entry point for every image-generation call in the app. Swapping
 * the backend (fal.ai, OpenAI Images, Google Imagen, ...) means adding a
 * provider class in ./providers and registering it here — nothing else in
 * the codebase needs to change.
 */
export function getImageProvider(): ImageProvider {
  const key = process.env.IMAGE_PROVIDER || "replicate";
  const factory = providers[key];
  if (!factory) throw new Error(`Unknown IMAGE_PROVIDER "${key}"`);
  return factory();
}
