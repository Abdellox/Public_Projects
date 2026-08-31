import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

declare global {
  // eslint-disable-next-line no-var
  var __supplyflowPool: postgres.Sql | undefined;
}

export function createClient(url?: string): postgres.Sql {
  const connectionString = url ?? process.env.DATABASE_URL ?? "postgresql://supplyflow:supplyflow@localhost:5432/supplyflow";
  return postgres(connectionString, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false
  });
}

export function getDb(client?: postgres.Sql): PostgresJsDatabase<typeof schema> {
  const sql = client ?? (globalThis.__supplyflowPool ??= createClient());
  return drizzle(sql, { schema });
}

export type Database = PostgresJsDatabase<typeof schema>;
export { schema };
export { nextNumber } from "./numbering";
export { num, money } from "./util";
export * from "./services/audit";
export * from "./services/inventory";
export * from "./services/planning";
export * from "./services/alerts";
export * from "./services/dashboard";
export * from "./services/slug";
