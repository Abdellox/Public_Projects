import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { Db } from "@nexora/database";
import { SessionService } from "@nexora/auth";
import type { ApiEnv } from "./env.js";
import { allowedOrigins } from "./env.js";
import { PermissionCache } from "./policy/policy.js";
import { apiRoutes } from "./modules/index.js";

export interface BuildAppOptions {
  db: Db;
  env: ApiEnv;
}

/**
 * Constructs the Fastify instance with all plugins, decorators and routes.
 * Pure with respect to process state — tests build isolated instances.
 */
export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: options.env.LOG_LEVEL,
      redact: {
        // Never log credential material.
        paths: ["req.body.password", "req.body.currentPassword", "req.headers.authorization"],
        censor: "[REDACTED]"
      }
    },
    trustProxy: false,
    bodyLimit: 1_048_576
  });

  await app.register(cookie);
  await app.register(cors, {
    origin: allowedOrigins(options.env),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  });
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: "1 minute",
    errorResponseBuilder: (_request, context) => ({
      error: {
        code: "RATE_LIMITED",
        message: `Too many requests — retry in ${Math.round(context.ttl / 1000)}s`,
        details: {}
      }
    })
  });

  app.decorate("db", options.db);
  app.decorate("env", options.env);
  app.decorate("sessions", new SessionService(options.db));
  app.decorate("permissions", new PermissionCache());
  app.decorateRequest("session", null);

  app.get("/health", async () => ({ status: "ok" }));

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({
      error: { code: "NOT_FOUND", message: "Route not found", details: {} }
    });
  });

  app.setErrorHandler((err, request, reply) => {
    const zodLike =
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name?: string }).name === "ZodError";

    if (zodLike) {
      const zerr = err as unknown as {
        issues: Array<{ path: Array<string | number>; message: string }>;
      };
      return reply.code(422).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: {
            fields: zerr.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message
            }))
          }
        }
      });
    }

    const httpLike = err as { statusCode?: number; code?: string; details?: unknown };
    if (typeof httpLike.statusCode === "number" && httpLike.statusCode < 500) {
      return reply.code(httpLike.statusCode).send({
        error: {
          code: httpLike.code ?? "ERROR",
          message: (err as Error).message,
          details: httpLike.details ?? {}
        }
      });
    }

    request.log.error({ err }, "unhandled_error");
    return reply.code(500).send({
      error: { code: "INTERNAL_ERROR", message: "Something went wrong", details: {} }
    });
  });

  await app.register(apiRoutes, { prefix: "/api/v1" });
  return app;
}
