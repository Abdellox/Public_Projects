import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type Database = ReturnType<typeof createDb>['db'];

export function createDb(databaseUrl: string, max = 10) {
  const pool = new Pool({ connectionString: databaseUrl, max });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  return { db, pool };
}

let defaultDb: Database | undefined;

/**
 * Lazily-created shared instance for apps and tests.
 * Reads DATABASE_URL at first call so importing modules never
 * requires the env var to be present.
 */
export function getDb(): Database {
  if (!defaultDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    defaultDb = createDb(url).db;
  }
  return defaultDb;
}
