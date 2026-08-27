import { cookies } from "next/headers";
import { ApiError } from "./api";

/**
 * Server-side API client for React Server Components: talks to the API origin
 * directly and forwards the incoming session cookie. Must never be imported
 * from a client component — keep this module free of client-only imports.
 */
export const SERVER_API_BASE = process.env.API_ORIGIN ?? "http://127.0.0.1:4000";

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

export async function serverApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${SERVER_API_BASE}/api/v1${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      cookie: cookieStore.toString(),
      ...(init.headers ?? {})
    }
  });
  return parse<T>(res);
}
