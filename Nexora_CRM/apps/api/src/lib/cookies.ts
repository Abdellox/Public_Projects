import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@nexora/auth';

function secureCookies(): boolean {
  const flag = process.env.COOKIE_SECURE;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: secureCookies(),
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
}

export function readSessionToken(c: Context): string | undefined {
  return getCookie(c, SESSION_COOKIE_NAME);
}
