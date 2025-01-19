import _ from "lodash";
import { currentPageType } from "./api/remixed";
import { threadFloorsObserver } from "./observers";
import { PerfType, perfProfile } from "./user-values";
import { waitUntil } from "./utils";

export function loadPerf() {
    setPerfAttr();
    setThreadLazyload();
}

/**
 * 根据性能配置对 `<html>` 标签添加对应的属性开关，供 CSS 等进行使用
 */
export function setPerfAttr() {
    const perfAttr: Record<PerfType, string> = {
        default: "perf-default",
        saver: "perf-saver",
        performance: "perf-performance",
    };

    _.forEach(document.documentElement.attributes, attr => {
        if (_.startsWith(attr.name, "perf-")) {
            document.documentElement.removeAttribute(attr.name);
        }
    });
    document.documentElement.toggleAttribute(perfAttr[perfProfile.get()]);
}

/**
 * 帖子页面懒加载性能配置
 * 
 * 针对不同性能配置，对楼中楼懒加载范围进行调整。高性能模式下会直接加载整页的评论，以减少视觉抖动；而节能配置被设定为贴吧默认值 (500).
 */
export async function setThreadLazyload() {
    if (currentPageType() !== "thread") return;
    const lazyloadDiff: Record<PerfType, number> = {
        default: 1000,
        saver: 500,
        performance: 9999,
    };
    await waitUntil(() => typeof datalazyload !== "undefined");

    threadFloorsObserver.addEvent(setDiff);

    function setDiff() {
        // 立即生效可能会被贴吧再次覆盖为原始值，所以延迟一段时间
        setTimeout(() => {
            datalazyload.userConfig.diff = lazyloadDiff[perfProfile.get()];
        }, 500);
    }
}
