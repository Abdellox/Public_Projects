import type { FastifyInstance } from "fastify";
import type { ScopedDb } from "@peopleflow/database";

declare module "fastify" {
  interface FastifyInstance {
    pfSecret: string;
    pfEnv: import("@peopleflow/config").Env;
  }
}

export type Db = ScopedDb;
