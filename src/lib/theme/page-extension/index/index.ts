import { GM_addStyle } from "$";
import indexVue from "@/components/pages/index.vue";
import { currentPageType } from "@/lib/api/remixed";
import { dom } from "@/lib/elemental";
import { parseMultiCSS } from "@/lib/elemental/styles";
import { renderPage } from "@/lib/render";
import { pageExtension } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import { isNil } from "lodash-es";

export default async function () {
    if (currentPageType() !== "index") return;
    if (!pageExtension.get().index) return;

    const bodyMask = GM_addStyle(parseMultiCSS({
        "body": {
            display: "none",
        },
    }));

    await waitUntil(() => !isNil(dom(true, ".wrap1")));
    renderPage(indexVue);
    dom(true, ".wrap1").remove();
    bodyMask.remove();
}
