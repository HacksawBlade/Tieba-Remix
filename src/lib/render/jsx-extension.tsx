import { VNode, render } from "vue";
import { JSX } from "vue/jsx-runtime";
import { domrd } from "../elemental";

export interface RenderedJSX<T extends Element = Element> {
    root: T;
    vnode: VNode;
    remove(): void;
}

export function renderJSX<T extends Element>(jsxel: JSX.Element, parent: Element): RenderedJSX<T> {
    render(jsxel, parent);
    const root = parent.firstChild as T;
    return {
        root,
        vnode: jsxel,
        remove() {
            render(null, parent);
            if (root.parentNode) root.remove();
        },
    };
}

function createJSXWrapper() {
    return domrd("div", { class: "jsx-wrapper" });
}

export function insertJSX<T extends Element>(jsxel: JSX.Element, parent: Element, position?: Node) {
    const jsxWrapper = createJSXWrapper();
    return renderJSX<T>(jsxel, parent.insertBefore(jsxWrapper, position ?? null));
}

export function appendJSX<T extends Element>(jsxel: JSX.Element, parent: Element) {
    const jsxWrapper = createJSXWrapper();
    return renderJSX<T>(jsxel, parent.appendChild(jsxWrapper));
}
