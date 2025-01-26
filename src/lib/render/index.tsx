import UserDialog, { UserDialogAbnormal, UserDialogOpts } from "@/components/user-dialog";
import { SupportedComponent } from "@/ex";
import { dom, domrd } from "@/lib/elemental";
import { CSSRule, injectCSSRule, parseCSSRule } from "@/lib/elemental/styles";
import _ from "lodash";
import { App, Component, ComponentPublicInstance, createApp, h } from "vue";

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
export const scrollbarWidth = _.once(function () {
    // 仅在文档宽度不超过窗口宽度（或文档 overflow: hidden）时是正确的
    return window.innerWidth - document.documentElement.clientWidth;
});

export function renderPage(root: Component, rootProps?: LiteralObject) {
    if (document.getElementsByTagName("body").length === 0) {
        document.documentElement.appendChild(domrd("body"));
    }

    removeDefault();

    const page = domrd("div", { id: "remixed-page" });
    document.body.insertBefore(page, document.body.firstChild);

    document.body.appendChild(domrd("div", {
        "id": "carousel_wrap",
    }));

    injectCSSRule("#spage-tbshare-container, .tbui_aside_float_bar", {
        display: "none !important",
    });

    return renderComponent(root, page, rootProps);
}

export function createRenderWrapper(id: string, style?: CSSRule) {
    let wrapper = dom<"div">(`#${id}`);
    return () => {
        if (_.isNil(wrapper)) {
            wrapper = document.body.appendChild(domrd("div", {
                id,
                style: parseCSSRule(style ?? {} as CSSRule),
            }));
            return wrapper;
        }
        return wrapper;
    };
}

export interface DialogEvents<PayloadType = any> {
    beforeRender(): void,
    rendered(rendered: RenderedComponent): void,
    beforeUnload(rendered: RenderedComponent): void,
    unloaded(payload: PayloadType): void,
    abnormalUnload(abnormal: UserDialogAbnormal): void,
}

/**
 * 渲染对话框。只有以 `<UserDialog>` 及其继承组件为唯一根节点的组件才能作为对话框被正确渲染。
 * @param content 对话框内容组件
 * @param opts 组件选项
 * @param events 对话框事件绑定
 * @returns 对话框组件实例
 */
export function renderDialog<
    ContentOpts extends LiteralObject,
    PayloadType = any,
>(
    content: SupportedComponent,
    opts?: ContentOpts,
    events?: Partial<DialogEvents<PayloadType>>,
): RenderedComponent {
    events?.beforeRender?.();

    const dialogWrapper = document.body.appendChild(
        domrd("div", { class: "dialog-wrapper" })
    );
    const dialogApp = createApp(content, {
        ...opts,
        onUnload(payload: PayloadType) {
            events?.beforeUnload?.(rendered);
            _unload();
            events?.unloaded?.(payload);
        },
        onAbnormalUnload(abnormal: UserDialogAbnormal) {
            _unload();
            events?.abnormalUnload?.(abnormal);
        },
    });

    const rendered: RenderedComponent = {
        app: dialogApp,
        instance: dialogApp.mount(dialogWrapper),
    };

    events?.rendered?.(rendered);
    return rendered;

    function _unload() {
        dialogApp.unmount();
        if (dom("[aria-modal]", []).length === 0) {
            document.body.removeAttribute("no-scrollbar");
            document.body.style.paddingRight = "";
        }
        dialogWrapper.remove();
    }
}

export function userDialog<ContentOpts extends LiteralObject>(
    content: SupportedComponent,
    dialogOpts?: UserDialogOpts,
    opts?: ContentOpts
) {
    return renderDialog(<UserDialog {...dialogOpts}>{h(content, opts)}</UserDialog>);
}

export function removeDefault() {
    _.forEach(document.head.children, (el) => {
        if (el && el.tagName.toUpperCase() === "LINK"
            && _.includes(el.getAttribute("href"), "static-common/style")) {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "SCRIPT"
            && _.includes(el.getAttribute("src"), "static-common/lib")) {
            el.remove();
        }
    });

    // document.getElementById("com_userbar")?.remove();

    _.forEach(document.body.children, (el) => {
        if (el && el.tagName.toUpperCase() === "STYLE") {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "SCRIPT") {
            el.remove();
        }

        if (el && el.tagName.toUpperCase() === "IFRAME") {
            el.remove();
        }

        if (el && _.includes(el.className, "translatorExtension")) {
            el.remove();
        }

        if (el && _.includes(el.className, "dialogJ")) {
            el.remove();
        }
    });
}
