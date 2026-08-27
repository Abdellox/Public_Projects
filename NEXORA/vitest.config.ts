import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/**/src/**/*.test.ts",
      "apps/**/src/**/*.test.ts",
      "packages/**/tests/**/*.test.ts",
      "apps/**/tests/**/*.test.ts",
    ],
    globals: false,
  },
  resolve: {
    alias: {
      "@nexora/types": r("./packages/types/src/index.ts"),
      "@nexora/validation": r("./packages/validation/src/index.ts"),
      "@nexora/database": r("./packages/database/src/index.ts"),
      "@nexora/auth": r("./packages/auth/src/index.ts"),
    },
  },
});
