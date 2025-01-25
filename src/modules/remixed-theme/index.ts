import { dom, fadeInElems, fadeInLoad } from "@/lib/elemental";
import { injectCSSRule, overwriteCSS } from "@/lib/elemental/styles";
import { threadFloorsObserver } from "@/lib/observers";
import { setCustomBackground } from "@/lib/theme";
import "@/stylesheets/components/user-button.scss";
import _ from "lodash";
import floatBarStyle from "./tieba-components/float-bar.scss?inline";
import _navBar from "./tieba-components/nav-bar";

export default {
    id: "remixed-theme",
    name: "Tieba Remix 主题",
    author: "锯条",
    version: "0.3",
    brief: "更现代的主题样式",
    description: `包含新的样式、昼夜主题及其自动切换等功能`,
    scope: true,
    runAt: "immediately",
    entry: main,
} as UserModule;

function main(): void {
    _navBar();
    overwriteCSS(floatBarStyle);

    // 耗时加载元素
    fadeInElems.push(".tbui_aside_float_bar .svg-container");
    fadeInElems.push(".d_badge_bright .d_badge_lv, .user_level .badge_index");

    // 让耗时加载元素默认不透明度为0
    fadeInElems.forEach(selector => {
        injectCSSRule(selector, {
            opacity: "0",
        });
    });

    setCustomBackground();

    document.addEventListener("DOMContentLoaded", () => {
        // 修改元素
        dom(".post-tail-wrap .icon-jubao", []).forEach(elem => {
            elem.removeAttribute("src");
            elem.after("举报");
        });

        // 远古用户没有等级则隐藏等级标签
        threadFloorsObserver.addEvent(() => {
            dom<"div">(".d_badge_lv", []).forEach(elem => {
                if (elem.textContent === "") {
                    let parent = elem as HTMLElement;
                    while (!parent.classList.contains("l_badge")) {
                        if (parent.parentElement)
                            parent = parent.parentElement;
                    }
                    parent.style.display = "none";
                }
            });
        });
    });

    window.addEventListener("load", () => {
        // 功能按钮 svg 延迟
        fadeInLoad(".tbui_aside_float_bar .svg-container");

        // 为吧务和自己的等级染色
        threadFloorsObserver.addEvent(() => {
            const lvlClassHead = "tieba-lvl-";
            const lvlGreen = `${lvlClassHead}green`;
            const lvlBlue = `${lvlClassHead}blue`;
            const lvlYellow = `${lvlClassHead}yellow`;
            const lvlOrange = `${lvlClassHead}orange`;

            dom(
                ".d_badge_bawu1 .d_badge_lv, .d_badge_bawu2 .d_badge_lv, .badge_index", []
            ).forEach(elem => {
                if (elem.className.indexOf(lvlClassHead) !== -1) return;

                const lvl = parseInt(_.defaults(elem.textContent, "0"));
                if (lvl >= 1 && lvl <= 3) {
                    elem.classList.add(lvlGreen);
                } else if (lvl >= 4 && lvl <= 9) {
                    elem.classList.add(lvlBlue);
                } else if (lvl >= 10 && lvl <= 15) {
                    elem.classList.add(lvlYellow);
                } else if (lvl >= 16) {
                    elem.classList.add(lvlOrange);
                }
            });

            // 等级图标延迟
            fadeInLoad(".d_badge_bright .d_badge_lv, .user_level .badge_index");
        });
    });
}
