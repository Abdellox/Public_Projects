import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** Sessions are stored hashed; the raw token only ever lives in the cookie. */
export function hashSessionToken(token: string, secret: string): string {
  return createHash("sha256").update(`${token}.${secret}`).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
