import { randomUUID, randomBytes } from 'crypto';

export { randomUUID };

/** Compact, URL-safe suffix for codes/numbers. */
export function shortId(prefix = ''): string {
  const raw = randomBytes(6).toString('base64url');
  return prefix ? `${prefix}_${raw}` : raw;
}

/** Generate a human-friendly sequential number like INV-0001. */
export function nextNumber(prefix: string, counter: number): string {
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}
