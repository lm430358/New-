/**
 * Reads a JSON API response, throwing an Error with a human-readable message when the
 * request failed. Handles our `{ error: string }` bodies, Zod `flatten()` bodies from
 * request validation, and non-JSON bodies (e.g. a proxy timeout page).
 */
// Defaults to `any` to match `Response.json()`, so call sites keep their existing typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readApiJson<T = any>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(apiErrorMessage(json, res.status));
  if (json === null) throw new Error("The server sent an unexpected response. Please try again.");
  return json as T;
}

function apiErrorMessage(json: unknown, status: number): string {
  const error = (json as { error?: unknown } | null)?.error;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const { formErrors, fieldErrors } = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    if (formErrors?.length) return formErrors[0];
    const [field, messages] = Object.entries(fieldErrors ?? {})[0] ?? [];
    if (field && messages?.length) return `${field}: ${messages[0]}`;
  }
  if (status === 504 || status === 408) return "The request timed out. Please try again.";
  return `Something went wrong (error ${status}). Please try again.`;
}
