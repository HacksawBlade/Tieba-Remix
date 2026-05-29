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
        "@typescript-eslint/triple-slash-reference": "off", // ref
        "no-var": "error",
        strict: "error",
        "no-undef": "off",
        "radix": ["error", "always"],
        "@typescript-eslint/no-unused-expressions": "off", // 禁止无效表达式
        "@typescript-eslint/ban-ts-comment": "off", // ts ignore 等
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        eqeqeq: "error",
        "prefer-template": "error",
        "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
        "arrow-body-style": ["error", "as-needed"],
        "@typescript-eslint/consistent-type-imports": "error",
        curly: ["error", "multi-line"],
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/return-await": ["error", "in-try-catch"],
        "@typescript-eslint/no-confusing-void-expression": "error",
    },
};
