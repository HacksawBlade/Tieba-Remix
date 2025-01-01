import { SettingContent } from "@/components/settings.vue";
import { UserModuleEx } from "@/ex";
import { tiebaAPI } from "@/lib/api/tieba";
import { DOMS, findParent } from "@/lib/elemental";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { UserKey } from "@/lib/user-values";
import { forEach } from "lodash-es";

export default {
    id: "toolkit",
    name: "实用工具库",
    author: "锯条",
    version: "1.1",
    brief: "优化原版贴吧体验的一组功能",
    description: "这是一个轻量级的工具库，包含了诸如自动展开长图等实用功能。",
    scope: true,
    runAt: "immediately",
    settings: {
        autoExpand: {
            title: "自动展开长图",
            description:
                `该功能会自动将帖子中所有的长图片自动展开，无需手动操作`,
            widgets: [{
                type: "toggle",
                init: () => toolkitToogles.get().autoExpand,
                event() {
                    toolkitToogles.merge({ autoExpand: !toolkitToogles.get().autoExpand });
                },
            }],
        },

        reloadAvatars: {
            title: "重新加载错误头像",
            description: `原版贴吧的帖子页面时常会出现加载失败的头像，本功能可以将这些无法正常显示的头像资源链接到正常的 URL`,
            widgets: [{
                type: "toggle",
                init: () => toolkitToogles.get().reloadAvatars,
                event() {
                    toolkitToogles.merge({ reloadAvatars: !toolkitToogles.get().reloadAvatars });
                },
            }],
        },
    } as Record<keyof typeof toolkitFeatures, SettingContent>,
    entry: function () {
        for (const key in toolkitFeatures) {
            const k = key as keyof typeof toolkitFeatures;
            if (toolkitToogles.get()[k]) toolkitFeatures[k]();
        }
    },
} as UserModuleEx;

const toolkitFeatures = {
    /** 自动展开长图 */
    autoExpand() {
        threadFloorsObserver.addEvent(() => {
            forEach(DOMS(".replace_tip"), (el) => {
                (el as HTMLDivElement).click();
            });
        });
    },

    /** 重新加载错误头像 */
    reloadAvatars() {
        const observer = new IntersectionObserver(function (entries) {
            forEach(entries, entry => {
                if (entry.isIntersecting) {
                    const avatar = entry.target as HTMLImageElement;
                    if (!avatar.complete) return;
                    if (avatar.naturalWidth > 0) {
                        avatar.setAttribute("data-loaded", "");
                    } else {
                        const userCard = findParent<"li">(avatar, "j_user_card");
                        if (!userCard) return;
                        const dataField = userCard.getAttribute("data-field");
                        if (!dataField) return;
                        const portarit = JSON.parse(dataField.replaceAll(/'/g, '"')).id;
                        avatar.src = tiebaAPI.URL_profile(portarit);
                        avatar.setAttribute("data-loaded", "");
                    }
                }
            });
        }, { threshold: 0 });

        threadCommentsObserver.addEvent(function () {
            const avatars = DOMS(".lzl_single_post img:not(.BDE_Smiley, [data-loaded])", "img");
            avatars.forEach(avatar => observer.observe(avatar));
        });
    },
};

type ToolkitToogles = Record<keyof typeof toolkitFeatures, boolean>;

const toolkitToogles = new UserKey<ToolkitToogles>("toolkitToogles", {
    autoExpand: true,
    reloadAvatars: true,
});
