export default {
    extends: [
        "stylelint-config-standard",
        "stylelint-config-idiomatic-order",
        "stylelint-config-recommended-vue",
        "stylelint-config-standard-scss"
    ],
    plugins: [
        "stylelint-order"
    ],
    overrides: [
        {
            files: ["**/*.{html,vue}"],
            customSyntax: "postcss-html"
        }
    ],
    rules: {
        "comment-empty-line-before": null,
        "selector-class-pattern": null,
        "selector-id-pattern": null,
        "no-descending-specificity": null,
        "declaration-empty-line-before": null,
        "custom-property-empty-line-before": null,
        "scss/dollar-variable-pattern": null,
        "scss/dollar-variable-empty-line-before": null,
        "no-empty-source": null,
        "scss/double-slash-comment-empty-line-before": null
    }
};
