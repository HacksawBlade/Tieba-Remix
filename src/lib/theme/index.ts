import { GM_addStyle } from "$";
import "@/stylesheets/main/animations.scss";
import baseStyle from "@/stylesheets/main/base.scss?inline";
import "@/stylesheets/main/material-symbols.css";
import paletteStyle from "@/stylesheets/main/palette.scss?inline";
import universalStyle from "@/stylesheets/main/universal.scss?inline";
import "@/stylesheets/main/variables.scss";
import tiebaErrorStyle from "@/stylesheets/tieba/tieba-error.scss?inline";
import tiebaForumStyle from "@/stylesheets/tieba/tieba-forum.scss?inline";
import tiebaHomeStyle from "@/stylesheets/tieba/tieba-home.scss?inline";
import tiebaMainStyle from "@/stylesheets/tieba/tieba-main.scss?inline";
import tiebaThreadStyle from "@/stylesheets/tieba/tieba-thread.scss?inline";
import _ from "lodash";
import { injectCSSRule, overwriteCSS, parseMultiCSS } from "../elemental/styles";
import { scrollbarWidth } from "../render";
import {
    customBackground,
    customStyle,
    fontWeights,
    monospaceFonts,
    themeColor,
    userFonts,
    wideScreen,
} from "../user-values";
import { waitUntil } from "../utils";
import type { HSLA } from "../utils/color";
import { hexToRGBA, rgbaToHSLA } from "../utils/color";

export const darkPrefers = matchMedia("(prefers-color-scheme: dark)");

/** 动态样式 */
export async function loadDynamicCSS() {
    const mainColor = themeColor.get();
    const mainRGBA = hexToRGBA(mainColor);
    const mainHSLA = rgbaToHSLA(mainRGBA);

    const darkL = mainHSLA.l < 20 ? 55 : mainHSLA.l < 40 ? 60 : mainHSLA.l < 60 ? 70 : 75;
    const darkS = Math.max(mainHSLA.s * 1.1, 0);
    const darkHSLA: HSLA = {
        h: mainHSLA.h,
        s: darkS,
        l: darkL,
        a: 1,
    };

    const dynCSS = parseMultiCSS({
        ":root": {
            "--content-max": wideScreen.get().noLimit
                ? "100vw"
                : `${wideScreen.get().maxWidth}px`,
            "--code-zh": `${_.join(userFonts.get(), ",")}`,
            "--code-monospace": `${_.join(monospaceFonts.get(), ",")}`,
            "--font-weight-normal": `${fontWeights.get().normal}`,
            "--font-weight-bold": `${fontWeights.get().bold}`,
        },

        ".dark-theme": {
            "--tieba-theme-color": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}%)`,
            "--user-theme": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}%)`,
            "--trans-tieba-theme-color": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}% / 80%)`,
            "--user-theme-transp": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}% / 80%)`,
            "--tieba-theme-hover": `hsl(${darkHSLA.h}deg ${_.clamp(darkHSLA.s + 15, 0, 100)}% ${_.clamp(darkHSLA.l + 10, 0, 100)}%)`,
            "--user-theme-hover": `hsl(${darkHSLA.h}deg ${_.clamp(darkHSLA.s + 15, 0, 100)}% ${_.clamp(darkHSLA.l + 10, 0, 100)}%)`,
            "--tieba-theme-active": `hsl(${darkHSLA.h}deg ${_.clamp(darkHSLA.s + 25, 0, 100)}% ${_.clamp(darkHSLA.l + 18, 0, 100)}%)`,
            "--user-theme-active": `hsl(${darkHSLA.h}deg ${_.clamp(darkHSLA.s + 25, 0, 100)}% ${_.clamp(darkHSLA.l + 18, 0, 100)}%)`,
            "--tieba-theme-background": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}% / 24%)`,
            "--user-theme-back": `hsl(${darkHSLA.h}deg ${darkHSLA.s}% ${darkHSLA.l}% / 24%)`,
            "--tieba-theme-fore": `hsl(${darkHSLA.h}deg ${_.clamp(darkS * 1.15, 0, 100)}% ${_.clamp(darkL + 12, 55, 85)}%)`,
            "--user-theme-fore": `hsl(${darkHSLA.h}deg ${_.clamp(darkS * 1.15, 0, 100)}% ${_.clamp(darkL + 12, 55, 85)}%)`,
        },

        ".light-theme": {
            "--tieba-theme-color": mainColor,
            "--user-theme": mainColor,
            "--trans-tieba-theme-color": `hsl(${mainHSLA.h}deg ${mainHSLA.s}% ${mainHSLA.l}% / 80%)`,
            "--user-theme-transp": `hsl(${mainHSLA.h}deg ${mainHSLA.s}% ${mainHSLA.l}% / 80%)`,
            "--tieba-theme-hover": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s - 15, 0, 100)}% ${_.clamp(mainHSLA.l - 8, 0, 100)}%)`,
            "--user-theme-hover": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s - 15, 0, 100)}% ${_.clamp(mainHSLA.l - 8, 0, 100)}%)`,
            "--tieba-theme-active": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s - 25, 0, 100)}% ${_.clamp(mainHSLA.l - 15, 0, 100)}%)`,
            "--user-theme-active": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s - 25, 0, 100)}% ${_.clamp(mainHSLA.l - 15, 0, 100)}%)`,
            "--tieba-theme-background": `hsl(${mainHSLA.h}deg ${mainHSLA.s}% ${mainHSLA.l}% / 10%)`,
            "--user-theme-back": `hsl(${mainHSLA.h}deg ${mainHSLA.s}% ${mainHSLA.l}% / 10%)`,
            "--tieba-theme-fore": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s, 0, 100)}% ${_.clamp(mainHSLA.l - 25, 12, 35)}%)`,
            "--user-theme-fore": `hsl(${mainHSLA.h}deg ${_.clamp(mainHSLA.s, 0, 100)}% ${_.clamp(mainHSLA.l - 25, 12, 35)}%)`,
        },
    });

    overwriteCSS(dynCSS);

    window.addEventListener(
        "load",
        () => {
            GM_addStyle(
                parseMultiCSS({
                    ":root": {
                        "--scrollbar-width": `${scrollbarWidth()}px`,
                    },
                }),
            );
        },
        { once: true },
    );

    const customCSS = customStyle.get();
    if (customCSS !== "") {
        GM_addStyle(customCSS);
    }
}

export async function loadMainCSS() {
    overwriteCSS(
        paletteStyle,
        baseStyle,
        universalStyle,
        tiebaErrorStyle,
        tiebaForumStyle,
        tiebaHomeStyle,
        tiebaMainStyle,
        tiebaThreadStyle,
    );

    // document.addEventListener(
    //     "DOMContentLoaded",
    //     function () {
    //         document.head.appendChild(
    //             domrd("link", {
    //                 type: "image/icon",
    //                 rel: "shortcut icon",
    //                 href: getResource("/assets/images/main/favicon32.ico"),
    //             }),
    //         );
    //     },
    //     { once: true },
    // );
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

    waitUntil(() => !_.isNil(document.body)).then(() => {
        if (customBackground.get()) {
            document.body.classList.add("custom-background");
        } else {
            document.body.classList.remove("custom-background");
        }
    });
}
