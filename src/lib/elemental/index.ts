import { isLiteralObject } from "@/lib/utils";
import { forEach, forOwn, merge } from "lodash-es";

export const fadeInElems: string[] = [];
const fadeInClass = "fade-in-elem";

export interface DOMTagNameMap extends HTMLElementTagNameMap {
    "default": Element;
}
export type DOMTagNames = keyof DOMTagNameMap;

/**
 * 使用选择器获取 DOM 元素
 * @param selector 选择器
 * @param parent 查找范围
 * @returns DOM 元素
 */
export function dom<T extends DOMTagNames = "default">(selector: string, parent?: Element): Maybe<DOMTagNameMap[T]>;
/**
 * @param selector 选择器
 * @param multi 查找全部
 */
export function dom<T extends DOMTagNames = "default">(selector: string, multi?: never[]): DOMTagNameMap[T][];
/**
 * @param selector 选择器
 * @param parent 查找范围
 * @param multi 查找全部
 */
export function dom<T extends DOMTagNames = "default">(selector: string, parent: Element, multi?: never[]): DOMTagNameMap[T][];

export function dom<T extends DOMTagNames = "default">(
    selector: string,
    arg1?: Element | never[],
    arg2?: never[]
): Maybe<DOMTagNameMap[T] | DOMTagNameMap[T][]> {
    if (!arg1) {
        return document.querySelector<DOMTagNameMap[T]>(selector) ?? undefined;
    }
    if (Array.isArray(arg1)) {
        return Array.from(document.querySelectorAll(selector));
    }
    if (!arg2) {
        return arg1.querySelector<DOMTagNameMap[T]>(selector) ?? undefined;
    }
    return Array.from(arg1.querySelectorAll(selector));
}

/**
 * 让函数等待 `head` 标签可操作后执行。若当前已可操作 `head` 则会立即执行
 * @param callbackfn 回调函数
 */
export function afterHead(callbackfn: () => void) {
    // return new Promise<void>((resolve, reject) => {
    //     try {
    //         const head = document.head;
    //         if (head) {
    //             callbackfn();
    //             resolve();
    //         }
    //     } catch (error) {
    //         reject(error);
    //     }
    // });
    callbackfn();
}

/**
 * 获取某节点所有属性值
 * @param node 目标节点
 * @returns 包含该节点所有属性值的对象
 */
export function getNodeAttrs(node: HTMLElement) {
    const attrs = node.attributes;
    const des: LiteralObject = {};

    for (const attr of attrs) {
        des[attr.name] = attr.value;
    }

    return des;
}

/**
 * 获取某节点所有属性值，同时解析属性值中的对象
 * @param node 目标节点
 * @returns 包含该节点所有属性值的对象
 */
export function getNodeAttrsDeeply(node: HTMLElement) {
    const attrs = node.attributes;
    const des: LiteralObject = {};

    for (const attr of attrs) {
        if (typeof attr.value === "string") {
            try {
                const obj = JSON.parse(attr.value);
                if (isLiteralObject(obj)) {
                    des[attr.name] = obj;
                }
            } catch (error) {
                des[attr.name] = attr.value;
            }
        } else {
            des[attr.name] = attr.value;
        }
    }

    return des;
}

/**
 * 将一个属性对象与目标节点的属性进行合并
 * @param node 目标节点
 * @param attrs 待合并的属性对象
 * @returns 合并后的节点属性对象
 */
export function mergeNodeAttrs<T extends HTMLElement>(
    node: T, attrs: LiteralObject,
) {
    forOwn(attrs, (value, key) => {
        if (value !== node.getAttribute(key)) {
            if (isLiteralObject(value)) {
                node.setAttribute(key, JSON.stringify(attrs[key]));
            } else {
                node.setAttribute(key, attrs[key]);
            }
        }
    });
}

/**
 * 将一个属性对象与目标节点的属性进行深度合并
 * @param node 目标节点
 * @param attrs 待合并的属性对象
 * @returns 合并后的节点属性对象
 */
export function mergeNodeAttrsDeeply<T extends HTMLElement>(
    node: T, attrs: LiteralObject,
) {
    const src = getNodeAttrsDeeply(node);
    const des = merge(src, attrs);
    mergeNodeAttrs(node, des);
}

/**
 * 创建一个新节点
 * @param tag 待创建节点的标签
 * @param attrs 该节点的属性值
 * @param doc 从哪个 `Document` 创建节点
 * @returns 被创建的节点
 */
export function domrd<T extends keyof HTMLElementTagNameMap>(
    tag: T, attrs?: LiteralObject, children: (Node | string)[] | string = [], doc?: Document,
): HTMLElementTagNameMap[T] {
    const DOC = doc ? doc : document;
    const elem = DOC.createElement(tag);

    if (attrs) {
        mergeNodeAttrs(elem, attrs);
    }

    if (typeof children === "string") {
        elem.appendChild(document.createTextNode(children));
    } else {
        forEach(children, child => {
            if (typeof child === "string") {
                elem.appendChild(document.createTextNode(child));
            } else {
                elem.appendChild(child);
            }
        });
    }

    return elem;
}

/**
 * 根据特征查找父元素
 * @param el 子元素
 * @param trait 父元素特征
 * @param mode 查找模式。默认按类名查找
 * @returns 符合条件的父元素 | `undefined`
 */
export function findParent<T extends keyof HTMLElementTagNameMap>(
    el: Element,
    trait: string,
    mode: "selector" | "className" | "id" | "tagName" = "className",
): Maybe<HTMLElementTagNameMap[T]> {
    const verifier = ((): (parent: HTMLElement) => boolean => {
        switch (mode) {
            case "selector": {
                const allValid = new Set(dom(trait, []));
                return (parent: HTMLElement) => {
                    return allValid.has(parent);
                };
            }

            case "className": {
                return (parent: HTMLElement) => parent.classList.contains(trait) ?? false;
            }

            case "id": {
                return (parent: HTMLElement) => parent.id === trait;
            }

            case "tagName": {
                return (parent: HTMLElement) => parent.tagName.toLowerCase() === trait.toLowerCase();
            }
        }
    })();

    while (el.parentElement && !verifier(el.parentElement)) {
        el = el.parentElement;
    }
    return el.parentElement as HTMLElementTagNameMap[T];
}

/**
 * 元素淡入动画
 * @param selector QuerySelector 字符串
 */
export function fadeInLoad(selector: string) {
    dom<"div">(selector, []).forEach(elem => {
        elem.classList.add(fadeInClass);
        elem.addEventListener("animationend", () => {
            elem.style.opacity = "1";
            elem.classList.remove(fadeInClass);
        });
    });
}
