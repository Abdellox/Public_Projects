import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Sessions use opaque random tokens. Only the SHA-256 hash of the token is
 * stored, so a database leak does not expose usable credentials.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time comparison for any secret material compared byte-wise. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
