import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: [
            "*.user.js",
            ".eslintrc.*",
            "**/@debug*",
            "**/@deprecated*",
            "**/build/**",
            "vite.config.*",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/base"],
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
        languageOptions: {
            parserOptions: {
                project: "tsconfig.json",
            },
        },
    },
    {
        files: ["**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: [".vue"],
            },
        },
    },
    {
        rules: {
            "no-var": "error",
            "strict": "error",
            "no-undef": "off",
            "radix": ["error", "always"],
            "eqeqeq": "error",
            "prefer-template": "error",
            "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
            "arrow-body-style": ["error", "as-needed"],
            "curly": ["error", "multi-line"],
            "@typescript-eslint/triple-slash-reference": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/return-await": ["error", "in-try-catch"],
            "@typescript-eslint/no-confusing-void-expression": "error",
        },
    },
    {
        files: ["**/*.d.ts"],
        rules: { "@typescript-eslint/no-unused-vars": "off" },
    },
    eslintConfigPrettier,
];
