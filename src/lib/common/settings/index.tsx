import { GM_deleteValue, GM_listValues } from "$";
import { NavBarHideMode } from "@/components/nav-bar.vue";
import { MainSettingKey, SettingContent, SubSettingKey, UserSettings } from "@/components/settings.vue";
import { UserSelectItem } from "@/components/user-select.vue";
import { backupUserConfigs, restoreUserConfigs } from "@/lib/api/remixed";
import { messageBox } from "@/lib/render/message-box";
import { PerfType, UpdateConfig, compactLayout, disabledModules, experimental, monospaceFonts, navBarHideMode, pageExtension, perfProfile, themeType, updateConfig, userFonts, wideScreen } from "@/lib/user-values";
import { AllModules } from "@/lib/utils";
import { forEach, includes, join, once, split } from "lodash-es";
import { markRaw } from "vue";
import AboutDetail from "./setting-widgets/about.detail.vue";
import AboutUpdate from "./setting-widgets/about.update.vue";
import LayoutCustomBack from "./setting-widgets/layout.custom-back.vue";
import ThemeColor from "./setting-widgets/theme.color.vue";

export const getUserSettings = once((): UserSettings => ({
    "visibility": {
        name: "显示",
        icon: "visibility",
        description: "主题、显示设置",
        sub: {
            "theme": {
                name: "主题",
                content: {
                    "switch-theme": {
                        title: "主题偏好设置",
                        description:
                            `在自动模式下，将根据当前系统设置自动选择合适的主题。你也可以手动应用某一种主题。`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "auto", text: "自动", desc: "根据系统设置自动切换主题" },
                                { value: "dark", text: "深色", desc: "使用深色主题" },
                                { value: "light", text: "浅色", desc: "使用浅色主题" },
                            ] as UserSelectItem<ReturnType<typeof themeType.get>>[],
                            init() {
                                return themeType.get();
                            },
                            event(theme: ReturnType<typeof themeType.get>) {
                                themeType.set(theme);
                            },
                        }],
                    },

                    "color": {
                        title: "主题颜色",
                        description:
                            `自定义主题色。由于存在深浅两种主题，需要设置两种主题色。`,
                        widgets: [{
                            type: "component",
                            component: markRaw(ThemeColor),
                        }],
                    },
                },
            },

            "layout": {
                name: "页面布局",
                content: {
                    "compact-layout": {
                        title: "紧凑布局",
                        widgets: [{
                            type: "toggle",
                            content: `在尽量保证视觉观感的请款下，针对部分页面应用更加紧凑的布局，以提高信息密度。当前会受到影响的页面有：新版看贴页面。`,
                            init() {
                                return compactLayout.get();
                            },
                            event() {
                                compactLayout.set(!compactLayout.get());
                                document.body.toggleAttribute("compact-layout");
                                return compactLayout.get();
                            },
                        }],
                    },

                    "custom-background": {
                        title: "自定义背景图",
                        description:
                            `上传图片作为页面背景图`,
                        widgets: [{
                            type: "component",
                            component: markRaw(LayoutCustomBack),
                        }],
                    },

                    "wide-screen-title": {
                        title: "宽屏设置",
                        description:
                            `针对宽屏设备进行配置`,
                        widgets: [
                            {
                                type: "subTitle",
                                content: "强制拉伸画幅",
                            },
                            {
                                type: "toggle",
                                content: `对于宽屏设备，不一定需要页面内容宽度始终等于屏幕宽度。如果你想应用强制宽屏，可以开启此项。`,
                                init() {
                                    return wideScreen.get().noLimit;
                                },
                                event() {
                                    const value = wideScreen.get().noLimit;
                                    wideScreen.merge({
                                        noLimit: !value,
                                    });
                                    return !value;
                                },
                            },
                            {
                                type: "subTitle",
                                content: "最大宽度",
                            },
                            {
                                type: "desc",
                                content:
                                    `配置页面元素跟随屏幕拉伸的最大宽度，若开启了 “强制拉伸画幅” 则此项失效`,
                            },
                            {
                                type: "textbox",
                                placeHolder: "输入最大宽度像素值",
                                init() {
                                    return String(wideScreen.get().maxWidth);
                                },
                                event(e) {
                                    const newValue = (e.target as HTMLInputElement).value;
                                    if (!isNaN(+newValue)) {
                                        wideScreen.merge({
                                            maxWidth: +newValue,
                                        });
                                    }
                                },
                            },
                        ],
                    },
                },
            },

            "page-extension": {
                name: "页面扩展",
                content: {
                    "index": {
                        title: "首页扩展",
                        widgets: [{
                            type: "toggle",
                            content: `首页扩展旨在提供更纯粹的浏览体验，提供管理关注的吧、贴吧热议、瀑布流推送等功能。`,
                            init() {
                                return pageExtension.get().index;
                            },
                            event() {
                                pageExtension.merge({ index: !pageExtension.get().index });
                                return pageExtension.get().index;
                            },
                        }],
                    },

                    "thread": {
                        title: "帖子浏览页面扩展",
                        widgets: [{
                            type: "toggle",
                            content: `使用全新的 UI 简化帖子浏览，并改进屏幕空间利用率。`,
                            init() {
                                return pageExtension.get().thread;
                            },
                            event() {
                                pageExtension.merge({ thread: !pageExtension.get().thread });
                                return pageExtension.get().thread;
                            },
                        }],
                    },
                } as Record<keyof ReturnType<typeof pageExtension.get>, SettingContent>,
            },

            "fonts": {
                name: "字体",
                content: {
                    "code-zh": {
                        title: "主要字体组合",
                        description:
                            `应用在贴吧绝大多数场景的字体组合。`,
                        widgets: [{
                            type: "textarea",
                            placeHolder: "写入字体名，以换行分隔。若需要中英文混排，需将英文字体写在中文字体之前。",
                            init() {
                                return join(userFonts.get(), "\n");
                            },
                            event(e) {
                                userFonts.set(split((e.target as HTMLInputElement).value, "\n"));
                                return join(userFonts.get(), "\n");
                            },
                        }],
                    },

                    "code-monospace": {
                        title: "等宽字体组合",
                        description: `应用在数据显示等场景的等宽字体组合。`,
                        widgets: [{
                            type: "textarea",
                            placeHolder: "写入字体名，以换行分隔。建议在此处写入等宽字体。",
                            init() {
                                return join(monospaceFonts.get(), "\n");
                            },
                            event(e) {
                                monospaceFonts.set(split((e.target as HTMLInputElement).value, "\n"));
                                return join(monospaceFonts.get(), "\n");
                            },
                        }],
                    },
                },
            },

            "nav-bar": {
                name: "导航栏",
                content: {
                    "nav-bar-mode": {
                        title: "导航栏隐藏模式",
                        description:
                            `设置导航栏的隐藏模式。`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "fold", text: "滚动折叠" },
                                { value: "alwaysFold", text: "始终折叠" },
                                { value: "hideWhenScroll", text: "滚动隐藏" },
                                { value: "fixedOnTop", text: "顶部固定" },
                                { value: "never", text: "始终显示" },
                            ] as UserSelectItem<NavBarHideMode>[],
                            init() {
                                return navBarHideMode.get();
                            },
                            event(hideMode: NavBarHideMode) {
                                navBarHideMode.set(hideMode);
                            },
                        }],
                    },
                },
            },
        },
    },

    "modules": {
        name: "模块",
        icon: "deployed_code",
        description: "用户模块管理及部署",
        sub: AllModules().reduce((accu, curr, index) => {
            function toSubSettingKey(module: UserModule): SubSettingKey {
                return {
                    name: module.name,
                    description: module.brief,
                    content: {
                        "module-info": {
                            title: module.name,
                            description:
                                `${module.id} ${module.version}`,
                            widgets: [{
                                type: "toggle",
                                content: module.description,
                                init() {
                                    return includes(disabledModules.get(), module.id) ? false : true;
                                },
                                event() {
                                    if (includes(disabledModules.get(), module.id)) {
                                        const newSet = new Set(disabledModules.get());
                                        newSet.delete(module.id);
                                        disabledModules.set([...newSet]);
                                        return true;
                                    } else {
                                        disabledModules.set([module.id, ...disabledModules.get()]);
                                        return false;
                                    }
                                },
                            }],
                        },

                        ...module.settings,
                    },
                };
            }

            if (index === 1) {
                const accuObject = toSubSettingKey(accu);
                accu = {} as any;
                accu[accuObject.name] = accuObject;
            }

            accu[curr.name] = toSubSettingKey(curr);
            return accu;
        }) as MainSettingKey["sub"],
    },

    "performance": {
        name: "性能",
        icon: "speed",
        description: "硬件性能与流量相关",
        sub: {
            "perfPresets": {
                name: "性能预设",
                content: {
                    "persets": {
                        title: "性能预设",
                        description: "从以下预设性能等级选择其一，将会自动对相关场景进行行为调整。",
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "default", text: "默认" },
                                { value: "saver", text: "节能" },
                                { value: "performance", text: "高性能" },
                            ] as UserSelectItem<PerfType>[],
                            init() {
                                return perfProfile.get();
                            },
                            event(perf: PerfType) {
                                perfProfile.set(perf);
                            },
                        }],
                    },
                },
            },
        },
    },

    "enhanced": {
        name: "高级",
        icon: "labs",
        description: "提前测试一些尚不稳定的新功能",
        sub: {
            "experimental": {
                name: "实验性功能",
                content: {
                    "title": {
                        title: "实验室",
                        description:
                            `本版块列举了一些实验性功能，这些功能正处于开发阶段，它们当中的大部分都是默认关闭的。
                            这些功能可能会产生已知、未知的错误或性能问题，如果这些问题能被更及时全面地反馈，将有助于整个项目的发展。
                            需要注意的是，这些特性并不保证会保留到后续版本中。`,
                        widgets: [{
                            type: "icon",
                            content: "lab_research",
                        }],
                    },

                    "moreBlurEffect": {
                        title: "更多模糊效果",
                        widgets: [{
                            type: "toggle",
                            content: `优先考虑提供更多的模糊效果。仅当性能预设为“高性能”时，才会生效。`,
                            init() {
                                return experimental.get().moreBlurEffect;
                            },
                            event() {
                                experimental.merge({ moreBlurEffect: !experimental.get().moreBlurEffect });
                            },
                        }],
                    },

                    "rasterEffect": {
                        title: "栅格特效",
                        widgets: [{
                            type: "toggle",
                            content: `将部分场景的模糊效果替换为栅格特效。可能会使文字可见度降低。存在性能问题。`,
                            init() {
                                return experimental.get().rasterEffect;
                            },
                            event() {
                                experimental.merge({ rasterEffect: !experimental.get().rasterEffect });
                            },
                        }],
                    },
                } as Record<keyof ReturnType<typeof experimental.get>, SettingContent>,
            },

            "backup-recover": {
                name: "备份与恢复",
                content: {
                    "data-backup": {
                        title: "数据备份",
                        description:
                            `备份脚本所有自定义配置`,
                        widgets: [{
                            type: "button",
                            content: "备份",
                            event() {
                                backupUserConfigs();
                            },
                        }],
                    },

                    "recover-backup": {
                        title: "数据恢复",
                        description:
                            `从备份文件中恢复脚本所有自定义配置`,
                        widgets: [{
                            type: "button",
                            content: "恢复",
                            event() {
                                restoreUserConfigs();
                            },
                        }],
                    },
                },
            },

            "factory-reset": {
                name: "重置所有配置",
                content: {
                    "title": {
                        title: "重置所有配置",
                        description:
                            `如果你需要将脚本的一切配置恢复默认，请使用此功能。`,
                    },

                    "reset": {
                        widgets: [{
                            type: "button",
                            content: "重置",
                            async event() {
                                if (await messageBox({
                                    title: "重置所有配置",
                                    content: "该操作是不可逆的，请做最后一次确认。",
                                    type: "forceTrueFalse",
                                }) === "positive") {
                                    forEach(GM_listValues(), (key) => {
                                        GM_deleteValue(key);
                                    });
                                    location.reload();
                                }
                            },
                        }],
                    },
                },
            },
        },
    },

    "about": {
        name: "关于",
        icon: "person",
        description: "开发信息与检查更新",
        sub: {
            "update": {
                name: "检查更新",
                content: {
                    "update-time": {
                        title: "检查更新设置",
                        description:
                            `发行信息追踪频率`,
                        widgets: [{
                            type: "select",
                            content: [
                                { value: "1h", text: "1 小时" },
                                { value: "3h", text: "3 小时" },
                                { value: "6h", text: "6 小时" },
                                { value: "never", text: "从不" },
                            ] as UserSelectItem<UpdateConfig["time"]>[],
                            init() {
                                return updateConfig.get().time;
                            },
                            event(updateTime: UpdateConfig["time"]) {
                                updateConfig.merge({ time: updateTime });
                            },
                        }],
                    },

                    "update-notify": {
                        widgets: [{
                            type: "toggle",
                            content: `启用一个对话框提示用户更新。该对话框可以立即安装更新，也可以推迟更新操作。`,
                            init() {
                                return updateConfig.get().notify;
                            },
                            event() {
                                updateConfig.merge({ notify: !updateConfig.get().notify });
                            },
                        }],
                    },

                    "update-component": {
                        widgets: [{
                            type: "component",
                            component: markRaw(AboutUpdate),
                        }],
                    },
                },
            },

            "about": {
                name: "关于项目",
                content: {
                    "about-component": {
                        widgets: [{
                            type: "component",
                            component: markRaw(AboutDetail),
                        }],
                    },
                },
            },
        },
    },
}));
