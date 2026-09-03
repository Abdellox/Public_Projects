import { sign, verify, type SignOptions } from 'jsonwebtoken';
import { env } from '@businex/config';

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const opts: SignOptions = { expiresIn: '8h' };
  return sign(payload, env.jwtSecret, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return verify(token, env.jwtSecret) as AccessTokenPayload;
}
