import type { UserModuleEx } from "@/ex";
import { currentPageType } from "@/lib/api/remixed";
import { dom } from "@/lib/elemental";
import { Owner, OwnerProfile, UserKey } from "@/lib/user-values";
import { asyncdom } from "libelemental";
import type { UserSelectItem } from "user-view";

/** 帖子排序行为 */
type ThreadOrder = "popular" | "ascend" | "descend";
/** 帖子过滤偏好：全部；只看楼主； */
type ThreadPrefer = "all" | "lzOnly";
/** 吧内排序行为 */
type ForumOrder = "featured" | "popular" | "latest" | "QA";
/** 吧内二层排序偏好：回复时间；发布时间； */
type ForumPrefer = "reply" | "publish";
const threadOrder = new UserKey<ThreadOrder>("threadOrder", "ascend", {
    setter: applyThreadOrder,
});
const threadPrefer = new UserKey<ThreadPrefer>("threadPrefer", "all", {
    setter: applyThreadPrefer,
});
const forumOrder = new UserKey<ForumOrder>("forumOrder", "latest", {
    setter: applyForumOrder,
});
const forumPrefer = new UserKey<ForumPrefer>("forumPrefer", "reply", {
    setter: applyForumPrefer,
});

export default {
    namespace: "orderly",
    title: "排序偏好",
    version: "1.0.0",
    contributors: [{ name: Owner, url: OwnerProfile }],
    brief: "记住你的浏览排序偏好",
    description:
        "在帖子和进吧页面上自动按你保存的习惯设置排序方式和浏览模式，免去每次手动切换。",
    scope: ["thread", "forum"],
    runAt: "idle",
    compatibility: "current",
    init,
    settings: {
        sortThread: {
            title: "帖子",
            widgets: [
                {
                    type: "select",
                    content: [
                        { text: "热门", value: "popular" },
                        { text: "正序", value: "ascend" },
                        { text: "倒序", value: "descend" },
                    ] satisfies UserSelectItem<ThreadOrder>[],
                    init: () => threadOrder.get(),
                    event: (e: ThreadOrder) => {
                        threadOrder.set(e);
                    },
                },
                {
                    type: "select",
                    content: [
                        { text: "全部回复", value: "all" },
                        { text: "只看楼主", value: "lzOnly" },
                    ] satisfies UserSelectItem<ThreadPrefer>[],
                    init: () => threadPrefer.get(),
                    event: (e: ThreadPrefer) => {
                        threadPrefer.set(e);
                    },
                },
            ],
        },
        sortForum: {
            title: "吧",
            widgets: [
                {
                    type: "select",
                    content: [
                        { text: "精华", value: "featured" },
                        { text: "热门", value: "popular" },
                        { text: "最新", value: "latest" },
                        { text: "互助", value: "QA" },
                    ] satisfies UserSelectItem<ForumOrder>[],
                    init: () => forumOrder.get(),
                    event: (e: ForumOrder) => {
                        forumOrder.set(e);
                    },
                },
                {
                    type: "select",
                    content: [
                        { text: "回复时间优先", value: "reply" },
                        { text: "发布时间优先", value: "publish" },
                    ] satisfies UserSelectItem<ForumPrefer>[],
                    init: () => forumPrefer.get(),
                    event: (e: ForumPrefer) => {
                        forumPrefer.set(e);
                    },
                },
            ],
        },
    },
} satisfies UserModuleEx;

function init() {
    const ctx: Partial<Record<PageType, [() => void, () => void]>> = {
        "thread": [applyThreadOrder, applyThreadPrefer],
        "forum": [applyForumOrder, applyForumPrefer],
    };
    const hook = ctx[currentPageType()];
    if (hook) {
        hook[0]();
        hook[1]();
    }
}

function applyThreadOrder() {
    applyImpl(
        {
            popular: "热门",
            ascend: "正序",
            descend: "倒序",
        } satisfies Record<ThreadOrder, string>,
        ".sub-tab-item",
        threadOrder.get(),
    );
}

function applyThreadPrefer() {
    const preferMap: Record<ThreadPrefer, Maybe<HTMLDivElement>> = {
        all: dom<"div">("[id^='tab-全部回复']"),
        lzOnly: dom<"div">("#tab-只看楼主"),
    };
    const target = preferMap[threadPrefer.get()];
    if (target && !target.classList.contains("active"))
        (target as HTMLDivElement).click();
}

function applyForumOrder() {
    applyImpl(
        {
            featured: "精华",
            popular: "热门",
            latest: "最新",
            QA: "互助",
        } satisfies Record<ForumOrder, string>,
        ".tab-item",
        forumOrder.get(),
    );
}

function applyForumPrefer() {
    applyImpl(
        {
            reply: "回复",
            publish: "发布",
        } satisfies Record<ForumPrefer, string>,
        ".sub-menu-container .menu-item",
        forumPrefer.get(),
    );
}

async function applyImpl(map: Record<string, string>, selector: string, key: string) {
    await asyncdom(selector, void 0, 1000);
    const items = dom(selector, []);
    for (const item of items) {
        if (item.textContent?.includes(map[key])) {
            if (!item.classList.contains("active")) (item as HTMLDivElement).click();
            break;
        }
    }
}
