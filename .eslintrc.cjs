module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/base",
        "prettier",
    ],
    overrides: [
        {
            files: ["*.d.ts"],
            rules: {
                "@typescript-eslint/no-unused-vars": "off",
            },
        },
        {
            files: ["*.cjs", "vite.config.*"],
            parserOptions: {
                project: null,
            },
        },
    ],
    parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: "latest",
        ecmaFeatures: {
            jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        extraFileExtensions: [".vue"],
    },
    plugins: ["@typescript-eslint", "eslint-plugin-vue"],
    rules: {
        "@typescript-eslint/triple-slash-reference": "off" /* ref */,
        "no-var": "error",
        strict: "error",
        "spaced-comment": "off",
        "no-undef": "off",
        radix: "off" /* praseInt radix */,
        "@typescript-eslint/no-unused-expressions": "off" /* 禁止无效表达式 */,
        "no-param-reassign": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain":
            "off" /* 变量不能为 null */,
        "@typescript-eslint/ban-ts-comment": "off" /* ts ignore 等 */,
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        eqeqeq: "error",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prefer-template": "error",
        "@typescript-eslint/no-non-null-assertion": "off" /* 禁止使用 ! */,
        "@typescript-eslint/consistent-type-imports": "error",
        curly: "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/return-await": ["error", "in-try-catch"],
        "@typescript-eslint/no-confusing-void-expression": "error",
    },
};
