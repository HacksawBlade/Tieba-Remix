import { waitUntil } from "libelemental";
import { customRef } from "vue";

export const IS_DEV = import.meta.env.DEV;
export const BUSY_CLASS = "nprogress-busy";

/**
 * 创建延迟更新（防抖）的 `ref`
 * @param value 初始化数据
 * @param delay 延迟时间
 * @returns 具有防抖效果的 `ref`
 */
export function delayedRef<T>(value: T, delay = 500) {
    let timeout: number | undefined;
    return customRef((track, trigger) => ({
        get() {
            track();
            return value;
        },
        set(newValue: T) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                trigger();
                value = newValue;
            }, delay);
        },
    }));
}

/**
 * 页面变化后，等待变化完毕，文档不再忙碌
 * @param timeout 超时时限。默认会有一个合适的时间
 */
export async function waitForPageIdle(timeout?: number) {
    await waitUntil(
        () => !document.documentElement.classList.contains(BUSY_CLASS),
        timeout ?? 4000,
    );
}

/**
 * 包装 `document.addEventListener("DOMContentLoaded", ...)`，在调试模式下脚本注入时机可能会晚于这个时刻，需要直接执行
 * @param callback 回调函数
 */
export function onDOMReady(callback: () => void) {
    if (IS_DEV || document.readyState !== "loading") {
        requestIdleCallback(async () => {
            callback();
        });
    } else {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    }
}

/**
 * 包装 `window.addEventListener("load", ...)`，在调试模式下脚本注入时机可能会晚于这个时刻，需要直接执行
 * @param callback 回调函数
 */
export function onPageLoaded(callback: () => void) {
    if (IS_DEV || document.readyState === "complete") {
        requestIdleCallback(async () => {
            await waitForPageIdle();
            callback();
        });
    } else {
        window.addEventListener(
            "load",
            async () => {
                await waitForPageIdle();
                callback();
            },
            { once: true },
        );
    }
}
