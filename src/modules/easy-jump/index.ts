/**
 * Easy Jump
 * 直接获取贴吧中超链接的直链，不再进行中转
 * @HacksawBlade
*/

import { afterHead, asyncdom } from "@/lib/elemental";
import { injectCSSRule } from "@/lib/elemental/styles";

export default {
    id: "easy-jump",
    name: "直链跳转",
    author: "锯条",
    version: "1.0.2",
    brief: "链接跳转避免二次确认",
    description: `自动跳转至分享链接的原始地址，不再进行中转（不处理被严重警告的链接）`,
    scope: /jump2?.bdimg.com\/safecheck\//,
    runAt: "immediately",
    entry: main,
} as UserModule;

async function main() {
    afterHead(function () {
        injectCSSRule("html", {
            backgroundColor: "var(--page-background)",
        });
        injectCSSRule("body", {
            display: "none",
        });
    });

    location.href = (await asyncdom<"a">(".link")).innerText;
}
