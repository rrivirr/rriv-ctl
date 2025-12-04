import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/action.ts", "**/check-version.ts", "**/repl/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["src/db/db.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
  },
  {
    files: ["src/modules/auth/auth.service.ts"],
    rules: {
      "@typescript-eslint/no-dynamic-delete": "off",
    },
  },
  {
    files: ["src/commands/connect/action.ts", "src/pre-action/run-checks.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  }
);
