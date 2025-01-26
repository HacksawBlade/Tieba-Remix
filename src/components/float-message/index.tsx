import { SupportedComponent } from "@/ex";
import { dom } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import { appendJSX } from "@/lib/render/jsx-extension";
import { getFloatCoord } from "@/lib/render/layout/float";
import _ from "lodash";
import { nextTick, ref, Transition, VNode } from "vue";
import "./style.scss";

export interface FloatMessageOpts {
    /** 需要绑定的元素 */
    target: HTMLElement;
    content: string | SupportedComponent;
    /** 展示延迟。默认为 500 */
    delay?: number;
}

const CURSOR_MARGIN = 4;
const DEFAULT_IN_DELAY = 500;
const DEFAULT_OUT_DELAY = 100;

const messageShow = ref(false);
const messageContent = ref<string | SupportedComponent>("");
let timeout = -1;
let floatHover = false;
let flaotMessageVNode: Maybe<VNode> = undefined;

let handleTargetMouseEnter: Maybe<(e: MouseEvent) => void> = undefined;
let handleTargetMouseLeave: Maybe<(e: MouseEvent) => void> = undefined;
let handleTargetMouseMove: Maybe<(e: MouseEvent) => void> = undefined;

/**
 * 将元素和浮动消息框进行绑定
 * @param opts 选项
*/
export function floatMessage(opts: FloatMessageOpts) {
    if (_.isNil(opts.delay)) opts.delay = DEFAULT_IN_DELAY;
    let root = dom<"div">(".float-message");

    if (!root || !flaotMessageVNode) {
        flaotMessageVNode =
            <Transition name="float-message">
                <div
                    class="float-message"
                    v-show={messageShow.value}
                >
                    {typeof messageContent.value === "string" ? <span>{messageContent.value}</span> : messageContent.value}
                </div>
            </Transition>;
        const rendered = appendJSX(flaotMessageVNode, document.body);
        root = rendered.root as HTMLDivElement;
        const floatEvproxy = new EventProxy();

        floatEvproxy.on(root, "mouseenter", function () {
            floatHover = true;
            messageShow.value = true;
        });

        floatEvproxy.on(root, "mouseleave", function () {
            floatHover = false;
            setTimeout(() => {
                messageShow.value = false;
            }, DEFAULT_OUT_DELAY);
        });
    }

    handleTargetMouseEnter = () => {
        if (timeout >= 0)
            clearTimeout(timeout);
    };
    handleTargetMouseLeave = async () => {
        if (timeout >= 0)
            clearTimeout(timeout);

        setTimeout(() => {
            if (!floatHover) messageShow.value = false;
        }, DEFAULT_OUT_DELAY);
    };
    handleTargetMouseMove = (e: MouseEvent) => {
        if (timeout >= 0)
            clearTimeout(timeout);

        timeout = setTimeout(async () => {
            if (!messageShow.value) {
                messageContent.value = opts.content;
                messageShow.value = true;
                root.style.top = "0";
                root.style.left = "0";

                await nextTick();
                const coord = getFloatCoord(root, {
                    x: e.clientX + CURSOR_MARGIN,
                    y: e.clientY + CURSOR_MARGIN,
                }, "baseline");

                root.style.left = `${window.scrollX + coord.x - 1}px`;
                root.style.top = `${window.scrollY + (coord.y < e.clientY ? coord.y - CURSOR_MARGIN * 2 : coord.y)}px`;
            }
        }, opts.delay);
    };

    opts.target.addEventListener("mouseenter", handleTargetMouseEnter);
    opts.target.addEventListener("mouseleave", handleTargetMouseLeave);
    opts.target.addEventListener("mousemove", handleTargetMouseMove);
}

export function unbindFloatMessage(target: HTMLElement) {
    if (handleTargetMouseEnter) target.removeEventListener("mouseenter", handleTargetMouseEnter);
    if (handleTargetMouseLeave) target.removeEventListener("mouseleave", handleTargetMouseLeave);
    if (handleTargetMouseMove) target.removeEventListener("mousemove", handleTargetMouseMove);
}
