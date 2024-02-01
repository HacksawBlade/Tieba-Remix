import { forEach } from "lodash-es";
import { RendererElement, RendererNode, VNode, createVNode, render } from "vue";
import { JSX } from "vue/jsx-runtime";
import { templateCreate } from "../elemental";

export interface RenderedJSX<T extends Element = Element> {
    el: T;
    vnode: VNode<RendererNode, RendererElement, LiteralObject>;
}

export function renderJSX<T extends Element>(jsxel: JSX.Element, parent: Element): RenderedJSX<T> {
    const vnode = createVNode(jsxel);
    vnode.props && (vnode.props.once = true);
    render(vnode, parent);
    return { el: parent.firstChild as T, vnode: vnode };
}

export function insertJSX<T extends Element>(jsxel: JSX.Element, parent: Element, position: Node | null) {
    const tempContainer = templateCreate("div");
    const vnode = renderJSX<T>(jsxel, parent.appendChild(tempContainer));
    forEach(tempContainer.children, el => {
        parent.insertBefore(el, position);
    });
    tempContainer.remove();
    return vnode;
}

export function appendJSX<T extends Element>(jsxel: JSX.Element, parent: Element) {
    const tempContainer = templateCreate("div");
    const vnode = renderJSX<T>(jsxel, parent.appendChild(tempContainer));
    forEach(tempContainer.children, el => {
        parent.appendChild(el);
    });
    tempContainer.remove();
    return vnode;
}
