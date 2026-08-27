import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import "dotenv/config";

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

/**
 * Applies pending migrations. Runs outside the app so production deployments
 * can migrate as a discrete, auditable step.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  try {
    await migrate(drizzle(pool), { migrationsFolder });
    console.log("Migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
