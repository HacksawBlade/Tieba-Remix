import { GM_addStyle } from "$";
import "@/stylesheets/main/animations.scss";
import baseStyle from "@/stylesheets/main/base.scss?inline";
import "@/stylesheets/main/material-symbols.css";
import "@/stylesheets/main/palette.scss";
import universalStyle from "@/stylesheets/main/universal.scss?inline";
import "@/stylesheets/main/variables.scss";
import tiebaErrorStyle from "@/stylesheets/tieba/tieba-error.scss?inline";
import tiebaForumStyle from "@/stylesheets/tieba/tieba-forum.scss?inline";
import tiebaHomeStyle from "@/stylesheets/tieba/tieba-home.scss?inline";
import tiebaMainStyle from "@/stylesheets/tieba/tieba-main.scss?inline";
import tiebaThreadStyle from "@/stylesheets/tieba/tieba-thread.scss?inline";
import _ from "lodash";
import { getResource } from "../api/remixed";
import { domrd } from "../elemental";
import { injectCSSRule, overwriteCSS, parseMultiCSS } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import { customBackground, customStyle, monospaceFonts, themeColor, userFonts, wideScreen } from "../user-values";
import { waitUntil } from "../utils";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

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
            "--code-zh": `${_.join(userFonts.get(), ",")}`,
            "--code-monospace": `${_.join(monospaceFonts.get(), ",")}`,
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

export async function loadMainCSS() {
    overwriteCSS(
        baseStyle,
        universalStyle,
        tiebaErrorStyle,
        tiebaForumStyle,
        tiebaHomeStyle,
        tiebaMainStyle,
        tiebaThreadStyle,
    );

    document.addEventListener("DOMContentLoaded", function () {
        document.head.appendChild(domrd("link", {
            type: "image/icon",
            rel: "shortcut icon",
            href: getResource("/assets/images/main/favicon32.ico"),
        }));
    }, { once: true });
}

let customBackgroundElement: Maybe<HTMLStyleElement> = undefined;

export async function setCustomBackground() {
    if (customBackgroundElement) {
        document.head.removeChild(customBackgroundElement);
    }
    customBackgroundElement = injectCSSRule("body.custom-background", {
        backgroundImage: `url('${customBackground.get()}') !important`,
        backgroundRepeat: "no-repeat !important",
        backgroundAttachment: "fixed !important",
        backgroundSize: "cover !important",
    });

    waitUntil(() => !_.isNil(document.body)).then(function () {
        if (customBackground.get()) {
            document.body.classList.add("custom-background");
        } else {
            document.body.classList.remove("custom-background");
        }
    });
}
