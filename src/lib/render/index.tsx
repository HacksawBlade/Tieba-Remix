import CommonDialog, { CommonDialogOpts } from "@/components/common-dialog.vue";
import { SupportedComponent } from "@/ex";
import { DOMS, templateCreate } from "@/lib/elemental";
import { assignCSSRule, injectCSSRule } from "@/lib/elemental/styles";
import { Queue } from "@/lib/utils/queue";
import { forEach, includes, isNil, once } from "lodash-es";
import { App, Component, ComponentPublicInstance, createApp, h } from "vue";
import { experimental, perfProfile } from "../user-values";

export interface RenderedComponent<T extends Element = Element> {
    app: App<T>;
    instance: ComponentPublicInstance;
}

export function renderComponent<T extends LiteralObject>(
    root: Component,
    container: string | Element,
    rootProps?: T): RenderedComponent {
    const app = createApp(root, rootProps);
    return {
        app: app,
        instance: app.mount(container),
    };
}

/** 获取垂直滚动条的宽度。对应的 CSS 变量为 `--scrollbar-width` */
export const scrollbarWidth = once(function () {
    const temp = templateCreate("div");
    assignCSSRule(temp, {
        width: "100px",
        height: "100px",
        overflow: "scroll",
        position: "absolute",
        top: "-9999px",
    });

    document.body.appendChild(temp);
    const scrollbarWidth = temp.offsetWidth - temp.clientWidth;
    document.body.removeChild(temp);
    return scrollbarWidth;
});

export function renderPage(root: Component, rootProps?: LiteralObject) {
    if (document.getElementsByTagName("body").length === 0) {
        document.documentElement.appendChild(templateCreate("body"));
    }

    removeDefault();

    const page = templateCreate("div", { id: "remixed-page" });
    document.body.insertBefore(page, document.body.firstChild);

    document.body.appendChild(templateCreate("div", {
        "id": "carousel_wrap",
    }));

    injectCSSRule("#spage-tbshare-container, .tbui_aside_float_bar", {
        display: "none !important",
    });

    return renderComponent(root, page, rootProps);
}

/** 对话框选项 */
export interface DialogOpts {
    /** 是否渲染为模态 */
    modal?: boolean;
    /** 强制使用自定义事件关闭 */
    force?: boolean;
    /** 是否锁定滚动 */
    lockScroll?: boolean;
    /** 使用默认动画 */
    animation?: boolean;
    /** 是否开启对背景模糊效果。对话框背景只有在模态下可见 */
    blurEffect?: boolean;
}

export interface UnloadedDialog {
    requestTime: number;
    renderTime: number;
    unloadTime: number;
}

export type RenderedDialog = RenderedComponent & Partial<UnloadedDialog>;

/** 对话框事件名 */
export enum DialogEvents {
    /** 事件：对话框渲染前 */
    BeforeRender = "remix:DialogBeforeRender",
    /** 事件：对话框已渲染 */
    Rendered = "remix:DialogRendered",
    /** 事件：对话框卸载前 */
    BeforeUnload = "remix:DialogBeforeUnload",
    /** 事件：对话框已卸载 */
    Unloaded = "remix:DialogUnloaded",
}

/** 对话框渲染前 */
export type DialogBeforeRenderEvent = CustomEvent<{ dialogRenderParams: DialogRenderParams }>;
/** 对话框渲染事件 */
export type DialogRenderedEvent = CustomEvent<{ renderedDialog: RenderedDialog }>;
/** 对话框卸载前 */
export type DialogBeforeUnloadEvent = CustomEvent<{ renderedDialog: RenderedDialog }>;
/** 对话框卸载事件 */
export type DialogUnloadedEvent = CustomEvent<{ unloadedDialog: UnloadedDialog }>;

declare global {
    interface WindowEventMap {
        "remix:DialogBeforeRender": DialogBeforeRenderEvent;
        "remix:DialogRendered": DialogRenderedEvent;
        "remix:DialogBeforeUnload": DialogBeforeUnloadEvent;
        "remix:DialogUnloaded": DialogUnloadedEvent;
    }
}

type DialogRenderParams = [Component, Maybe<LiteralObject>, Maybe<DialogOpts>];
interface CachedDialog {
    params: DialogRenderParams;
    requestTime: number;
}

const currentDialog: Partial<RenderedDialog> = {};
const topLevelQueue = new Queue<CachedDialog>();

/** 默认对话框通用选项 */
export const DEFAULT_DIALOG_OPTS: Required<DialogOpts> = {
    modal: false,
    force: false,
    lockScroll: false,
    animation: false,
    blurEffect: perfProfile.get() === "performance" && experimental.get().moreBlurEffect,
} as const;

let dialogWrapper = DOMS(true, "#dialog-wrapper", "div");

/**
 * 渲染对话框
 * @param content 对话框组件
 * @param contentOpts 当前组件的选项
 * @param dialogOpts 对话框通用选项
 * @returns 对话框组件实例
 */
export async function renderDialog<ContentOpts extends LiteralObject>(
    content: SupportedComponent | HTMLDialogElement,
    contentOpts?: ContentOpts,
    dialogOpts?: DialogOpts,
): Promise<RenderedDialog> {
    if (isNil(dialogWrapper)) {
        document.body.appendChild(templateCreate("div", { id: "dialog-wrapper" }));
    }
    dialogWrapper = DOMS(true, "#dialog-wrapper", "div");

    const currentTime = performance.now();
    currentDialog.requestTime = currentTime;

    if (isNil(currentDialog.instance)) {
        return _renderDialog(content, contentOpts, dialogOpts);
    }

    topLevelQueue.enqueue({
        params: [content, contentOpts, dialogOpts],
        requestTime: currentTime,
    });
    return new Promise((resolve) => {
        window.addEventListener(DialogEvents.Rendered, handler);

        function handler() {
            if (currentDialog.requestTime !== currentTime) return;

            window.removeEventListener(DialogEvents.Rendered, handler);
            currentDialog.renderTime = performance.now();
            resolve({ ...currentDialog } as RenderedDialog);
        }
    });
}

function _renderDialog<ContentOpts extends LiteralObject>(
    dialog: SupportedComponent | HTMLDialogElement,
    contentOpts: Maybe<ContentOpts>,
    dialogOpts: Maybe<DialogOpts>,
    cachedRequestTime?: number,
) {
    if (cachedRequestTime) currentDialog.requestTime = cachedRequestTime;

    window.dispatchEvent(
        new CustomEvent<DialogBeforeRenderEvent["detail"]>(DialogEvents.BeforeRender, {
            detail: { dialogRenderParams: [dialog, contentOpts, dialogOpts] },
        })
    );

    dialogWrapper.style.display = "none";
    currentDialog.app = createApp(dialog, contentOpts);
    currentDialog.instance = currentDialog.app.mount(dialogWrapper);
    dialogWrapper.style.display = "";

    const opts = {
        ...DEFAULT_DIALOG_OPTS,
        ...(currentDialog.instance as LiteralObject).dialogOpts ?? {},
        ...dialogOpts,
    };

    if (opts.lockScroll) {
        document.body.setAttribute("no-scrollbar", "");
        document.body.style.paddingRight = `${scrollbarWidth()}px`;
    }

    const dialogElement: HTMLDialogElement = currentDialog.instance.$el;
    opts.modal ? dialogElement.showModal() : dialogElement.show();

    currentDialog.renderTime = performance.now();

    window.dispatchEvent(
        new CustomEvent<DialogRenderedEvent["detail"]>(DialogEvents.Rendered, {
            detail: { renderedDialog: { ...currentDialog } as RenderedDialog },
        })
    );

    return { ...currentDialog } as RenderedDialog;
}

/**
 * 卸载当前对话框，并渲染下一个顶层对话框（如果有）
 */
export function unloadDialog() {
    if (!currentDialog) return;
    if ((currentDialog.instance?.$el as HTMLDialogElement).classList.contains("animation")) {
        const dialogElement: HTMLDialogElement = currentDialog.instance?.$el;
        dialogElement.classList.add("closing");
        dialogElement.addEventListener("animationend", function () {
            _unload();
        });
        return;
    }
    _unload();

    function _unload() {
        window.dispatchEvent(
            new CustomEvent<DialogBeforeUnloadEvent["detail"]>(DialogEvents.BeforeUnload, {
                detail: { renderedDialog: { ...currentDialog } as RenderedDialog },
            })
        );

        currentDialog.app?.unmount();
        currentDialog.app = undefined;
        currentDialog.instance = undefined;
        document.body.removeAttribute("no-scrollbar");
        document.body.style.paddingRight = "";
        currentDialog.unloadTime = performance.now();

        window.dispatchEvent(
            new CustomEvent<DialogUnloadedEvent["detail"]>(DialogEvents.Unloaded, {
                detail: { unloadedDialog: { ...currentDialog } as UnloadedDialog },
            })
        );

        if (topLevelQueue.isEmpty()) return;
        const nextDialog = topLevelQueue.dequeue();
        if (nextDialog) {
            _renderDialog(...nextDialog.params, nextDialog.requestTime);
        }
    }
}

/**
 * 渲染标准通用对话框
 * @param content 对话框内组件
 * @param dialogOpts 对话框选项
 * @returns 对话框组件实例
 */
export function commonDialog(
    content: SupportedComponent,
    dialogOpts?: CommonDialogOpts,
) {
    return renderDialog(<CommonDialog>{h(content)}</CommonDialog>, undefined, dialogOpts);
}

export function removeDefault() {
    forEach(document.head.children, (el) => {
        if (el && el.tagName.toUpperCase() === "LINK"
            && includes(el.getAttribute("href"), "static-common/style")) {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "SCRIPT"
            && includes(el.getAttribute("src"), "static-common/lib")) {
            el.remove();
        }
    });

    // document.getElementById("com_userbar")?.remove();

    forEach(document.body.children, (el) => {
        if (el && el.tagName.toUpperCase() === "STYLE") {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "SCRIPT") {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "IFRAME") {
            el.remove();
        }

        if (el && includes(el.className, "translatorExtension")) {
            el.remove();
        }

        if (el && includes(el.className, "dialogJ")) {
            el.remove();
        }
    });
}
