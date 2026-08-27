import { hash, verify } from '@node-rs/argon2';

const ARGON2_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTS);
}

export function verifyPassword(
  passwordHash: string,
  plain: string,
): Promise<boolean> {
  return verify(passwordHash, plain);
}
