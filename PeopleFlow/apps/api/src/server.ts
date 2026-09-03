import { loadEnv } from "@peopleflow/config";
import { prisma } from "@peopleflow/database";
import { buildApp } from "./app.js";
import { startBackgroundJobs } from "./services/jobs.js";

const env = loadEnv();

async function main(): Promise<void> {
  const secret = env.SESSION_SECRET;
  if (env.NODE_ENV === "production" && secret.startsWith("dev-only")) {
    throw new Error("SESSION_SECRET must be set to a strong random value in production");
  }

  const app = await buildApp({ env, secret });

  await prisma.$queryRaw`SELECT 1`;

  const port = env.PORT;
  await app.listen({ port, host: env.HOST });

  app.log.info(`PeopleFlow API listening on ${env.HOST}:${port}`);

  const stopJobs = startBackgroundJobs(app);
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
      app.log.info(`${signal} received, shutting down…`);
      stopJobs();
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
