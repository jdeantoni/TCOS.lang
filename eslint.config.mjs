import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/generated/**",
      "**/dist/**",
      "**/out/**",
      "**/build/**",
      "**/*.min.js"
    ]
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },

    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "prefer-const": ["error", {
        "destructuring": "all"
      }]
    }
  }
);