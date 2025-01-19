import _ from "lodash";
import { afterHead, mergeNodeAttrs } from ".";

export const defaultStyle = document.createElement("style");  // 默认默认样式
defaultStyle.id = "default-stylesheet";

export type CSSRule = Partial<CSSStyleDeclaration> | Record<string, string>;
export type CSSObject = Record<string, CSSRule>;

// 插入默认元素
afterHead(() => {
    document.head.appendChild(defaultStyle);
});

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
 * 将 CSS 字符串作为 `style` 标签注入 `head`
 * @param css CSS 字符串
 * @returns 被注入的 `style` 元素
 */
export function injectCSSList(css: string): HTMLStyleElement {
    const cssElem = document.createElement("style");
    cssElem.textContent = css;
    afterHead(() => {
        document.head.appendChild(cssElem);
    });
    return cssElem;
}

/**
 * 将 CSS 路径作为 `link` 标签注入 `head`
 * @param css CSS 文件路径
 * @returns 被注入的 `link` 元素
 */
export function injectCSSFile(filename: string): HTMLLinkElement {
    const linkElem = document.createElement("link");
    mergeNodeAttrs(linkElem, {
        rel: "stylesheet",
        href: filename,
    });
    afterHead(() => {
        document.head.appendChild(linkElem);
    });
    return linkElem;
}

/**
 * 
 * @param selector 选择器
 * @param cssRule 包含 CSS 规则的对象，属性默认使用驼峰命名法
 * @returns 该规则的 index 或 `undefined`
 */
export function injectCSSRule(selector: string, cssRule: CSSRule) {
    if (selector === "") return;
    if (cssRule.length === 0) return;
    if (!defaultStyle.sheet) return;

    const css = `${selector}{${parseCSSRule(cssRule)}}`;
    return defaultStyle.sheet.insertRule(css);
}

/**
 * 删除一个自定义 CSS 规则
 * @param index 需要删除的规则对应的 index
 */
export function removeCSSRule(index: number) {
    if (!defaultStyle.sheet) return;
    defaultStyle.sheet.deleteRule(index);
}

/**
 * 对元素快速设置 CSS 规则
 * @param el 待操作 DOM
 * @param cssRule CSS 规则
 */
export function assignCSSRule(el: Element, cssRule: CSSRule) {
    _.assign((el as HTMLElement).style, cssRule);
}
