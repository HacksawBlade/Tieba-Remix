import { imagesViewer } from "@/components/images-viewer";
import { Owner, OwnerProfile } from "@/lib/user-values";
import { dom, EventProxy, findParent } from "libelemental";
import _ from "lodash";

export default {
    namespace: "custom-imgviewer",
    title: "自定义图片查看器",
    version: "1.0.0",
    contributors: [{ name: Owner, url: OwnerProfile }],
    brief: "替换为脚本内置的图片查看器",
    description: "将贴吧默认的图片查看器替换为脚本内置的版本",
    scope: ["index", "thread"],
    runAt: "DOMLoaded",
    compatibility: "current",
    init,
    fini,
    update,
} satisfies UserModule;

const IMG_SELECTOR = ".content-container .lazy-img-wrapper img" as const;
const IMG_CARD_SELECTOR = ".image-card-wrapper";
const evproxy = new EventProxy();

function init() {
    evproxy.on(
        document,
        "click",
        async (e) => {
            const img = (e.target as Element).closest<HTMLImageElement>(IMG_SELECTOR);
            if (_.isNil(img)) return;
            e.preventDefault();
            e.stopPropagation();

            const imgCard = findParent(img, IMG_CARD_SELECTOR, "selector");
            if (_.isNil(imgCard)) return;

            if (_.isNil(imgCard.dataset.srcList)) {
                const srcList = dom<"img">("img", imgCard, []).map((el) => el.src);
                imgCard.dataset.srcList = JSON.stringify(srcList);
            }
            const srcList: string[] = JSON.parse(imgCard.dataset.srcList);

            if (_.isNil(img.dataset.index)) {
                img.dataset.index = srcList.indexOf(img.src).toString();
            }

            imagesViewer({
                content: srcList,
                defaultIndex: +(img.dataset.index ?? 0),
            });
        },
        { capture: true },
    );
}

function fini() {
    evproxy.release();
}

function update() {
    fini();
    init();
}

// function getTid(): Maybe<number> {
//     const newTid = location.pathname.match(/^\/p\/(\d+)/)?.[1];
//     return newTid ? +newTid : VOID;
// }
