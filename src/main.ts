import "element-plus/dist/index.css";
import { throttle } from "lodash-es";
import { checkUpdateAndNotify, currentPageType, setTheme } from "./lib/api/remixed";
import { parseUserModules } from "./lib/common/packer";
import { forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "./lib/observers";
import { loadPerf } from "./lib/perf";
import { darkPrefers, loadBaseCSS, loadDynamicCSS, loadExtensionCSS, loadTiebaCSS } from "./lib/theme";
import index from "./lib/theme/page-extension/index";
import thread from "./lib/theme/page-extension/thread";
import { REMIXED, pageExtension, themeType, wideScreen } from "./lib/user-values";
import { AllModules, waitUtil } from "./lib/utils";

// 尽早完成主题设置，降低闪屏概率
setTheme(themeType.get());
darkPrefers.addEventListener("change", () => setTheme(themeType.get()));

// 基本样式加载
loadBaseCSS();

Promise.all([
    loadDynamicCSS(),
    loadTiebaCSS(),
    loadExtensionCSS(),
    index(),
    thread(),
    (async function loadUserModules(): Promise<void> {
        parseUserModules(
            import.meta.glob("./modules/**/index.ts"),
            module => {
                AllModules().push(module);
            }
        );
    })(),
    (async function observing(): Promise<void> {
        document.addEventListener("DOMContentLoaded", function () {
            if (currentPageType() === "thread") {
                threadFloorsObserver.observe();
                threadCommentsObserver.observe();
            }

            if (currentPageType() === "index") {
                if (!pageExtension.get().index)
                    legacyIndexFeedsObserver.observe();
            }

            if (currentPageType() === "forum") {
                forumThreadsObserver.observe();
            }
        });
    })(),
]);

window.addEventListener("load", function () {
    checkUpdateAndNotify();
});

// 收缩视图检测
waitUtil(() => document.body !== null).then(function () {
    if (wideScreen.get().noLimit) {
        document.body.classList.add("shrink-view");
    } else {
        const shrinkListener = throttle(function () {
            if (window.innerWidth <= wideScreen.get().maxWidth) {
                document.body.classList.add("shrink-view");
            } else {
                document.body.classList.remove("shrink-view");
            }
        }, 200);

        shrinkListener();
        window.addEventListener("resize", shrinkListener);
    }
});

// 性能配置
loadPerf();

console.info(REMIXED);
