import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://supplyflow:supplyflow@localhost:5432/supplyflow"
  },
  verbose: true,
  strict: true
});
