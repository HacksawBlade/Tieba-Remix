import { GM_addStyle } from "$";
import _ from "lodash";
import { waitUntil } from "../utils";

export type CSSRule = Partial<CSSStyleDeclaration> | Record<string, string>;
export type CSSObject = Record<string, CSSRule>;

/**
 * 将多组 CSS 规则解析为样式字符串
 * @param cssObject 描述 CSS 选择器 + 规则 的对象
 */
export function parseMultiCSS(cssObject: CSSObject) {
    return _.flatMapDeep(cssObject, (value, key) => {
        return [
            `${key} {`,
            ..._.flatMapDeep(value, (v, k) => `${_.startsWith(k, "--") ? k : _.kebabCase(k)}: ${v};`),
            "}",
            "",
        ];
    }).join("\n");
}

export function parseCSSRule(cssRule: CSSRule): string {
    let css = "";
    _.forOwn(cssRule, (value, key) => {
        css += `${_.kebabCase(key)}:${value};`;
    });
    return css;
}

/**
 * 注入 CSS 规则
 * @param selector 选择器
 * @param cssRule 包含 CSS 规则的对象
 * @returns 对应的 `style` 元素
 */
export function injectCSSRule(selector: string, cssRule: CSSRule) {
    return GM_addStyle(`${selector}{${parseCSSRule(cssRule)}}`);
}

/**
 * 对元素快速设置 CSS 规则
 * @param el 待操作 DOM
 * @param cssRule CSS 规则
 */
export function assignCSSRule(el: Element, cssRule: CSSRule) {
    _.assign((el as HTMLElement).style, cssRule);
}

/**
 * 将样式字符串插入到页面中
 * @param style 样式字符串
 * @returns 对应的 `style` 元素
 */
export function insertCSS(style: string) {
    return GM_addStyle(style);
}

/**
 * 将多个样式字符串插入页面，并能够以较高优先级应用样式，用于覆写原有样式
 * @param style 样式字符串
 * @returns 对应的 `style` 元素
 */
export function overwriteCSS(...style: string[]) {
    const styles: HTMLStyleElement[] = [];
    _.forEach(style, styleElement => {
        styles.push(insertCSS(styleElement));
    });
    waitUntil(() => !_.isNil(document.body)).then(() => {
        _.forEach(styles, styleElement => {
            document.body.appendChild(styleElement);
        });
    });
    return styles;
}
