import { UserModuleExtended } from "@/global.module";
import { DOMS } from "@/lib/elemental";
import { TbObserver, remixedObservers } from "@/lib/observers";
import { join, map } from "lodash-es";
import { markRaw } from "vue";
import moduleShieldVue from "./module.shield.vue";
import { ShieldObject, shieldList } from "./shield";

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
} as UserModuleExtended;

/**
 * 匹配字符串是否和屏蔽对象规则符合
 * @param obj 屏蔽对象
 * @param str 需要匹配的字符串
 * @returns 是否匹配成功
 */
function matchShield(obj: ShieldObject, str: string): boolean {
    // 可选参数
    if (obj.ignoreCase === undefined) obj.ignoreCase = true;

    // 字符串
    if (obj.type === "string") {
        // 忽略大小写，先转为小写
        if (obj.ignoreCase) {
            obj.rule = obj.rule.toLowerCase();
            str = str.toLowerCase();
        }

        if (str.indexOf(obj.rule) !== -1) {
            return true;
        }
    }

    // 正则
    if (obj.type === "regex") {
        let regex: RegExp;

        // 忽略大小写
        if (obj.ignoreCase) {
            regex = new RegExp(obj.rule, "i");
        } else {
            regex = new RegExp(obj.rule);
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
function shieldElementsBySelector(
    observer: TbObserver,
    parentSelector: string,
    subSelector: string
) {
    observer.addEvent(() => {
        DOMS(parentSelector).forEach(elem => {
            let isMatch = false;
            const content = join(map(DOMS(subSelector, elem), el => el.textContent ?? ""), "\n");

            for (const sh of shieldList.get()) {
                if (matchShield(sh, content)) {
                    isMatch = true;
                    break;
                }
            }

            if (isMatch) {
                elem.style.display = "none";
            }
        });
    });
}

function main() {
    // 看贴页面
    shieldElementsBySelector(remixedObservers.postsObserver, ".l_post_bright", ".d_post_content");
    shieldElementsBySelector(remixedObservers.postsObserver, ".l_post_bright", ".d_name a");
    shieldElementsBySelector(remixedObservers.commentsObserver, ".lzl_single_post", ".lzl_cnt .j_user_card");
    // 首页动态
    shieldElementsBySelector(remixedObservers.newListObserver, ".j_feed_li", ".title, .n_txt");
    shieldElementsBySelector(remixedObservers.newListObserver, ".j_feed_li", ".post_author");
    // 进吧页面
    shieldElementsBySelector(remixedObservers.threadListObserver, ".j_thread_list", ".threadlist_title a");
    shieldElementsBySelector(remixedObservers.threadListObserver, ".j_thread_list", ".frs-author-name-wrap");
}
