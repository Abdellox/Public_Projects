import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './security';

describe('password hashing', () => {
  it('hashes and verifies a password', () => {
    const stored = hashPassword('s3cret!');
    expect(stored.startsWith('pbkdf2$')).toBe(true);
    expect(verifyPassword('s3cret!', stored)).toBe(true);
    expect(verifyPassword('wrong', stored)).toBe(false);
  });

  it('produces unique salts', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });
});
