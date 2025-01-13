import { UserModuleEx } from "@/ex";
import { dom } from "@/lib/elemental";
import { TbObserver, forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { join, map } from "lodash-es";
import { markRaw } from "vue";
import moduleShieldVue from "./module.shield.vue";
import { ShieldRule, shieldList } from "./shield";

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
                `这些屏蔽规则将会在首页（旧版）、看贴页面生效，会自动隐藏所有符合匹配规则的贴子和楼层。`,
            widgets: [{
                type: "component",
                component: markRaw(moduleShieldVue),
            }],
        },
    },
    entry: main,
} as UserModuleEx;

/**
 * 匹配字符串是否和屏蔽对象规则符合
 * @param rule 屏蔽对象
 * @param str 需要匹配的字符串
 * @param scope 作用域，屏蔽规则作用于内容或用户
 * @returns 是否匹配成功
 */
function matchShield(rule: ShieldRule, str: string, scope: ShieldRule["scope"]): boolean {
    // 作用域不匹配，直接返回
    if (rule.scope !== scope) return false;

    // 可选参数
    if (rule.ignoreCase === undefined) rule.ignoreCase = true;

    // 字符串
    if (rule.type === "string") {
        // 忽略大小写，先转为小写
        if (rule.ignoreCase) {
            rule.content = rule.content.toLowerCase();
            str = str.toLowerCase();
        }

        if (str.indexOf(rule.content) !== -1) {
            return true;
        }
    }

    // 正则
    if (rule.type === "regex") {
        let regex: RegExp;

        // 忽略大小写
        if (rule.ignoreCase) {
            regex = new RegExp(rule.content, "i");
        } else {
            regex = new RegExp(rule.content);
        }

        if (regex.test(str)) {
            return true;
        }
    }

    return false;
}

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
