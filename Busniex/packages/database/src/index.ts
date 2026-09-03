import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | undefined;

/** Create (or reuse) a Postgres connection pool from DATABASE_URL. */
export function createPool(url: string): Pool {
  pool = new Pool({ connectionString: url, max: 10, idleTimeoutMillis: 30_000 });
  return pool;
}

/** Get the shared pool, creating it from the configured URL if needed. */
export function getPool(): Pool {
  if (!pool) {
    pool = createPool(
      process.env.DATABASE_URL ?? 'postgresql://businex:businex@localhost:5432/businex',
    );
  }
  return pool;
}

/** Get a typed Drizzle query client over the shared pool. */
export function getDb() {
  return drizzle(getPool(), { schema });
}

export type BusinexDb = ReturnType<typeof getDb>;
export { schema };
export const tables = schema;
