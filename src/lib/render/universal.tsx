import HeaderProgress, { HeaderProgressProps } from "@/components/header-progress.vue";
import { waitUntil } from "../utils";
import { insertJSX } from "./jsx-extension";

export function headerProgress(props: HeaderProgressProps, delay = 2000, timeout = 10000) {
    const progressBar = <HeaderProgress calc={props.calc} />;
    const rendered = insertJSX<HTMLDivElement>(progressBar, document.body, document.body.firstChild ?? undefined);
    const timeoutTimer = setTimeout(() => {
        rendered.root.remove();
    }, timeout);
    waitUntil(() => rendered.root.style.width === "100vw", timeout).then(function () {
        setTimeout(() => {
            rendered.root.remove();
            clearTimeout(timeoutTimer);
        }, delay);
    });
    return rendered;
}
