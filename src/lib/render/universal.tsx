import HeaderProgress, { HeaderProgressProps } from "@/components/header-progress.vue";
import imagesViewerVue, { ImageViewerProps } from "@/components/images-viewer.vue";
import { getFloatCoord } from "@/lib/render/layout/float";
import { renderDialog } from ".";
import { DOMS } from "../elemental";
import { waitUntil } from "../utils";
import { appendJSX, insertJSX } from "./jsx-extension";

export function imagesViewer(props: ImageViewerProps) {
    renderDialog(imagesViewerVue, props, { blurEffect: false });
}

export function headerProgress(props: HeaderProgressProps, delay = 2000, timeout = 10000) {
    const progressBar = <HeaderProgress calc={props.calc}></HeaderProgress>;
    const rendered = insertJSX<HTMLDivElement>(progressBar, document.body, document.body.firstChild);
    const timeoutTimer = setTimeout(() => {
        rendered.el.remove();
    }, timeout);
    waitUntil(() => rendered.el.style.width === "100vw", timeout).then(function () {
        setTimeout(() => {
            rendered.el.remove();
            clearTimeout(timeoutTimer);
        }, delay);
    });
    return rendered;
}

/**
 * 将元素和浮动消息框进行绑定
 * @param target 需要绑定的元素
 * @param message 信息
 * @param delay 展示延迟。默认为 500
 */
export function bindFloatMessage(target: HTMLElement, message: string, delay = 500) {
    const CursorMargin = 4;

    if (DOMS(".float-message").length <= 0) {
        appendJSX(
            <div class="float-message">
                <div class="float-content"></div>
            </div>, document.body);
    }
    const floatMessage = DOMS(true, ".float-message", "div");
    let timeout = -1;

    target.addEventListener("mouseenter", function () {
        if (timeout >= 0)
            clearTimeout(timeout);
    });

    target.addEventListener("mouseleave", function () {
        if (timeout >= 0)
            clearTimeout(timeout);

        floatMessage.style.display = "none";
    });

    target.addEventListener("mousemove", function (e) {
        if (timeout >= 0)
            clearTimeout(timeout);

        timeout = setTimeout(() => {
            if (floatMessage.style.display !== "block") {
                floatMessage.innerText = message;
                floatMessage.style.display = "block";
                floatMessage.style.top = "0";
                floatMessage.style.left = "0";

                const coord = getFloatCoord(floatMessage, {
                    x: e.clientX + CursorMargin,
                    y: e.clientY + CursorMargin,
                }, "baseline");
                console.log(coord);

                floatMessage.style.left = `${coord.x}px`;
                floatMessage.style.top = `${coord.y < e.clientY ? coord.y - CursorMargin * 2 : coord.y}px`;
            }
        }, delay);
    });
}
