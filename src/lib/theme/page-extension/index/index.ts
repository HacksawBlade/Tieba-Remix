import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";
import { renderPage } from "@/lib/render";
import { pageExtension } from "@/lib/user-values";
import Home from "./index.vue";

export default async function () {
    if (currentPageType() !== "index") {
        return;
    }
    if (!pageExtension.get().index) {
        return;
    }
    const wrap = await asyncdom(".wrap1");
    renderPage(Home);
    wrap.remove();
}
