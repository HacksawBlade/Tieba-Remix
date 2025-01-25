import { SupportedComponent } from "@/ex";
import { dom } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import { appendJSX, RenderedJSX } from "@/lib/render/jsx-extension";
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

/**
 * 将元素和浮动消息框进行绑定
 * @param opts 选项
*/
export function floatMessage(opts: FloatMessageOpts): RenderedJSX<HTMLDivElement> {
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

    const targetEvproxy = new EventProxy();

    targetEvproxy.on(opts.target, "mouseenter", function () {
        if (timeout >= 0)
            clearTimeout(timeout);
    });

    targetEvproxy.on(opts.target, "mouseleave", async function () {
        if (timeout >= 0)
            clearTimeout(timeout);

        setTimeout(() => {
            if (!floatHover) messageShow.value = false;
        }, DEFAULT_OUT_DELAY);
    });

    targetEvproxy.on(opts.target, "mousemove", function (e: MouseEvent) {
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

                root.style.left = `${coord.x - 1}px`;
                root.style.top = `${coord.y < e.clientY ? coord.y - CURSOR_MARGIN * 2 : coord.y}px`;
            }
        }, opts.delay);
    });

    return {
        root,
        vnode: flaotMessageVNode,
        remove() {
            clearTimeout(timeout);
            targetEvproxy.release();
        },
    };
}
