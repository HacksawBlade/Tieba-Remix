import toastVue, { ToastProps } from "@/components/utils/toast.vue";
import { App, createApp } from "vue";
import { domrd } from "../elemental";
import { perfProfile } from "../user-values";
import { Queue } from "../utils/queue";

/** toast 组件实例 */
export let publicToastInstance: App<Element>;

let isToasting = false;
const toastsQueue = new Queue<[ToastProps, number]>();

/**
 * 展示 `toast` 通知
 * @param props `toast` 通知的属性
 */
export function toast(props: ToastProps) {
    toastsQueue.enqueue([{
        blurEffect: perfProfile.get() === "performance",
        ...props,
    }, -1]);
    const interval = setInterval(() => {
        if (!isToasting) {
            const peek = toastsQueue.peek();
            if (peek) renderToast(peek[0]);
            clearInterval(interval);
        }
    }, 100);
}

function renderToast(toastProps: ToastProps) {
    isToasting = true;
    publicToastInstance = createApp(toastVue, toastProps as LiteralObject);

    // id 名带 "toast" 会被 AdBlock 直接暴力隐藏
    if (!document.getElementById("t-wrapper"/* toast-wrapper */)) {
        document.body.insertBefore(domrd("div", {
            "id": "t-wrapper",
        }), document.body.firstChild);
    }

    const vm = publicToastInstance.mount("#t-wrapper");

    const peek = toastsQueue.peek();
    if (!peek) return;

    peek[1] = setTimeout(() => {
        publicToastInstance.unmount();
        toastsQueue.dequeue();
        isToasting = false;
    }, toastProps.duration ? toastProps.duration as number : 6000);
    return vm;
}

export function passToNextToast() {
    publicToastInstance.unmount();
    const peek = toastsQueue.peek();
    if (peek) {
        clearTimeout(peek[1]);
    }

    toastsQueue.dequeue();
    isToasting = false;
    const next = toastsQueue.peek();
    if (next) {
        setTimeout(() => {
            renderToast(next[0]);
        }, 10);
    }
}
