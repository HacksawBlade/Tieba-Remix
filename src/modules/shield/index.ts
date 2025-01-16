import { UserModuleEx } from "@/ex";
import { dom } from "@/lib/elemental";
import { TbObserver, forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { join, map } from "lodash-es";
import { markRaw } from "vue";
import moduleShieldVue from "./module.shield.vue";
import { ShieldRule, matchShield, shieldList } from "./shield";

export default {
    id: "shield",
    name: "贴吧屏蔽",
    author: "锯条",
    version: "1.2",
    brief: "眼不见为净",
    description: `用户自定义屏蔽规则，符合规则的贴子和楼层将不会显示在首页、看贴页面和进吧页面。支持正则匹配`,
    scope: true,
    runAt: "immediately",
    settings: {
        "shield-controls": {
            title: "管理屏蔽规则",
            description:
                `这些屏蔽规则将会在首页、看贴页面生效，会自动隐藏所有符合匹配规则的贴子和楼层。`,
            widgets: [{
                type: "component",
                component: markRaw(moduleShieldVue),
            }],
        },
    },
    entry: main,
} as UserModuleEx;

export * from "./shield";

/**
 * 通过选择器屏蔽元素
 * @param observer 监控
 * @param parentSelector 父元素选择器
 * @param subSelector 子元素选择器
 */
function shieldBySelector(
    observer: TbObserver,
    scope: ShieldRule["scope"],
    parentSelector: string,
    subSelector: string
) {
    observer.addEvent(() => {
        dom(parentSelector, []).forEach(elem => {
            let isMatch = false;
            const content = join(map(dom(subSelector, elem, []), el => el.textContent ?? ""), "\n");

            for (const rule of shieldList.get()) {
                if (matchShield(rule, content, scope)) {
                    isMatch = true;
                    break;
                }
            }

            if (isMatch) {
                (elem as HTMLElement).style.display = "none";
            }
        });
    });
}

function main() {
    // 看贴页面
    shieldBySelector(threadFloorsObserver, "posts", ".l_post_bright", ".d_post_content");
    shieldBySelector(threadFloorsObserver, "users", ".l_post_bright", ".d_name a");
    shieldBySelector(threadFloorsObserver, "users", ".l_post_bright", ".p_author_name");
    shieldBySelector(threadCommentsObserver, "users", ".lzl_single_post", ".lzl_cnt .j_user_card");
    // 首页动态
    shieldBySelector(legacyIndexFeedsObserver, "posts", ".j_feed_li", ".title, .n_txt");
    shieldBySelector(legacyIndexFeedsObserver, "users", ".j_feed_li", ".post_author");
    // 进吧页面
    shieldBySelector(forumThreadsObserver, "posts", ".j_thread_list", ".threadlist_title a");
    shieldBySelector(forumThreadsObserver, "users", ".j_thread_list", ".frs-author-name-wrap");
}
