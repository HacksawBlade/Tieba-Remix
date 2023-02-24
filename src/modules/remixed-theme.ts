import { fadeInLoad, injectCSSList } from "../lib/dom-control";
import { remixedObservers } from "../lib/observers";

import globalCSS from "../stylesheets/_global.css";
import mainCSS from "../stylesheets/_tieba-main.css";
import homeCSS from "../stylesheets/_tieba-home.css";
import postsCSS from "../stylesheets/_tieba-post.css";
import barCSS from "../stylesheets/_tieba-bar.css";
import errorCSS from "../stylesheets/_tieba-error.css";

import boldFontCSS from "../stylesheets/bold-font.css";
import extremeCSS from "../stylesheets/extreme.css";
import unsetFontCSS from "../stylesheets/unset-font.css";

import { DEFAULT_FONT_TYPE, ENABLE_BOLD_FONT, EXTREME_PURIF } from "../greasy-init";

"use strict";

// 全局加载
injectCSSList(globalCSS);
injectCSSList(mainCSS);
injectCSSList(postsCSS);
injectCSSList(homeCSS);
injectCSSList(errorCSS);

// 用户配置
if (ENABLE_BOLD_FONT) injectCSSList(boldFontCSS);
if (EXTREME_PURIF) injectCSSList(extremeCSS);
if (DEFAULT_FONT_TYPE) injectCSSList(unsetFontCSS);

// 进吧页面
if (location.href.indexOf("kw=") !== -1) {
    injectCSSList(barCSS);
}

document.addEventListener("DOMContentLoaded", () => {
    // 修改元素
    $(".post-tail-wrap .icon-jubao").toArray().forEach(elem => {
        elem.removeAttribute("src");
        elem.after("举报");
    });

    // 为吧务和自己的等级染色
    remixedObservers.postsObserver.addEvent(() => {
        const lvlClassHead = "tieba-lvl-";
        const lvlGreen = lvlClassHead + "green";
        const lvlBlue = lvlClassHead + "blue";
        const lvlYellow = lvlClassHead + "yellow";
        const lvlOrange = lvlClassHead + "orange";

        $(
            ".d_badge_bawu1 .d_badge_lv, .d_badge_bawu2 .d_badge_lv, .badge_index"
        ).toArray().forEach(elem => {
            if (elem.className.indexOf(lvlClassHead) !== -1) return;

            const lvl = parseInt(elem.textContent!);
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

    // 远古用户没有等级则隐藏等级标签
    remixedObservers.postsObserver.addEvent(() => {
        $(".d_badge_lv").toArray().forEach(elem => {
            if (elem.textContent === "") {
                let parent = elem;
                while (!parent.classList.contains("l_badge")) {
                    parent = parent.parentElement!;
                }
                parent.style.display = "none";
            }
        });
    });
});

window.addEventListener("load", () => {
    // 为功能按钮注入 svg 容器
    $(".tbui_aside_float_bar li a").toArray().forEach(elem => {
        // @ts-ignore
        GM_addElement(elem, "div", {
            class: "svg-container"
        });
    });

    // 功能按钮 svg 延迟
    fadeInLoad(".tbui_aside_float_bar .svg-container");
});
