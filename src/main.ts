import { GM_registerMenuCommand } from "$";
import _ from "lodash";
import Settings from "./components/settings.vue";
import { checkUpdateAndNotify, currentPageType, setTheme } from "./lib/api/remixed";
import { parseUserModules } from "./lib/common/packer";
import { forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "./lib/observers";
import { loadPerf } from "./lib/perf";
import { renderDialog } from "./lib/render";
import { darkPrefers, loadDynamicCSS, loadMainCSS } from "./lib/theme";
import index from "./lib/theme/page-extension/index";
import thread from "./lib/theme/page-extension/thread";
import { REMIXED, pageExtension, themeType, wideScreen } from "./lib/user-values";
import { AllModules, waitUntil } from "./lib/utils";

// 尽早完成主题设置，降低闪屏概率
setTheme(themeType.get());
darkPrefers.addEventListener("change", () => setTheme(themeType.get()));

Promise.all([
    loadDynamicCSS(),
    loadMainCSS(),
    index(),
    thread(),
    parseUserModules(
        import.meta.glob("./modules/**/index.ts"),
        module => {
            AllModules().push(module);
        }
    ),
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
    }),
]);

window.addEventListener("load", function () {
    checkUpdateAndNotify();
});

// 收缩视图检测
waitUntil(() => !_.isNil(document.body)).then(function () {
    if (wideScreen.get().noLimit) {
        document.body.classList.add("shrink-view");
    } else {
        const shrinkListener = _.throttle(function () {
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

GM_registerMenuCommand("设置", () => renderDialog(Settings));

console.info(REMIXED);
