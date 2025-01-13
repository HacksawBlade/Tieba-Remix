import navBarVue from "@/components/nav-bar.vue";
import { asyncdom } from "@/lib/elemental";
import { renderComponent } from "@/lib/render";
import { insertJSX } from "@/lib/render/jsx-extension";

import { GM_addStyle } from "$";
import navBarCSS from "./nav-bar.scss?inline";

export default async function () {
    GM_addStyle(navBarCSS);

    const elder = await asyncdom("#com_userbar");
    const navWrapper = <div id="nav-wrapper" class="nav-wrapper"></div>;
    insertJSX(navWrapper, document.body, elder);
    renderComponent(navBarVue, await asyncdom("#nav-wrapper"));
}
