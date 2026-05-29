import { GM_getValue, GM_info, GM_listValues, GM_openInTab, GM_setValue } from "$";
import type { GiteeRelease, GiteeReleaseNotFound, themeType } from "@/lib/user-values";
import {
    GiteeRepo,
    Owner,
    RepoName,
    ignoredTag,
    latestRelease,
    showUpdateToday,
    updateConfig,
} from "@/lib/user-values";
import { outputFile, selectLocalFile, spawnOffsetTS, waitUntil } from "@/lib/utils";
import _ from "lodash";
import { marked } from "marked";
import { messageBox, toast } from "user-view";
import { parseCSSRule } from "../elemental/styles";
import { userDialog } from "../render";
import { darkPrefers } from "../theme";

export type PageType = "index" | "thread" | "forum" | "user" | "unhandled";

marked.setOptions({});

// function dt2PageType(s: string): PageType {
//     switch (s) {
//         case "index":
//             return "index";
//         case "pb_bright":
//             return "thread";
//         case "frs":
//             return "forum";
//         case "main":
//             return "user";
//         default:
//             return "unhandled";
//     }
// }

/**
 * 获取当前页面的类型
 * @returns 当前页面的类型
 */
export function currentPageType(): PageType {
    // if (PageData) return dt2PageType(PageData.page);

    if (location.hostname.toLowerCase() !== "tieba.baidu.com") {
        return "unhandled";
    }

    const pathname = location.pathname.toLocaleLowerCase();

    if (_.includes(["/", "/index.html"], pathname)) {
        return "index";
    }
    if (/\/p\/\d+/.test(pathname)) {
        return "thread";
    }
    if (pathname === "/f") {
        return "forum";
    }
    if (pathname === "/home/main") {
        return "user";
    }

    return "unhandled";
}

export async function getLatestReleaseFromGitee(
    forceUpdate = false,
): Promise<GiteeRelease | string[]> {
    if (latestRelease.get() && !forceUpdate) {
        return latestRelease.get() ?? [];
    } else {
        const TTL = (function () {
            switch (updateConfig.get().time) {
                case "1h":
                    return 1;
                case "3h":
                    return 3;
                case "6h":
                    return 6;
                case "never":
                    return -1;
            }
        })();

        if (TTL < 0) {
            return [];
        }

        const updateUrls = [
            `https://gitee.com/api/v5/repos/${Owner}/${RepoName}/releases/latest/`,
            "https://gitee.com/api/v5/repos/HacksawBlade/Tieba-Remix/releases/latest/",
        ];

        const result = await (async () => {
            const errRecoder: string[] = [];
            for (const url of updateUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        return (await response.json()) as GiteeRelease;
                    } else {
                        errRecoder.push(
                            ((await response.json()) as GiteeReleaseNotFound).message,
                        );
                    }
                } catch (_e) {
                    _e;
                }
            }
            return errRecoder;
        })();

        if (!_.isArray(result)) {
            latestRelease.set(result, spawnOffsetTS(0, 0, 0, TTL));
        }
        return result;
    }
}

export function checkUpdateAndNotify(showLatest = false) {
    // 不追踪发行信息
    if (updateConfig.get().time === "never") {
        return;
    }
    // 静默
    if (!updateConfig.get().notify) {
        return;
    }
    // 今日已不能再提醒
    if (!showUpdateToday.get()) {
        return;
    }

    // 开发者专用
    if (GM_info.script.version === "developer-only") {
        return;
    }

    getLatestReleaseFromGitee().then((latestRelease) => {
        if (
            !_.isArray(latestRelease) &&
            latestRelease.tag_name.slice(1) !== GM_info.script.version
        ) {
            // 忽略当前版本
            if (ignoredTag.get() === latestRelease.tag_name) {
                return;
            }

            userDialog(
                <div
                    class="markdown"
                    v-html={marked(latestRelease.body)}
                    style={parseCSSRule({ maxWidth: "600px" })}
                />,
                {
                    title: latestRelease.name,
                    dialogButtons: [
                        {
                            text: "安装",
                            event() {
                                installFromRelease(latestRelease);
                                return true;
                            },
                            style: "themed",
                        },
                        {
                            text: "今日不再提醒",
                            event() {
                                showUpdateToday.set(false);
                                return true;
                            },
                        },
                        {
                            text: "跳过该版本",
                            event() {
                                ignoredTag.set(latestRelease.tag_name);
                                return true;
                            },
                        },
                    ],
                },
            );
        } else {
            if (showLatest) {
                messageBox({
                    title: "检查更新",
                    content: "当前已是最新版本",
                    type: "okCancel",
                });
            }
        }
    });
}

export function installFromRelease(release: GiteeRelease) {
    function notFound() {
        toast({
            message: "安装失败：未找到可用的资源",
            type: "error",
            duration: 6000,
            blurEffect: true,
        });
    }

    if (!release.assets || release.assets.length <= 0) {
        notFound();
        return;
    }

    const asset = (function () {
        for (const asset of release.assets) {
            if (asset.name?.endsWith(".user.js")) {
                return asset.browser_download_url;
            }
        }
    })();

    if (asset) {
        GM_openInTab(asset, {
            active: true,
        });
    } else {
        notFound();
        return;
    }
}

export function getResource(path: string) {
    return `${GiteeRepo}/raw/beta/${path}`;
}

export function setTheme(theme: ReturnType<typeof themeType.get>) {
    switch (theme) {
        case "dark":
            darkTheme();
            break;

        case "light":
            lightTheme();
            break;

        case "auto":
        default:
            darkPrefers.matches ? darkTheme() : lightTheme();
            break;
    }

    function lightTheme() {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme");
        document.documentElement.classList.remove("dark");

        waitUntil(() => !_.isNil(document.body)).then(() => {
            document.body.classList.remove("dark-theme");
        });
    }

    function darkTheme() {
        document.documentElement.classList.add("dark-theme");
        document.documentElement.classList.remove("light-theme");
        document.documentElement.classList.add("dark");

        waitUntil(() => !_.isNil(document.body)).then(() => {
            document.body.classList.add("dark-theme");
        });
    }
}

export function backupUserConfigs() {
    const excluded = ["unreadFeeds", "latestRelease", "showUpdateToday"];
    const userKeys = _.filter(GM_listValues(), (key) => !_.includes(excluded, key));
    const userValues = _.map(userKeys, (key) => GM_getValue(key));
    const configs = _.zipObject(userKeys, userValues);
    outputFile(
        `tieba-remix-backup@${new Date().getTime()}.json`,
        JSON.stringify(configs),
    );
}

export async function restoreUserConfigs() {
    const backupData = JSON.parse(await selectLocalFile());
    const restoredKeys: string[] = [];
    _.forEach(Object.entries(backupData), ([key, value]) => {
        try {
            restoredKeys.push(key);
            GM_setValue(key, value);
        } catch (_e) {
            toast({ type: "error", message: `配置 ${restoredKeys.pop()} 恢复失败` });
        }
    });
    userDialog(<p>{restoredKeys.join("\n")}</p>, {
        title: `成功恢复 ${restoredKeys.length} 个配置`,
        containerStyle: { width: "360px", maxWidth: "60vw" },
        contentStyle: { whiteSpace: "pre-wrap", fontFamily: "var(--code-monospace)" },
        dialogButtons: [{ text: "确定", style: "themed", event: () => true }],
    });
}

/**
 * 检测是否同时运行多个脚本实例，优先使用旧实例打开对话框
 */
export function checkMultiInstances() {
    const CHECK_DELAY = 1000;

    waitUntil(() => document.querySelectorAll("#nav-wrapper").length > 0).then(
        async () => {
            await new Promise((resolve) => setTimeout(resolve, CHECK_DELAY));
            if (!_.isNil(document.documentElement.dataset.remixed)) return;
            document.documentElement.dataset.remixed = GM_info.script.version;

            if (document.querySelectorAll("#nav-wrapper").length > 1) {
                userDialog(
                    <div class="markdown">
                        <p>
                            检测到多个脚本实例正在同时运行，请前往用户脚本管理器中禁用所有多余项！若需要保留自定义配置，请继续阅读下列内容。
                        </p>
                        <hr />
                        <p>请执行以下两种操作的任意一种：</p>
                        <ul>
                            <li>使用脚本自带的 备份/恢复 功能（设置面板中）——</li>
                            <ol>
                                <li>
                                    在脚本管理器中手动禁用新脚本，刷新页面后使用旧脚本的备份功能；
                                </li>
                                <li>检查备份文件是否准确；</li>
                                <li>
                                    禁用旧脚本，启用新脚本，刷新页面。从新脚本的恢复功能中导入备份文件；
                                </li>
                            </ol>

                            <li>手动数据迁移——</li>
                            <ol>
                                <li>
                                    直接在脚本管理器中将旧脚本的内部存储数据复制到新脚本中，并禁用旧脚本；
                                </li>
                            </ol>
                        </ul>
                        <p>
                            若曾经完全使用默认配置运行脚本，则备份文件几乎为空是正常的。
                        </p>
                    </div>,
                    {
                        title: "禁用多余的脚本实例",
                        force: true,
                        contentStyle: {
                            width: "500px",
                            maxWidth: "60vw",
                        },
                        dialogButtons: [
                            {
                                text: "已禁用旧脚本",
                                style: "themed",
                                event() {
                                    location.reload();
                                    return true;
                                },
                            },
                        ],
                    },
                );
            }
        },
    );
}
