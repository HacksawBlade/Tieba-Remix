import { dom } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";
import { Owner, OwnerProfile } from "@/lib/user-values";
import _ from "lodash";

export default {
    namespace: "portal",
    title: "传送门",
    contributors: [{ name: Owner, url: OwnerProfile }],
    version: "1.1.1",
    brief: "为贴子中的b站番号添加跳转链接",
    description: `该模块可以识别贴子中的 av/BV 号并将其转换为超链接`,
    scope: ["thread"],
    runAt: "immediately",
    compatibility: "legacy",
    init,
} satisfies UserModule;

function init(): void {
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
            _.forEach(dom(selector, []), (elem) => {
                if (elem.classList.contains(LINKED_CLASS)) {
                    return;
                }
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

                function bindingLinks(array: Maybe<RegExpMatchArray>, lowerCase = false) {
                    if (!array) {
                        return;
                    }

                    const hadHyperLink: string[] = [];
                    _.forEach(array, (videoID) => {
                        if (hadHyperLink.indexOf(videoID) === -1) {
                            hadHyperLink.push(videoID);
                            const htmlArray = elem.innerHTML.split(
                                RegExp(`(?<!://www.bilibili.com/video/)${videoID}`, "g"),
                            );
                            if (lowerCase) {
                                videoID = videoID.toLowerCase();
                            }
                            const linkedID = `<a href='https://www.bilibili.com/video/${
                                videoID
                            }' target='_blank'>${videoID}</a>`;
                            elem.innerHTML = htmlArray.join(linkedID);
                        }
                    });
                }
            });
        }
    }
}
