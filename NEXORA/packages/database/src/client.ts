import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";

export type Db = NodePgDatabase<typeof schema>;
export type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbExecutor = Db | Transaction;

export interface CreateDbOptions {
  connectionString: string;
  max?: number;
}

export interface DatabaseHandle {
  db: Db;
  /** Closes the underlying connection pool (graceful shutdown / test teardown). */
  close: () => Promise<void>;
}

/**
 * Creates an isolated database handle. Callers own the lifecycle â€” the API
 * creates one per process and closes it on shutdown; tests create one per
 * suite pointed at a scratch database.
 */
export function createDb(options: CreateDbOptions): DatabaseHandle {
  const pool = new Pool({
    connectionString: options.connectionString,
    max: options.max ?? 10
  });
  const db = drizzle(pool, { schema });
  return { db, close: () => pool.end() };
}
