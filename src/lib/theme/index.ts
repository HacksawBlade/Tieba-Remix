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
            "--font-weight-normal": `${fontWeights.get().normal}`,
            "--font-weight-bold": `${fontWeights.get().bold}`,
        },

        ".dark-theme": {
            "--tieba-theme-color": theme.dark,
            "--user-theme": theme.dark,
            "--trans-tieba-theme-color": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`,
            "--user-theme-transp": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${darkHSLA.h}deg ${+darkHSLA.s + 40}% ${+darkHSLA.l + 10}%)`,
            "--user-theme-hover": `hsl(${darkHSLA.h}deg ${+darkHSLA.s + 40}% ${+darkHSLA.l + 10}%)`,
            "--tieba-theme-active": `hsl(${darkHSLA.h}deg ${+darkHSLA.s + 50}% ${+darkHSLA.l + 20}%)`,
            "--user-theme-active": `hsl(${darkHSLA.h}deg ${+darkHSLA.s + 50}% ${+darkHSLA.l + 20}%)`,
            "--tieba-theme-background": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`,
            "--user-theme-back": `rgb(${darkRGBA.r} ${darkRGBA.g} ${darkRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${darkHSLA.h}deg 100% 75%)`,
            "--user-theme-fore": `hsl(${darkHSLA.h}deg 100% 75%)`,
        },

        ".light-theme": {
            "--tieba-theme-color": theme.light,
            "--user-theme": theme.light,
            "--trans-tieba-theme-color": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`,
            "--user-theme-transp": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 80%)`,
            "--tieba-theme-hover": `hsl(${lightHSLA.h}deg ${+lightHSLA.s - 40}% ${+lightHSLA.l - 10}%)`,
            "--user-theme-hover": `hsl(${lightHSLA.h}deg ${+lightHSLA.s - 40}% ${+lightHSLA.l - 10}%)`,
            "--tieba-theme-active": `hsl(${lightHSLA.h}deg ${+lightHSLA.s - 50}% ${+lightHSLA.l - 20}%)`,
            "--user-theme-active": `hsl(${lightHSLA.h}deg ${+lightHSLA.s - 50}% ${+lightHSLA.l - 20}%)`,
            "--tieba-theme-background": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`,
            "--user-theme-back": `rgb(${lightRGBA.r} ${lightRGBA.g} ${lightRGBA.b} / 24%)`,
            "--tieba-theme-fore": `hsl(${lightHSLA.h}deg 60% 32%)`,
            "--user-theme-fore": `hsl(${lightHSLA.h}deg 60% 32%)`,
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
