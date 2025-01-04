module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/base",
    ],
    "overrides": [
    ],
    "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "ecmaVersion": "latest",
        "ecmaFeatures": {
            "jsx": true,
        },
    },
    "plugins": [
        "@typescript-eslint",
        "eslint-plugin-vue",
    ],
    "rules": {
        "indent": [2, 4, { "SwitchCase": 1 }],
        "semi": [2, "always"],
        "@typescript-eslint/triple-slash-reference": 0,               /* ref */
        "no-var": 1,
        "strict": 2,
        "spaced-comment": 0,
        "no-undef": 0,
        "radix": 0,                                                   /* praseInt radix */
        "@typescript-eslint/no-unused-expressions": 0,                /* 禁止无效表达式 */
        "no-param-reassign": 0,
        "@typescript-eslint/no-non-null-asserted-optional-chain": 0,  /* 变量不能为 null */
        "@typescript-eslint/ban-ts-comment": 0,                       /* ts ignore 等 */
        "comma-dangle": [2, {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "only-multiline",
        }],                                                           /* 最后一个逗号 */
        "@typescript-eslint/no-unused-vars": 0,                       /* 从未使用过的变量，不交给 ESLint 处理 */
        "eqeqeq": 2,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "quotes": ["warn", "double", {
            avoidEscape: true,
            allowTemplateLiterals: true,
        }],
        "prefer-template": "warn",
    },
};
