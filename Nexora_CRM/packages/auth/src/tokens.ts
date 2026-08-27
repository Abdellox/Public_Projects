import { createHash, randomBytes } from 'node:crypto';

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Tokens are stored hashed so a database leak never yields usable
 * session or invitation credentials.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
