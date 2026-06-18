import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "lib/question-generation.ts",
        "lib/practice-service.ts",
        "app/api/ai/generate-questions/route.ts",
        "app/api/practice-records/route.ts",
      ],
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/*.d.ts",
        "lib/prisma.ts",
      ],
    },
  },
});
