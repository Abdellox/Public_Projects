import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@peopleflow/config": resolve(__dirname, "../../packages/config/src/index.ts"),
      "@peopleflow/database": resolve(__dirname, "../../packages/database/src/index.ts"),
    },
  },
});
