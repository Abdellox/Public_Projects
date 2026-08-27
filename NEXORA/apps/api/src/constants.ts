export const SESSION_COOKIE_NAME = "nexora_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function cookieSecure(env: { NODE_ENV: string; COOKIE_SECURE: string }): boolean {
  if (env.COOKIE_SECURE === "true") return true;
  if (env.COOKIE_SECURE === "false") return false;
  return env.NODE_ENV === "production";
}
