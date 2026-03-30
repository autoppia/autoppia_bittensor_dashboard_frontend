import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/config/**/*.ts",
        "src/utils/**/*.ts",
        "src/services/utils/**/*.ts",
        "src/layouts/nav-menu/nav-menu-utils.ts",
      ],
      exclude: [
        "src/config/constants.ts",
        "src/config/enums.ts",
        "src/config/color-presets.ts",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
