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

    {
        files: ["**/*.ts", "**/*.tsx"],

        languageOptions: {
            parserOptions: {
                projectService: true
            },
            parser: tseslint.parser,
        },

        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double"]
        }
    }
);