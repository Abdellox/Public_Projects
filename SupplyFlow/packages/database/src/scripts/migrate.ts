import { config } from "dotenv";
config({ path: new URL("../../../../.env", import.meta.url) });

async function main() {
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const { getDb } = await import("../index.js");

  const db = getDb();
  console.log("Running migrations...");
  const folder = new URL("../../drizzle", import.meta.url);
  await migrate(db, { migrationsFolder: decodeURIComponent(folder.pathname).replace(/^\/([A-Za-z]:)/, "$1") });
  console.log("Migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
