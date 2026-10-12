import type {
  GenerateImageInput,
  GenerateImageResult,
  ImageProvider,
  TrainIdentityInput,
  TrainIdentityResult,
} from "../types";
import { ImageProviderError } from "../types";

const API_BASE = "https://api.replicate.com/v1";

// Official, currently-published Replicate model slugs. Overridable via env
// so a deployer can point at a newer model without a code change.
const TEXT2IMG_MODEL = process.env.REPLICATE_TEXT2IMG_MODEL || "black-forest-labs/flux-dev";
const FACE_CONSISTENT_MODEL = process.env.REPLICATE_FACE_MODEL || "zsxkib/instant-id";
const LORA_TRAINER_MODEL = process.env.REPLICATE_LORA_TRAINER || "ostris/flux-dev-lora-trainer";

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: unknown;
  error?: string | null;
}

function authHeaders(): Record<string, string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new ImageProviderError(
      "REPLICATE_API_TOKEN is not set. Add it to .env to enable image generation."
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function createPrediction(
  modelPath: string,
  input: Record<string, unknown>
): Promise<ReplicatePrediction> {
  const res = await fetch(`${API_BASE}/models/${modelPath}/predictions`, {
    method: "POST",
    headers: { ...authHeaders(), Prefer: "wait=55" },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ImageProviderError(`Replicate request failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function pollPrediction(id: string, timeoutMs = 120_000): Promise<ReplicatePrediction> {
  const start = Date.now();
  let prediction: ReplicatePrediction = { id, status: "starting" };
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${API_BASE}/predictions/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new ImageProviderError(`Replicate poll failed (${res.status})`);
    prediction = await res.json();
    if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
      return prediction;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new ImageProviderError(`Replicate prediction ${id} timed out`);
}

function extractImageUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  throw new ImageProviderError("Replicate returned an unexpected output shape for this model.");
}

async function runToImage(modelPath: string, input: Record<string, unknown>): Promise<string> {
  let prediction = await createPrediction(modelPath, input);
  if (prediction.status !== "succeeded" && prediction.status !== "failed") {
    prediction = await pollPrediction(prediction.id);
  }
  if (prediction.status === "failed" || prediction.status === "canceled") {
    throw new ImageProviderError(`Image generation failed: ${prediction.error || "unknown error"}`);
  }
  return extractImageUrl(prediction.output);
}

export class ReplicateImageProvider implements ImageProvider {
  readonly name = "replicate";

  async generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    const imageUrl = await runToImage(TEXT2IMG_MODEL, {
      prompt: input.prompt,
      ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
      aspect_ratio: aspectRatioFor(input.width, input.height),
    });
    return { imageUrl, model: TEXT2IMG_MODEL };
  }

  async generateConsistentImage(input: GenerateImageInput): Promise<GenerateImageResult> {
    const referenceImage = input.referenceImageUrls?.[0];
    if (!referenceImage) {
      // No identity anchor yet — fall back to plain generation rather than
      // silently pretending identity-lock happened.
      return this.generateImage(input);
    }
    const imageUrl = await runToImage(FACE_CONSISTENT_MODEL, {
      image: referenceImage,
      prompt: input.prompt,
      ...(input.negativePrompt ? { negative_prompt: input.negativePrompt } : {}),
      ...(input.seed !== undefined ? { seed: input.seed } : {}),
      width: input.width ?? 1024,
      height: input.height ?? 1024,
      ip_adapter_scale: 0.8,
      controlnet_conditioning_scale: 0.8,
    });
    return { imageUrl, model: FACE_CONSISTENT_MODEL };
  }

  async trainIdentity(input: TrainIdentityInput): Promise<TrainIdentityResult> {
    // Per-character LoRA training. Requires a destination model to push
    // trained weights to; left as a documented manual setup step for now
    // (see CHARACTERS.md) rather than auto-provisioning Replicate models,
    // which would require broader account-level API scope.
    const destination = process.env.REPLICATE_LORA_DESTINATION;
    if (!destination) {
      throw new ImageProviderError(
        "REPLICATE_LORA_DESTINATION is not set — LoRA training needs a destination model slug (owner/model-name) created in your Replicate account first."
      );
    }
    const res = await fetch(`${API_BASE}/models/${LORA_TRAINER_MODEL}/trainings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        destination,
        input: {
          input_images: await zipImageUrls(input.imageUrls),
          trigger_word: input.triggerWord,
          steps: 1500,
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ImageProviderError(`LoRA training request failed (${res.status}): ${text}`);
    }
    const training = await res.json();
    return { trainingId: training.id, status: "training" };
  }

  async getTrainingStatus(trainingId: string): Promise<TrainIdentityResult> {
    const res = await fetch(`${API_BASE}/trainings/${trainingId}`, { headers: authHeaders() });
    if (!res.ok) throw new ImageProviderError(`Training status check failed (${res.status})`);
    const training = await res.json();
    const status = training.status === "succeeded" ? "ready" : training.status === "failed" ? "failed" : "training";
    return { trainingId, status, modelId: training.output?.version };
  }
}

function aspectRatioFor(width?: number, height?: number): string {
  if (!width || !height) return "1:1";
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return "1:1";
  if (ratio > 1) return "16:9";
  return "9:16";
}

// The LoRA trainer expects a single zip/tar URL of training images, not a
// list of URLs. Bundling images server-side is left for a future provider
// upgrade (needs a storage bucket to host the zip) — surfaced clearly here
// instead of silently sending something the API will reject.
async function zipImageUrls(_imageUrls: string[]): Promise<string> {
  throw new ImageProviderError(
    "Zipping reference images for LoRA training is not implemented yet — upload a zip of character images directly to a storage bucket and pass its URL. See CHARACTERS.md 'LoRA upgrade path'."
  );
}
