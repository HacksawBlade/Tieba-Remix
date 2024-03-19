import Pager from "@/components/pager.vue";
import ThreadEditor, { ThreadEditorProps } from "@/components/thread-editor.vue";
import TogglePanel, { TogglePanelProps } from "@/components/toggle-panel.vue";
import UserButton from "@/components/utils/user-button.vue";
import { currentPageType } from "@/lib/api/remixed";
import { levelToClass } from "@/lib/api/tieba";
import { DOMS, templateCreate } from "@/lib/elemental";
import { CSSRule, injectCSSList, parseCSSRule } from "@/lib/elemental/styles";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { renderDialog } from "@/lib/render";
import { appendJSX, insertJSX } from "@/lib/render/jsx-extension";
import { bindFloatMessage } from "@/lib/render/universal";
import { floatBar } from "@/lib/tieba-components/float-bar";
import { pager } from "@/lib/tieba-components/pager";
import { compactLayout, pageExtension } from "@/lib/user-values";
import { waitUtil } from "@/lib/utils";
import { find, forEach, some } from "lodash-es";
import { VNode } from "vue";
import compactCSS from "./compact.scss?inline";
import { threadParser } from "./parser";
import threadCSS from "./thread.scss?inline";

export default async function () {
    if (!pageExtension.get().thread) return;
    if (currentPageType() !== "thread") return;

    injectCSSList(threadCSS);
    injectCSSList(compactCSS);

    await waitUtil(() => document.body !== undefined).then(function () {
        // document.body.insertBefore(mainWrapper, document.body.firstChild);
        if (compactLayout.get()) {
            document.body.toggleAttribute("compact-layout");
        }
    });

    waitUtil(() => floatBar.get() !== undefined).then(function () {
        floatBar.add("other", function () {
            renderDialog<TogglePanelProps>(TogglePanel, {
                toggles: [
                    {
                        icon: "favorite",
                        name: "收藏",
                        defaultValue: (function () {
                            return DOMS(true, ".j_favor, #j_favthread .p_favthr_main").innerText === "收藏" ? false : true;
                        })(),
                        event() {
                            DOMS(true, ".j_favor, #j_favthread .p_favthr_main").click();
                        },
                    },
                    {
                        icon: "face_6",
                        name: "只看楼主",
                        defaultValue: (function () {
                            return DOMS(true, "#lzonly_cntn").innerText === "只看楼主" ? false : true;
                        })(),
                        event() {
                            DOMS(true, "#lzonly_cntn").click();
                        },
                    },
                    {
                        icon: "compare_arrows",
                        name: "紧凑布局",
                        defaultValue: (() => compactLayout.get())(),
                        event() {
                            document.body.toggleAttribute("compact-layout");
                            compactLayout.set(!compactLayout.get());
                        },
                    },
                ],
            });
        }, "module-settings", "menu");

        document.body.insertBefore(templateCreate("div", {
            class: "vue-module-control",
            style: "display: none;",
        }), document.body.firstChild);
    });

    const content = DOMS(true, ".content", "div");
    const pbContent = DOMS(true, "#pb_content", "div");

    createContents();
    async function createContents() {
        const threadList = (await waitUtil(() => DOMS("#j_p_postlist").length > 0).then(() => DOMS(true, "#j_p_postlist")));

        threadList.classList.add("content-wrapper");

        let thread = threadParser();

        const forumIconLink = (thread.forum.components.iconContainer.children[0] as HTMLImageElement).src;  // 分辨率比从 PageData 中获取到的更高

        insertJSX(
            <div id="title-wrapper" class="title-wrapper">
                <h3 class="thread-title">{PageData.thread.title}</h3>

                <UserButton class="forum-wrapper-button" noBorder>
                    <img class="forum-icon" src={forumIconLink} alt="" />
                    <a class="forum-name" href={`/f?kw=${PageData.forum.name_url}`} target="_blank">{PageData.forum.forum_name} 吧</a>

                    <div class="button-container">
                        <UserButton class="icon forum-button add-forum-button" noBorder>{PageData.user.is_like ? "check" : "add"}</UserButton>
                        {/* {PageData.user.is_like ? <UserButton class="outline-icon forum-button sign-in-button" shadow-border>{PageData.is_sign_in ? "assignment_turned_in" : "assignment"}</UserButton> : null} */}
                    </div>
                </UserButton>
            </div>, DOMS(true, ".content"), DOMS(true, "#pb_content"));

        // 绑定事件
        bindFloatMessage(DOMS(true, ".forum-wrapper-button"),
            `关注 ${PageData.forum.member_count}，帖子 ${PageData.forum.post_num}`);
        DOMS(true, ".add-forum-button", "button").addEventListener("click", function () {
            DOMS(true, "#j_head_focus_btn", "button").click();
        });
        DOMS(true, ".sign-in-button", "button")?.addEventListener("click", function () {
            DOMS(true, ".j_signbtn", "button").click();
        });

        threadFloorsObserver.addEvent(function () {
            if (DOMS(".d_author").length === 0) return;

            // TODO: performance
            thread = threadParser();
            forEach(DOMS(".d_post_content_main", "div", threadList), (floor, i) => {
                const authorContainer = createAuthorContainer(i);
                floor.insertBefore(authorContainer, floor.firstChild);
            });

            // 去除左侧用户栏
            forEach(DOMS(".d_author"), el => el.remove());
        });

        function createAuthorContainer(index: number) {
            const authorContainer = templateCreate("div", {
                class: "author-container",
            });

            thread.cotents[index].profile.nameAnchor.classList.add("anchor");

            authorContainer.appendChild(thread.cotents[index].profile.avatar);
            authorContainer.appendChild(thread.cotents[index].profile.nameAnchor);

            const badgeContainer = appendJSX<HTMLDivElement>(<div class="badge-container"></div>, authorContainer);

            appendJSX(
                <div class={`floor-badge level-${levelToClass(thread.cotents[index].profile.level)}`}>
                    <div class="badge-level">{thread.cotents[index].profile.level}</div>
                    <div class="badge-title">{thread.cotents[index].profile.badgeTitle}</div>
                </div>, badgeContainer.el);

            if (thread.cotents[index].isLouzhu)
                appendJSX(<div class="floor-badge">楼主</div>, badgeContainer.el);

            return authorContainer;
        }

        // 头像 lazy load
        const avatarObserver = new IntersectionObserver(function (entries, observer) {
            forEach(entries, function (entry) {
                if (entry.isIntersecting) {
                    const avatar = entry.target.children[0] as HTMLImageElement;
                    const lazyLink = avatar.getAttribute("data-tb-lazyload");

                    if (avatar.src !== lazyLink) {
                        if (lazyLink)
                            avatar.src = lazyLink;
                        else
                            observer.unobserve(entry.target);
                    } else {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 0.5,
        });

        forEach(thread.cotents, content => {
            avatarObserver.observe(content.profile.avatar);
        });

        // 对于部分吧，无法自动加载楼中楼内容，需要手动激活
        // const lzlObserver = new IntersectionObserver(function (entries, observer) {
        //     forEach(entries, function (entry) {
        //         if (entry.isIntersecting) {
        //             const el = entry.target as HTMLDivElement;
        //             if (el.classList.contains("hideLzl")) {
        //                 el.classList.remove("hideLzl");
        //                 observer.unobserve(el);
        //             }
        //         }
        //     });
        // }, {
        //     root: null,
        //     rootMargin: "0px",
        //     threshold: 0.5,
        // });

        // forEach(DOMS(".l_post"), floorContainer => {
        //     const hidden = DOMS(".hideLzl", "div", floorContainer);
        //     if (hidden.length > 0)
        //         lzlObserver.observe(hidden[0]);
        // });

        // 图片绑定组件
        // remixedObservers.postsObserver.addEvent(function () {
        //     forEach(DOMS(".BDE_Image", "img"), function (el) {
        //         if (!el.classList.contains("image-component")) {
        //             el.classList.add("image-component");
        //             el.onclick = function () {
        //                 renderDialog<ImageViewerProps>(imagesViewerVue, {
        //                     content: el.src,
        //                 });
        //             };
        //         }
        //     });
        // });

        // 去除楼中楼用户发言的冒号
        threadCommentsObserver.addEvent(() => {
            forEach(DOMS(".lzl_cnt"), el => {
                forEach(el.childNodes, node => {
                    if (node)
                        node.nodeType === 3 ? node.remove() : void 0;
                });
            });
        });

        // 开发模式需要重启 observer
        if (import.meta.env.DEV) {
            threadFloorsObserver.observe();
            threadCommentsObserver.observe();
        }
    }

    // pager 相关
    const pagerVNodes: VNode[] = [];
    const insertPager = (parent: Element, position: Node | null, additionalStyles?: CSSRule) => {
        const { vnode: pagerVNode } = insertJSX(createPager(additionalStyles), parent, position);
        pagerVNodes.push(pagerVNode);

        function createPager(additionalStyles?: CSSRule) {
            const pagerComponent =
                <Pager
                    total={PageData.pager.total_page}
                    current={PageData.pager.cur_page}
                    showPagers={PageData.pager.total_page > 1}
                    pagerChange={function (page) {
                        pager.jumpTo(page);
                        forEach(pagerVNodes, pagerVNode => {
                            // @ts-ignore
                            pagerVNode.component.exposeProxy.current = page;
                        });
                    }}
                    style={parseCSSRule({
                        width: "100%",
                        ...additionalStyles,
                    })}>
                    {{
                        tailSlot: () => `回帖 ${PageData.thread.reply_num}`,
                    }}
                </Pager>;
            return pagerComponent;
        }
    };
    insertPager(pbContent, pbContent.firstChild, {
        marginBottom: "24px",
        position: PageData.pager.total_page <= 1 ? "absolute" : "",
        right: PageData.pager.total_page <= 1 ? "24px" : "",
    });

    createTextbox();
    async function createTextbox() {
        await waitUtil(() => floatBar.get() !== undefined);
        await waitUtil(() => DOMS("#ueditor_replace").length > 0);

        if (!some(floatBar.buttons(), { type: "post" })) {
            floatBar.add("post", showEditor, undefined, undefined, 2);
        }

        const postButton = find(floatBar.buttons(), button => {
            return button.type === "post";
        });
        postButton?.el.addEventListener("click", showEditor);

        // 添加末尾帖子回复入口
        insertPager(pbContent, pbContent.lastChild, {
            paddingTop: "24px",
        });
        appendJSX(
            <div id="thread-jsx-components">
                {/* @ts-ignore */}
                <UserButton class="dummy-button" noBorder onClick={showEditor}>回复帖子</UserButton>
            </div>, content);

        function showEditor() {
            const ueditor = (function () {
                if (DOMS(".edui-container").length > 0)
                    return DOMS(true, ".edui-container");
                return DOMS(true, "#ueditor_replace");
            })();
            renderDialog<ThreadEditorProps>(ThreadEditor, {
                ueditor: ueditor,
                type: "reply",
            }, { forced: true, blurEffect: false, darker: true });
        }
    }
}
