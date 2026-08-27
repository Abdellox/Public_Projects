import type { FastifyReply, FastifyRequest } from "fastify";
import { SESSION_COOKIE_NAME, cookieSecure } from "../constants.js";
import { unauthorized } from "@nexora/types";
import type { ApiEnv } from "../env.js";
import type { ResolvedSession } from "@nexora/auth";

export function cookieSecureOf(env: ApiEnv): boolean {
  return cookieSecure(env);
}

/** Extracts the opaque session token from cookie or Authorization header. */
export function extractToken(request: FastifyRequest): string | null {
  const cookie = request.cookies[SESSION_COOKIE_NAME];
  if (cookie) return cookie;
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7) || null;
  return null;
}

/**
 * Authenticates the request and attaches the resolved session.
 * Throws a 401 mapped to the standard error envelope on failure.
 */
export async function requireUser(request: FastifyRequest): Promise<ResolvedSession> {
  const token = extractToken(request);
  if (!token) throw unauthorized();

  const sessions = request.server.sessions;
  const resolved = await sessions.resolve(token);
  if (!resolved) throw unauthorized("Session is invalid or expired");

  request.session = resolved;
  return resolved;
}

export function setSessionCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date,
  secure: boolean
): void {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    expires: expiresAt
  });
}

export function clearSessionCookie(reply: FastifyReply, secure: boolean): void {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: "/", httpOnly: true, sameSite: "lax", secure });
}
