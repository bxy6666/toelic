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
        "lib/api-response.ts",
        "lib/auth.ts",
        "lib/generation-usage.ts",
        "lib/image-storage.ts",
        "lib/question-mapper.ts",
        "lib/question-validation.ts",
        "lib/question-generation.ts",
        "lib/practice-service.ts",
        "lib/settings-service.ts",
        "lib/mistake-service.ts",
        "lib/stats-service.ts",
        "app/api/auth/login/route.ts",
        "app/api/ai/generate-questions/route.ts",
        "app/api/practice-records/route.ts",
        "app/api/settings/clear-data/route.ts",
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
