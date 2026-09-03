import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const ITERATIONS = 10_000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = derive(salt, password, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, iterations, salt, expectedHex] = stored.split('$');
  if (scheme !== 'pbkdf2') return false;
  const it = Number.parseInt(iterations ?? '0', 10);
  if (!Number.isFinite(it) || it < 1) return false;
  const expected = Buffer.from(expectedHex ?? '', 'hex');
  const derived = derive(salt ?? '', password, it);
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function derive(saltHex: string, password: string, iterations: number): Buffer {
  let output = createHash(DIGEST).update(password).digest();
  const salt = Buffer.from(saltHex, 'hex');
  for (let i = 0; i < iterations; i++) {
    output = createHash(DIGEST)
      .update(salt)
      .update(output)
      .digest();
  }
  return output.subarray(0, KEY_LEN);
}
