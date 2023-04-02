import { remixedObservers } from "@/lib/observers";
import { DOMS, createNewElement, findParentByClass, injectCSSList } from "@/lib/domlib";
import tagCSS from "./stylesheet.css?inline";
import { forEach, indexOf, split } from "lodash-es";

"use strict";

export const Main: UserModule = {
    id: "tieba-tags",
    name: "楼中楼标签",
    author: "锯刃Blade",
    version: "2.0",
    brief: "优化楼中楼浏览体验",
    description: `为楼中楼的楼主、层主等用户添加特殊标签`,
    scope: "/p/",
    runAt: "loaded",
    entry: main
};

function main(): void {
    const TAGGED = "is-tagged";
    const TB_TAG = "tag-elem";
    const MY_TAG = "tieba-tags-me";
    const LZ_TAG = "tieba-tags-lz";
    const CZ_TAG = "tieba-tags-cz";

    const louzhu = PageData.thread.author;
    const myPortrait = PageData.user.portrait;
    const myUserName = PageData.user.user_name;

    let louzhuPortrait = getLouzhuPortrait(document);

    injectCSSList(tagCSS);

    // 预处理
    (async () => {
        if (!louzhuPortrait) {
            const response = await fetch(location.href.split("?")[0], {
                mode: "cors",
                credentials: "include"
            });

            if (response.ok) {
                await response.text().then((value) => {
                    const fpDOC = new DOMParser().parseFromString(value, "text/html");
                    louzhuPortrait = getLouzhuPortrait(fpDOC);
                });
            }
        }
    })().then(() => {
        // 开启监控
        remixedObservers.commentsObserver.addEvent(createTagsAll);
    });

    function getLouzhuPortrait(doc: Document): string | undefined {
        const j_tags = doc.getElementsByClassName("j_louzhubiaoshi");
        if (j_tags.length > 0) {
            const targetFloor = findParentByClass(j_tags[0], "l_post_bright");
            if (targetFloor) {
                const dataAttr = targetFloor.getAttribute("data-field");
                if (dataAttr !== null) {
                    const dataField = JSON.parse(dataAttr);
                    return split(dataField.author.portrait, "?")[0];
                }
            }
        }
        return undefined;
    }

    function createTagsAll() {
        forEach(DOMS(".lzl_cnt .at"), elem => {
            if (elem.classList.contains(TAGGED)) return;
            elem.classList.add(TAGGED);

            let isLouzhu = false;
            // let isCengzhu = false;
            let isMe = false;

            const username = elem.getAttribute("username");

            // 自己
            if (userClassify(myUserName, myPortrait)) {
                isMe = true;
                addTag(elem, MY_TAG);
            }

            // 楼主，如果我是楼主则不显示楼主层主
            if (!isMe) {
                if (userClassify(louzhu, louzhuPortrait)) {
                    isLouzhu = true;
                    addTag(elem, LZ_TAG);
                }
            }

            // 层主，如果我/楼主是层主则不显示
            if (!isMe && !isLouzhu) {
                const floor = findParentByClass(elem, "l_post_bright");
                if (floor !== null) {
                    const cengzhuCard = floor.getElementsByClassName("p_author_name")[0];
                    const cengzhu = cengzhuCard.textContent;

                    if (cengzhu) {
                        if (elem.textContent === cengzhu) {
                            // isCengzhu = true;
                            addTag(elem, CZ_TAG);
                        }
                    }
                }
            }

            function userClassify(un: string, portrait?: string): boolean {
                if (username === un) {
                    return true;
                } else if (indexOf(["", " "], username) !== -1) {
                    // 无法正常获取到 username 和 dataField
                    const targetPortrait = elem.getAttribute("portrait");
                    if (targetPortrait !== null && portrait) {
                        if (targetPortrait === portrait) {
                            return true;
                        }
                    }
                } else if (username === null) {
                    const dataAttr = elem.getAttribute("data-field");
                    if (dataAttr !== null) {
                        const dataField = JSON.parse(dataAttr);
                        if (portrait) {
                            if (dataField.id === portrait) {
                                return true;
                            }
                        } else {
                            if (dataField.un === un) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        });

        function addTag(elem: HTMLElement, className: string) {
            elem.appendChild(createNewElement("div", {
                class: TB_TAG + " " + className
            }));
        }
    }
}
