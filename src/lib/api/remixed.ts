import { GM_info, GM_openInTab } from "$";
import { messageBox } from "@/lib/render/message-box";
import { toast } from "@/lib/render/toast";
import { GiteeRelease, GiteeRepo, Owner, RepoName, ignoredTag, latestRelease, showUpdateToday, themeType, updateConfig } from "@/lib/user-values";
import { spawnOffsetTS } from "@/lib/utils";
import { includes } from "lodash-es";
import { marked } from "marked";

export type PageType = "index" | "thread" | "forum" | "user" | "unhandled"

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

    if (location.hostname.toLowerCase() !== "tieba.baidu.com") return "unhandled";

    const pathname = location.pathname.toLocaleLowerCase();

    if (includes(["/", "/index.html"], pathname)) return "index";
    if (/\/p\/\d+/.test(pathname)) return "thread";
    if (pathname === "/f") return "forum";
    if (pathname === "/home/main") return "user";

    return "unhandled";
}

export async function getLatestReleaseFromGitee(owner = Owner, repo = RepoName, forceUpdate = false): Promise<GiteeRelease | undefined> {
    if (latestRelease.get() && !forceUpdate) {
        return latestRelease.get();
    } else {
        const TTL = (function () {
            switch (updateConfig.get().time) {
                case "1h": return 1;
                case "3h": return 3;
                case "6h": return 6;
                case "never": return -1;
            }
        })();

        if (TTL < 0) return;

        const response = await fetch(`https://gitee.com/api/v5/repos/${owner}/${repo}/releases/latest/`);

        if (response.ok) {
            const result = await response.json() as GiteeRelease;
            latestRelease.set(result, spawnOffsetTS(0, 0, 0, TTL));
            return result;
        } else {
            return undefined;
        }
    }
}

export function checkUpdateAndNotify(showLatest = false) {
    // 不追踪发行信息
    if (updateConfig.get().time === "never") return;
    // 静默
    if (!updateConfig.get().notify) return;
    // 今日已不能再提醒
    if (!showUpdateToday.get()) return;

    // 开发者专用
    if (GM_info.script.version === "developer-only") return;

    getLatestReleaseFromGitee().then((latestRelease) => {
        if (latestRelease && latestRelease.tag_name.slice(1) !== GM_info.script.version) {
            // 忽略当前版本
            if (ignoredTag.get() === latestRelease.tag_name) return;
            console.log(latestRelease);


            messageBox({
                title: latestRelease.name,
                message: marked(latestRelease.body),
                embedded: true,
                type: "OkCancel",
                buttons: [
                    {
                        title: "安装",
                        event() {
                            installFromRelease(latestRelease);
                        },
                    },
                    {
                        title: "今日不再提醒",
                        event() {
                            showUpdateToday.set(false);
                        },
                    },
                    {
                        title: "跳过该版本",
                        event() {
                            ignoredTag.set(latestRelease.tag_name);
                        },
                    },
                ],
            });
        } else {
            if (showLatest)
                messageBox({
                    title: "检查更新",
                    message: "当前已是最新版本",
                    type: "OkCancel",
                });
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
            if (asset.name && asset.name.endsWith(".user.js")) {
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
    requestAnimationFrame(autoTheme);

    switch (theme) {
        case "dark": {
            darkTheme();
            break;
        }

        case "light": {
            lightTheme();
            break;
        }

        case "auto":
        default: {
            break;
        }
    }

    function autoTheme() {
        if (themeType.get() === "auto") {
            if (matchMedia && matchMedia("(prefers-color-scheme: dark)").matches)
                darkTheme();
            else
                lightTheme();
        }
        requestAnimationFrame(autoTheme);
    }

    function lightTheme() {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
        document.documentElement.classList.remove("dark");
    }

    function darkTheme() {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        document.documentElement.classList.add("dark");
    }
}
