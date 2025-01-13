import { findKey } from "lodash-es";
import { TiebaAbstract, TiebaComponent } from "../api/abstract";
import { dom, domrd } from "../elemental";

export const floatButtonMap = {
    "auxiliary": "tbui_fbar_auxiliaryCare",
    "down": "tbui_fbar_down",
    "post": "tbui_fbar_post",
    "props": "tbui_fbar_props",
    "tsukkomi": "tbui_fbar_tsukkomi",
    "share": "tbui_fbar_share",
    "favor": "tbui_fbar_favor",
    "feedback": "tbui_fbar_feedback",
    "top": "tbui_fbar_top",
    "other": "*",
};

export class FloatBar extends TiebaComponent<"ul"> {
    /**
     * 获取当前页面的 float buttons
     * @returns FloatBarButton[]
     */
    public buttons(): FloatButton[] {
        if (!this.get()) return [];
        return Array.from(dom(".tbui_aside_fbar_button", "li", floatBar.get())).map(el => ({
            el: el,
            type: (function () {
                for (let i = 0; i < el.classList.length; i++) {
                    const cls = el.classList[i];
                    if (!cls.includes("tbui_fbar_")) continue;

                    // 这类型用的可能是有点魔怔了
                    const key = findKey(floatButtonMap, (value) => value === cls);
                    if (key) {
                        return key as FloatButtonKey;
                    }
                }
                return "other";
            })(),
        }));
    }

    public add(
        type: FloatButtonKey, event: (() => void),
        className?: string, icon?: string, index = 0
    ) {
        const anchor = domrd("a", {
            href: "javascript:;",
        });

        const el = domrd("li", {
            class: "tbui_aside_fbar_button",
        }, [anchor]);

        // const el =
        //     <li class="tbui_aside_fbar_button">
        //         <a href="javascript:;"></a>
        //     </li>;

        el.addEventListener("click", event);

        if (type !== "other") {
            el.classList.add(floatButtonMap[type]);
        }
        if (className)
            el.classList.add(className);
        floatBar.get().insertBefore(el, floatBar.get().children[index]);
        setFloatButtonIcon(anchor, icon);

        return { el: el, type: type } as FloatButton;

        function setFloatButtonIcon(el: HTMLAnchorElement, icon?: string) {
            el.classList.add("icon");
            el.classList.add("tbui_aside_fbar_button");
            el.innerHTML = icon ? icon : "";
        }
    }

    public remove(className: string): void;
    public remove(index: number): void;

    public remove(param: string | number) {
        switch (typeof param) {
            case "string": {
                const el = dom(param, "li", floatBar.get())[0];
                el.remove();
                break;
            }

            case "number": {
                const el = floatBar.get().children[param];
                el.remove();
                break;
            }

            default:
                break;
        }
    }
}

export type FloatButtonKey = keyof typeof floatButtonMap;

export interface FloatButton extends TiebaAbstract {
    el: HTMLLIElement;
    type: FloatButtonKey;
}

/** 浮动栏 */
export const floatBar = new FloatBar(".tbui_aside_float_bar", "ul");

// /**
//  * 获取当前页面的 float buttons
//  * @returns FloatBarButton[]
//  */
// export function getFloatButtons(): FloatButton[] {
//     if (!floatBar) return [];
//     return Array.from(DOMS(".tbui_aside_fbar_button", "li", floatBar.get())).map(el => ({
//         el: el,
//         type: (function () {
//             for (let i = 0; i < el.classList.length; i++) {
//                 const cls = el.classList[i];
//                 if (!cls.includes("tbui_fbar_")) continue;

//                 // 这类型用的可能是有点魔怔了
//                 const key = findKey(floatButtonMap, (value) => value === cls);
//                 if (key) {
//                     return key as FloatButtonKey;
//                 }
//             }
//             return "other";
//         })(),
//     }));
// }

// export function addFloatButton(
//     type: FloatButtonKey, event: (() => void),
//     className?: string, icon?: string, index = 0
// ) {
//     const anchor = createNewElement("a", {
//         href: "javascript:;",
//     });

//     const el = createNewElement("li", {
//         class: "tbui_aside_fbar_button",
//     }, [anchor]);

//     el.addEventListener("click", event);

//     if (type !== "other") {
//         el.classList.add(`tbui_fbar_${floatButtonMap[type]}`);
//     }
//     el.classList.add(className ? className : "");
//     floatBar.get().insertBefore(el, floatBar.get().children[index]);
//     setFloatButtonIcon(anchor, icon);

//     return { el: el, type: type } as FloatButton;

//     function setFloatButtonIcon(el: HTMLAnchorElement, icon?: string) {
//         el.style.fontFamily = SymbolFont;
//         el.style.fontVariationSettings = `"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 20`;
//         el.style.userSelect = "none";
//         el.innerHTML = icon ? icon : "";
//         el.style.fontSize = "24px";
//         el.style.lineHeight = "40px";
//         el.style.textAlign = "center";
//         el.style.color = "rgb(200, 200, 200)";
//     }
// }

// export function removeFloatButton(className: string) {
//     const el = DOMS(className, "li", floatBar.get())[0];
//     el.remove();
// }
