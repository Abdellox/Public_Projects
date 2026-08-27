import "dotenv/config";
import { createDb } from "@nexora/database";
import { buildApp } from "./app.js";
import { loadEnv } from "./env.js";

async function main() {
  const env = loadEnv();
  const { db, close } = createDb({ connectionString: env.DATABASE_URL, max: 10 });

  const app = await buildApp({ db, env });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting_down");
    await app.close();
    await close();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
  } catch (err) {
    app.log.error({ err }, "failed_to_start");
    process.exit(1);
  }
}

main();
