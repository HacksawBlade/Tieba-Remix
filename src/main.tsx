import { GM_registerMenuCommand } from "$";
import _ from "lodash";
import { toast } from "user-view";
import "user-view/build/index.css";
import Settings from "./components/settings.vue";
import {
    backupUserConfigs,
    checkMultiInstances,
    checkUpdateAndNotify,
    currentPageType,
    restoreUserConfigs,
    setTheme,
} from "./lib/api/remixed";
import { parseUserModules } from "./lib/common/packer";
import {
    forumThreadsObserver,
    legacyIndexFeedsObserver,
    threadCommentsObserver,
    threadFloorsObserver,
} from "./lib/observers";
import { loadPerf } from "./lib/perf";
import { fallbackDialog, renderDialog } from "./lib/render";
import { darkPrefers, loadDynamicCSS, loadEssentialCSS, loadMainCSS } from "./lib/theme";
import index from "./lib/theme/page-extension/index";
import thread from "./lib/theme/page-extension/thread";
import {
    neverFallbackToLegacy,
    pageExtension,
    REMIXED,
    themeType,
    usingLegacyTieba,
    wideScreen,
} from "./lib/user-values";
import { AllModules, waitUntil } from "./lib/utils";

// 尽早完成主题设置，降低闪屏概率
setTheme(themeType.get());
darkPrefers.addEventListener("change", () => {
    setTheme(themeType.get());
});

// 根据贴吧版本决定行为
// 为确保运行速度，会缓存用户上一次的选择，直到页面完全加载后才进行检测和更新
if (usingLegacyTieba.get()) {
    legacyTiebaLauncher();
}

window.addEventListener(
    "load",
    () => {
        const newBody = document.getElementsByClassName("cos-tieba");
        if (newBody.length) {
            cosTiebaLauncher();
        }
        usingLegacyTieba.set(!newBody.length);
    },
    { once: true },
);

window.addEventListener(
    "load",
    () => {
        checkMultiInstances();
        checkUpdateAndNotify();
    },
    { once: true },
);

function legacyTiebaLauncher() {
    loadEssentialCSS();
    Promise.all([
        loadMainCSS(),
        loadDynamicCSS(),
        index(),
        thread(),
        parseUserModules(import.meta.glob("./modules/**/index.ts"), (module) => {
            AllModules().push(module);
        }),
    ]);

    document.addEventListener("DOMContentLoaded", () => {
        if (currentPageType() === "thread") {
            threadFloorsObserver.observe();
            threadCommentsObserver.observe();
        }

        if (currentPageType() === "index") {
            if (!pageExtension.get().index) {
                legacyIndexFeedsObserver.observe();
            }
        }

        if (currentPageType() === "forum") {
            forumThreadsObserver.observe();
        }
    });

    // 收缩视图检测
    waitUntil(() => !_.isNil(document.body)).then(() => {
        if (wideScreen.get().noLimit) {
            document.body.classList.add("shrink-view");
        } else {
            const shrinkListener = _.throttle(() => {
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
    GM_registerMenuCommand("备份用户配置", backupUserConfigs);
    GM_registerMenuCommand("恢复用户配置", () => {
        toast({
            type: "warning",
            message:
                "若未弹出文件对话框，请先点击网页任意位置再使用该功能，或是直接从设置中恢复",
        });
        restoreUserConfigs();
    });
}

function cosTiebaLauncher() {
    loadEssentialCSS();
    Promise.all([loadDynamicCSS()]);
    if (!neverFallbackToLegacy.get()) {
        fallbackDialog();
    }
}

console.info(REMIXED);
