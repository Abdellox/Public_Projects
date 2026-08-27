import type { FastifyInstance } from "fastify";
import { audit } from "../../lib/audit.js";
import {
  clearSessionCookie,
  cookieSecureOf,
  extractToken,
  requireUser,
  setSessionCookie
} from "../../lib/session-cookies.js";
import { AuthService } from "./auth.service.js";
import { loginSchema, registerSchema } from "@nexora/validation";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const service = new AuthService(app.db, app.sessions);
  const secure = cookieSecureOf(app.env);

  app.post(
    "/register",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const dto = registerSchema.parse(request.body);
      const result = await service.register(dto, {
        ip: request.ip,
        userAgent: request.headers["user-agent"] ?? null
      });
      setSessionCookie(reply, result.token, result.expiresAt, secure);
      await audit(app.db, {
        actorUserId: result.user.id,
        action: "auth.registered",
        targetType: "user",
        targetId: result.user.id,
        request
      });
      reply.code(201).send({ user: result.user });
    }
  );

  app.post(
    "/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const dto = loginSchema.parse(request.body);
      const result = await service.login(dto, {
        ip: request.ip,
        userAgent: request.headers["user-agent"] ?? null
      });
      setSessionCookie(reply, result.token, result.expiresAt, secure);
      await audit(app.db, {
        actorUserId: result.user.id,
        action: "auth.login",
        targetType: "user",
        targetId: result.user.id,
        request
      });
      return { user: result.user };
    }
  );

  app.post("/logout", async (request, reply) => {
    const token = extractToken(request);
    if (token) await app.sessions.revokeByToken(token);
    clearSessionCookie(reply, secure);
    reply.code(204).send();
  });

  app.get("/me", async (request) => {
    const session = await requireUser(request);
    return service.me(session.userId);
  });
}
