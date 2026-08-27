import type { Db } from "@nexora/database";
import type { ResolvedSession, SessionService } from "@nexora/auth";
import type { ApiEnv } from "../env.js";
import type { PermissionCache } from "../policy/policy.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    env: ApiEnv;
    sessions: SessionService;
    permissions: PermissionCache;
  }
  interface FastifyRequest {
    /** Populated by requireUser(); null until authenticated. */
    session: ResolvedSession | null;
  }
}

export {};
