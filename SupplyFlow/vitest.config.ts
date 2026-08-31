import { defineConfig, type Plugin } from "vitest/config";

// Source files use NodeNext-style "./x.js" specifiers for ".ts" modules
// (required for tsx/ts-node). Teach Vite's resolver about them.
function nodeNextTs(): Plugin {
  return {
    name: "nodenext-ts-extensions",
    async resolveId(source, importer, options) {
      if (!source.endsWith(".js")) return null;
      const asTs = await this.resolve(source.slice(0, -3) + ".ts", importer, { ...options, skipSelf: true });
      if (asTs) return asTs;
      const asIndex = await this.resolve(source.slice(0, -3) + "/index.ts", importer, { ...options, skipSelf: true });
      if (asIndex) return asIndex;
      return null;
    }
  };
}

export default defineConfig({
  plugins: [nodeNextTs()],
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"]
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
