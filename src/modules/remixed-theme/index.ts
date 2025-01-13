/**
 * Tieba Remix 主题
 * @HacksawBlade
*/

import { dom, fadeInElems, fadeInLoad } from "@/lib/elemental";
import { injectCSSList, injectCSSRule } from "@/lib/elemental/styles";
import { threadFloorsObserver } from "@/lib/observers";
import { defaults } from "lodash-es";

import floatMessageCSS from "@/stylesheets/components/float-message.scss?inline";
import userButtonCSS from "@/stylesheets/components/user-button.scss?inline";
import floatBarCSS from "./tieba-components/float-bar.scss?inline";

import _navBar from "./tieba-components/nav-bar";
_navBar();

import { setCustomBackground } from "@/lib/theme";

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

const themeSheets: HTMLStyleElement[] = [];

function main(): void {
    // 全局加载
    // themeSheets.push(injectCSSList(mainCSS));
    // themeSheets.push(injectCSSList(postsCSS));
    // themeSheets.push(injectCSSList(homeCSS));
    // themeSheets.push(injectCSSList(errorCSS));

    // 组件
    themeSheets.push(injectCSSList(userButtonCSS));
    themeSheets.push(injectCSSList(floatBarCSS));
    themeSheets.push(injectCSSList(floatMessageCSS));

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

    // 进吧页面
    // if (location.href.indexOf("kw=") !== -1) {
    //     themeSheets.push(injectCSSList(barCSS));
    // }

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

                const lvl = parseInt(defaults(elem.textContent, "0"));
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

        // 移动所有样式表到head底部，防止自定义样式表提前被加载导致冲突
        themeSheets.forEach(sheet => {
            document.head.appendChild(sheet);
        });
    });
}
