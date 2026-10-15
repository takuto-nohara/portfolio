import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@worker": path.resolve(__dirname, "worker"),
      "@": path.resolve(__dirname, "src/app"),
    },
  },
  test: {
    include: ["worker/**/*.test.ts", "src/**/*.test.ts"],
    environment: "node",
  },
});
