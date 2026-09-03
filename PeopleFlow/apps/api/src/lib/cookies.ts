import type { FastifyReply, FastifyRequest } from "fastify";
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from "@peopleflow/auth";
import { isProduction, type Env } from "@peopleflow/config";

export function setSessionCookie(reply: FastifyReply, env: Env, token: string): void {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(env),
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(reply: FastifyReply, env: Env): void {
  reply.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(env),
    path: "/",
  });
}

export function clientIp(request: FastifyRequest): string | undefined {
  return (request.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? request.ip;
}
