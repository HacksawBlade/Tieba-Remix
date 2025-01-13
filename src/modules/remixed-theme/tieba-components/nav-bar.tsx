import navBarVue from "@/components/nav-bar.vue";
import { dom } from "@/lib/elemental";
import { injectCSSList } from "@/lib/elemental/styles";
import { renderComponent } from "@/lib/render";
import { insertJSX } from "@/lib/render/jsx-extension";
import { waitUntil } from "@/lib/utils";

import navBarCSS from "./nav-bar.scss?inline";

export default function () {
    injectCSSList(navBarCSS);

    waitUntil(() => dom("#com_userbar").length > 0).then(function () {
        const elder = dom("#com_userbar")[0];
        const navWrapper = <div id="nav-wrapper" class="nav-wrapper"></div>;

        insertJSX(navWrapper, document.body, elder);
        renderComponent(navBarVue, dom("#nav-wrapper")[0]);
    });
}
