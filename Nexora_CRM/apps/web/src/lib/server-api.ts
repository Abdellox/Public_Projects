import { cookies } from 'next/headers';
import type { MeResponse } from '@nexora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const SESSION_COOKIE = 'nx_session';

/**
 * Server-side "me" lookup that forwards the browser's session cookie.
 * Returns null when unauthenticated instead of throwing.
 */
export async function getServerSession(): Promise<MeResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/v1/auth/me`, {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as MeResponse;
  } catch {
    return null;
  }
}
