import { GM_addStyle } from "$";
import { findIndex, isNil, join } from "lodash-es";
import { currentPageType, getResource } from "../api/remixed";
import { afterHead, domrd } from "../elemental";
import { defaultStyle, injectCSSRule, parseMultiCSS, removeCSSRule } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import { customBackground, customStyle, monospaceFonts, themeColor, userFonts, wideScreen } from "../user-values";
import { waitUntil } from "../utils";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

import "@/stylesheets/main/material-symbols.css";
import "@/stylesheets/main/palette.scss";
import "@/stylesheets/main/remixed-main.scss";
import "@/stylesheets/main/util-classes.scss";
import "@/stylesheets/main/variables.scss";
import "@/stylesheets/tieba/tieba-error.scss";
import "@/stylesheets/tieba/tieba-home.scss";
import "@/stylesheets/tieba/tieba-main.scss";
import "@/stylesheets/tieba/tieba-thread.scss";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

const dynCSSRules = {
    customBackground: () => findIndex(Array.from(defaultStyle.sheet?.cssRules ?? { length: 0 }), rule => (rule as CSSStyleRule).selectorText === "body.custom-background"),
};

/** 动态样式 */
export async function loadDynamicCSS() {
    const theme = themeColor.get();
    const darkRGBA = hexToRGBA(theme.dark);
    const lightRGBA = hexToRGBA(theme.light);
    const darkHSLA = rgbaToHSLA(darkRGBA);
    const lightHSLA = rgbaToHSLA(lightRGBA);

    const dynCSS = parseMultiCSS({
        ":root": {
            "--content-max": wideScreen.get().noLimit
                ? "100vw"
                : `${wideScreen.get().maxWidth}px`,
            "--code-zh": `${join(userFonts.get(), ",")}`,
            "--code-monospace": `${join(monospaceFonts.get(), ",")}`,
        },

        "html.dark-theme": {
            "--tieba-theme-color": theme.dark,
            "--trans-tieba-theme-color": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 40}% ${parseInt(darkHSLA.l) + 10}%)`,
            "--tieba-theme-active": `hsl(${darkHSLA.h}deg ${parseInt(darkHSLA.s) + 50}% ${parseInt(darkHSLA.l) + 20}%)`,
            "--tieba-theme-background": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${darkHSLA.h}deg 100% 75%)`,
        },

        "html.light-theme": {
            "--tieba-theme-color": theme.light,
            "--trans-tieba-theme-color": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 40}% ${parseInt(lightHSLA.l) - 10}%)`,
            "--tieba-theme-active": `hsl(${lightHSLA.h}deg ${parseInt(lightHSLA.s) - 50}% ${parseInt(lightHSLA.l) - 20}%)`,
            "--tieba-theme-background": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${lightHSLA.h}deg 60% 32%)`,
        },
    });

    GM_addStyle(dynCSS);

    window.addEventListener("load", function () {
        GM_addStyle(
            parseMultiCSS({
                ":root": {
                    "--scrollbar-width": `${scrollbarWidth()}px`,
                },
            })
        );
    }, { once: true });

    const customCSS = customStyle.get();
    if (customCSS !== "") GM_addStyle(customCSS);
}

export async function loadTiebaCSS() {
    switch (currentPageType()) {
        case "forum":
            import("@/stylesheets/tieba/tieba-forum.scss");
            break;
    }

    document.head.appendChild(domrd("link", {
        type: "image/icon",
        rel: "shortcut icon",
        href: getResource("/assets/images/main/favicon32.ico"),
    }));
}

export async function setCustomBackground() {
    afterHead(function () {
        if (dynCSSRules.customBackground() !== -1) {
            removeCSSRule(dynCSSRules.customBackground());
        }
        injectCSSRule("body.custom-background", {
            backgroundImage: `url('${customBackground.get()}') !important`,
            backgroundRepeat: "no-repeat !important",
            backgroundAttachment: "fixed !important",
            backgroundSize: "cover !important",
        }) ?? -1;

        waitUntil(() => !isNil(document.body)).then(function () {
            if (customBackground.get()) {
                document.body.classList.add("custom-background");
            } else {
                document.body.classList.remove("custom-background");
            }
        });
    });
}
