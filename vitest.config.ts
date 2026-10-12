import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        // Wiring/entrypoints and OS-specific code that is not unit-testable.
        "src/index.ts",
        "src/cli.ts",
        "src/commands/**",
        "src/repl/**",
        "src/auto-complete*.ts",
        "src/pre-action/**",
        "src/prompts/**",
        "src/modules/firmware/**",
        "src/infra/s3.ts",
        "src/instrument.mjs",
        // Type-only / constant-only modules.
        "src/types.ts",
        "src/api/types.ts",
        "src/infra/serial-commands.ts",
      ],
      thresholds: { lines: 88, functions: 88, branches: 80, statements: 88 },
    },
  },
});
