import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { corsOriginList, isProduction, type Env } from "@peopleflow/config";
import { TenantScopeError } from "@peopleflow/database";
import { createAiProvider, type AiConfig } from "@peopleflow/ai";

import { authenticateRequest } from "./context.js";
import { ApiError } from "./lib/errors.js";
import { registerAiRoutes } from "./routes/ai.js";

import { authRoutes } from "./routes/auth.js";
import { meRoutes } from "./routes/me.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { employeesRoutes } from "./routes/employees.js";
import { structureRoutes } from "./routes/structure.js";
import { leaveRoutes } from "./routes/leave.js";
import { attendanceRoutes } from "./routes/attendance.js";
import { documentRoutes } from "./routes/documents.js";
import { taskRoutes } from "./routes/tasks.js";
import { workflowRoutes } from "./routes/workflows.js";
import { announcementRoutes } from "./routes/announcements.js";
import { performanceRoutes } from "./routes/performance.js";
import { recruitmentRoutes } from "./routes/recruitment.js";
import { trainingRoutes } from "./routes/training.js";
import { notificationRoutes } from "./routes/notifications.js";
import { searchRoutes } from "./routes/search.js";
import { reportRoutes } from "./routes/reports.js";
import { auditRoutes } from "./routes/audit.js";
import { adminRoutes } from "./routes/admin.js";
import { dataRoutes, csvUploadRoutes } from "./routes/data.js";

export interface BuildAppOptions {
  env: Env;
  secret: string;
  prisma?: unknown;
}

function aiConfigFromEnv(env: Env): AiConfig {
  return {
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    apiKey: env.AI_API_KEY,
    baseUrl: env.AI_BASE_URL,
  };
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      options.env.NODE_ENV === "development"
        ? { transport: undefined }
        : true,
    bodyLimit: 30 * 1024 * 1024,
    trustProxy: true,
  });

  const secret = options.secret;

  await app.register(cookie);
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  });
  await app.register(cors, {
    origin: corsOriginList(options.env),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 1,
    },
  });

  const redisUrl = options.env.REDIS_URL;
  if (redisUrl) {
    try {
      const Redis = (await import("ioredis")).default as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = new Redis(redisUrl);
      await app.register(rateLimit, {
        max: 300,
        timeWindow: "1 minute",
        redis: client,
      });
    } catch {
      await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
    }
  } else {
    await app.register(rateLimit, { max: 300, timeWindow: "1 minute" });
  }

  app.decorate("pfSecret", secret);
  app.decorate("pfEnv", options.env);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
        statusCode: error.statusCode,
        ...(error.details ? { details: error.details } : {}),
      });
    }
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Request validation failed",
        statusCode: 400,
        details: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    if (error instanceof TenantScopeError) {
      request.log.warn({ err: error }, "Tenant isolation triggered");
      return reply.status(404).send({
        error: "NOT_FOUND",
        message: "Resource not found",
        statusCode: 404,
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return reply.status(409).send({
          error: "CONFLICT",
          message: "A record with these unique values already exists",
          statusCode: 409,
        });
      }
      if (error.code === "P2025") {
        return reply.status(404).send({
          error: "NOT_FOUND",
          message: "Resource not found",
          statusCode: 404,
        });
      }
    }
    if (typeof (error as { statusCode?: number }).statusCode === "number") {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode < 500) {
        return reply.status(statusCode).send({
          error: "REQUEST_ERROR",
          message: error.message,
          statusCode,
        });
      }
    }
    request.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: isProduction(options.env)
        ? "Something went wrong. The incident has been logged."
        : String(error),
      statusCode: 500,
    });
  });

  app.get("/api/v1/health", async () => ({
    status: "ok",
    version: "0.1.0",
    environment: options.env.NODE_ENV,
    ai: createAiProvider(aiConfigFromEnv(options.env)).name,
  }));

  app.addHook("preHandler", async (request) => {
    const url = request.url.split("?")[0];
    if (!url.startsWith("/api/v1") || url === "/api/v1/health") return;
    const publicPaths = new Set(["/api/v1/auth/signup", "/api/v1/auth/login"]);
    if (publicPaths.has(url)) return;
    request.ctx = (await authenticateRequest(request)) ?? undefined;
  });

  app.register(async function v1(v1App: FastifyInstance) {
    await authRoutes(v1App);
    await meRoutes(v1App);
    await dashboardRoutes(v1App);
    await employeesRoutes(v1App);
    await structureRoutes(v1App);
    await leaveRoutes(v1App);
    await attendanceRoutes(v1App);
    await documentRoutes(v1App);
    await taskRoutes(v1App);
    await workflowRoutes(v1App);
    await announcementRoutes(v1App);
    await performanceRoutes(v1App);
    await recruitmentRoutes(v1App);
    await trainingRoutes(v1App);
    await notificationRoutes(v1App);
    await searchRoutes(v1App);
    await reportRoutes(v1App);
    await auditRoutes(v1App);
    await adminRoutes(v1App);
    await dataRoutes(v1App);
    await csvUploadRoutes(v1App);
    registerAiRoutes(v1App, createAiProvider(aiConfigFromEnv(options.env)));
  }, { prefix: "/api/v1" });

  return app;
}
