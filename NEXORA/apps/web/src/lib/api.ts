/**
 * Client-safe API helpers.
 *
 * - `clientApi` runs in the browser and calls the same-origin `/api/v1`
 *   proxy (see next.config.ts rewrites), keeping cookies first-party.
 * - Server-side fetches live in `./server-api` (uses `next/headers`, so it
 *   must never be imported from a client component).
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Envelope {
  error?: { code: string; message: string; details?: unknown };
}

async function parse<T>(res: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // 204s and empty bodies are fine.
  }
  if (!res.ok) {
    const env = (body as Envelope | null)?.error;
    throw new ApiError(res.status, env?.code ?? "ERROR", env?.message ?? res.statusText, env?.details);
  }
  return body as T;
}

export async function clientApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });
  return parse<T>(res);
}
