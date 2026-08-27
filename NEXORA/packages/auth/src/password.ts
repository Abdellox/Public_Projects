import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id with current OWASP-recommended parameters
 * (19 MiB memory, t=2, p=1). Never change parameters without a migration
 * strategy for existing hashes.
 */
const ARGON2_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTS);
}

export async function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashValue, plain);
  } catch {
    return false;
  }
}
