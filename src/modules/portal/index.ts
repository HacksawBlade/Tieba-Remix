import { dom } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";
import { forEach } from "lodash-es";

export default {
    id: "portal",
    name: "传送门",
    author: "锯条",
    version: "1.1.1",
    brief: "为贴子中的b站番号添加跳转链接",
    description: `该模块可以识别贴子中的 av/BV 号并将其转换为超链接`,
    scope: ["thread"],
    runAt: "immediately",
    entry: main,
} as UserModule;

function main(): void {
    const LINKED_CLASS = "linked";
    const avRegExp = /(?<!:\/\/www.bilibili.com\/video\/)av[1-9]\d*/gi;
    const BVRegExp = /(?<!:\/\/www.bilibili.com\/video\/)BV[A-Za-z0-9]{10}/g;

    document.addEventListener("DOMContentLoaded", () => {
        threadCommentsObserver.addEvent(biliPortal);
    });

    /* av/BV 快速跳转 */
    function biliPortal() {
        addBiliLinks(".d_post_content");
        addBiliLinks(".lzl_cnt .lzl_content_main");

        function addBiliLinks(selector: string): void {
            forEach(dom(selector, []), (elem) => {
                if (elem.classList.contains(LINKED_CLASS)) return;
                elem.classList.add(LINKED_CLASS);

                // av号
                if (elem.textContent?.toLowerCase().indexOf("av") !== -1) {
                    const avs = elem.textContent?.match(avRegExp);
                    bindingLinks(avs ?? undefined, true);
                }

                // BV号
                if (elem.textContent?.indexOf("BV") !== -1) {
                    const BVs = elem.textContent?.match(BVRegExp);
                    bindingLinks(BVs ?? undefined);
                }

                function bindingLinks(
                    array: Maybe<RegExpMatchArray>,
                    lowerCase = false
                ) {
                    if (!array) return;

                    const hadHyperLink: string[] = [];
                    forEach(array, (videoID) => {
                        if (hadHyperLink.indexOf(videoID) === -1) {
                            hadHyperLink.push(videoID);
                            const htmlArray = elem.innerHTML.split(
                                RegExp(`(?<!://www.bilibili.com/video/)${videoID}`, "g")
                            );
                            if (lowerCase) videoID = videoID.toLowerCase();
                            const linkedID =
                                `<a href='https://www.bilibili.com/video/${videoID
                                }' target='_blank'>${videoID
                                }</a>`;
                            elem.innerHTML = htmlArray.join(linkedID);
                        }
                    });
                }
            });
        }
    }
}
