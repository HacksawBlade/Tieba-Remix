import { floatMessage } from "@/components/float-message";
import Pager from "@/components/pager.vue";
import ThreadEditor from "@/components/thread-editor.vue";
import TogglePanel, { TogglePanelProps } from "@/components/toggle-panel.vue";
import UserButton from "@/components/utils/user-button.vue";
import { currentPageType } from "@/lib/api/remixed";
import { levelToClass } from "@/lib/api/tieba";
import { asyncdom, dom, domrd } from "@/lib/elemental";
import { CSSRule, overwriteCSS, parseCSSRule } from "@/lib/elemental/styles";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { renderDialog } from "@/lib/render";
import { appendJSX, insertJSX } from "@/lib/render/jsx-extension";
import { floatBar } from "@/lib/tieba-components/float-bar";
import { pager } from "@/lib/tieba-components/pager";
import { compactLayout, experimental, pageExtension, perfProfile } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import _ from "lodash";
import { VNode } from "vue";
import commentsStyle from "./comments.scss?inline";
import compactStyle from "./compact.scss?inline";
import { threadParser } from "./parser";
import threadStyle from "./thread.scss?inline";

export default async function () {
    if (!pageExtension.get().thread) return;
    if (currentPageType() !== "thread") return;

    overwriteCSS(
        threadStyle,
        compactStyle,
        commentsStyle,
    );

    await waitUntil(() => !_.isNil(document.body)).then(function () {
        // document.body.insertBefore(mainWrapper, document.body.firstChild);
        if (compactLayout.get()) {
            document.body.toggleAttribute("compact-layout");
        }
    });

    waitUntil(() => !_.isNil(floatBar.get())).then(function () {
        floatBar.add("other", function () {
            renderDialog<TogglePanelProps>(TogglePanel, {
                toggles: [
                    {
                        icon: "favorite",
                        name: "收藏",
                        defaultValue: (function () {
                            return dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.innerText === "收藏" ? false : true;
                        })(),
                        event() {
                            dom<"a">(".j_favor, #j_favthread .p_favthr_main")?.click();
                        },
                    },
                    {
                        icon: "face_6",
                        name: "只看楼主",
                        defaultValue: (function () {
                            return dom<"a">("#lzonly_cntn")?.innerText === "只看楼主" ? false : true;
                        })(),
                        event() {
                            dom<"a">("#lzonly_cntn")?.click();
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

        document.body.insertBefore(domrd("div", {
            class: "vue-module-control",
            style: "display: none;",
        }), document.body.firstChild);
    });

    const content = await asyncdom<"div">(".content");
    const pbContent = await asyncdom<"div">("#pb_content");

    if (perfProfile.get() === "performance" && experimental.get().moreBlurEffect) {
        pbContent.classList.add("blur-effect");
        pbContent.style.backgroundColor = "var(--trans-default-background)";
    }

    createContents();
    async function createContents() {
        const threadList = await asyncdom("#j_p_postlist");
        threadList.classList.add("content-wrapper");

        let thread = threadParser();

        const forumIconLink = (thread.forum.components.iconContainer.children[0] as HTMLImageElement).src;  // 分辨率比从 PageData 中获取到的更高

        insertJSX(
            <div id="title-wrapper">
                <h3 class="thread-title">{_.unescape(PageData.thread.title)}</h3>

                <UserButton class="forum-wrapper-button" noBorder>
                    <img class="forum-icon" src={forumIconLink} alt="" />
                    <a class="forum-name" href={`/f?kw=${PageData.forum.name_url}`} target="_blank">{PageData.forum.forum_name} 吧</a>

                    <div class="button-container">
                        <UserButton
                            class="icon forum-button add-forum-button"
                            noBorder>
                            {PageData.user.is_like ? "check" : "add"}
                        </UserButton>
                    </div>
                </UserButton>
            </div>, content, pbContent);

        // 绑定事件
        floatMessage({
            target: await asyncdom<"button">(".forum-wrapper-button"),
            content: `关注 ${PageData.forum.member_count}, 帖子 ${PageData.forum.post_num}`,
        });
        dom(".add-forum-button")?.addEventListener("click", function () {
            dom<"button">("#j_head_focus_btn")?.click();
        });
        dom<"button">(".sign-in-button")?.addEventListener("click", function () {
            dom<"button">(".j_signbtn")?.click();
        });

        // 楼层举报按钮相关
        // 楼层举报按钮的文本只在刷新帖子时才会出现，翻页时不会出现
        // 缺少文本时手动插入
        // 由于一些动态加载行为，在 DOMContentLoaded 后判断举报按钮中的文字节点是否存在更为妥当
        document.addEventListener("DOMContentLoaded", function () {
            threadFloorsObserver.addEvent(function () {
                _.forEach(dom<"a">(".j_jb_ele a", []), el => {
                    if (el.lastChild?.nodeType !== Node.TEXT_NODE) {
                        el.appendChild(new Text("举报"));
                    }
                });
            });
        }, { once: true });

        threadFloorsObserver.addEvent(function () {
            if (dom(".d_author", []).length === 0) return;

            // TODO: performance
            thread = threadParser();
            _.forEach(dom(".d_post_content_main", threadList, []), (floor, i) => {
                const authorContainer = createAuthorContainer(i);
                floor.insertBefore(authorContainer, floor.firstChild);
            });

            // 去除左侧用户栏
            _.forEach(dom(".d_author", []), el => el.remove());
        });

        function createAuthorContainer(index: number) {
            const authorContainer = domrd("div", {
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
                </div>, badgeContainer.root);

            if (thread.cotents[index].isLouzhu)
                appendJSX(<div class="floor-badge">楼主</div>, badgeContainer.root);

            return authorContainer;
        }

        // 头像 lazy load
        const avatarObserver = new IntersectionObserver(function (entries, observer) {
            _.forEach(entries, function (entry) {
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

        _.forEach(thread.cotents, content => {
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
            _.forEach(dom(".lzl_cnt", []), el => {
                _.forEach(el.childNodes, node => {
                    if (node)
                        node.nodeType === 3 ? node.remove() : undefined;
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
        const { vnode: pagerVNode } = insertJSX(createPager(additionalStyles), parent, position ?? undefined);
        pagerVNodes.push(pagerVNode);

        function createPager(additionalStyles?: CSSRule) {
            const pagerComponent =
                <Pager
                    total={PageData.pager.total_page}
                    current={PageData.pager.cur_page}
                    showPagers={PageData.pager.total_page > 1}
                    pagerChange={function (page) {
                        pager.jumpTo(page);
                        _.forEach(pagerVNodes, pagerVNode => {
                            // @ts-ignore
                            pagerVNode.component.exposeProxy.current = page;
                        });
                    }}
                    style={parseCSSRule({
                        width: "100%",
                        padding: "0",
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
        right: PageData.pager.total_page <= 1 ? "48px" : "",
    });

    createTextbox();
    async function createTextbox() {
        await waitUntil(() => !_.isNil(floatBar.get()));
        await waitUntil(() => !_.isNil(dom("#ueditor_replace")));

        if (!_.some(floatBar.buttons(), { type: "post" })) {
            floatBar.add("post", showEditor, undefined, undefined, 2);
        }

        const postButton = _.find(floatBar.buttons(), button => {
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
            </div>, pbContent);

        function showEditor() {
            const ueditor = (function () {
                if (dom(".edui-container", []).length > 0)
                    return dom(".edui-container");
                return dom("#ueditor_replace");
            })();
            if (ueditor) {
                renderDialog(<ThreadEditor ueditor={ueditor} type={"reply"} />);
            }
        }
    }
}
