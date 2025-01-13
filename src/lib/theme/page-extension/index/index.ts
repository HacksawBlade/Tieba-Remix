import { GM_addStyle } from "$";
import indexVue from "@/components/pages/index.vue";
import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";
import { parseMultiCSS } from "@/lib/elemental/styles";
import { renderPage } from "@/lib/render";
import { pageExtension } from "@/lib/user-values";

export default async function () {
    if (currentPageType() !== "index") return;
    if (!pageExtension.get().index) return;

    const bodyMask = GM_addStyle(parseMultiCSS({
        "body": {
            display: "none",
        },
    }));

    const wrap = await asyncdom(".wrap1");
    renderPage(indexVue);
    wrap.remove();
    bodyMask.remove();
}
