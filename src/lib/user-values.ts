import { GM_deleteValue, GM_getValue, GM_setValue } from "$";
import { NavBarHideMode } from "@/components/nav-bar.vue";
import { forEach, keys, merge } from "lodash-es";
import { setTheme } from "./api/remixed";
import { setPerfAttr } from "./perf";
import { setCustomBackground } from "./theme";
import { isLiteralObject, spawnOffsetTS } from "./utils";

export const MainTitle = "Tieba Remix";
export const Owner = "HacksawBlade";
export const RepoName = "Tieba-Remix";
export const GithubRepo = `https://github.com/${Owner}/${RepoName}`;
export const GiteeRepo = `https://gitee.com/${Owner}/${RepoName}`;
export const BaiduPassport = "https://passport.baidu.com/";

export const REMIXED =
    "\n" +
    "██████╗ ███████╗███╗   ███╗██╗██╗  ██╗███████╗██████╗ \n" +
    "██╔══██╗██╔════╝████╗ ████║██║╚██╗██╔╝██╔════╝██╔══██╗\n" +
    "██████╔╝█████╗  ██╔████╔██║██║ ╚███╔╝ █████╗  ██║  ██║\n" +
    "██╔══██╗██╔══╝  ██║╚██╔╝██║██║ ██╔██╗ ██╔══╝  ██║  ██║\n" +
    "██║  ██║███████╗██║ ╚═╝ ██║██║██╔╝ ██╗███████╗██████╔╝\n" +
    "╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ \n";

const userKeyEvents = ["getter", "setter"] as const;
type UserKeyEvent = typeof userKeyEvents[number];
type UserKeyEventsListener<T> = Record<UserKeyEvent, ((value: T) => unknown)>;
type UserKeyEventsListeners<T> = Record<UserKeyEvent, Array<((value: T) => unknown)>>;
export class UserKey<T, LegacyType = unknown> {
    public key: string;
    public defaultValue: T;
    private listeners: UserKeyEventsListeners<T>;
    protected migration?: (maybeLegacy: T | LegacyType) => T;

    constructor(
        key: string,
        defaultValue: T,
        listeners?: Partial<UserKeyEventsListener<T>>,
        migration?: (maybeLegacy: T | LegacyType) => T,
    ) {
        this.key = key;
        this.defaultValue = defaultValue;
        this.listeners = {
            getter: listeners?.getter ? [listeners.getter] : [],
            setter: listeners?.setter ? [listeners.setter] : [],
        };
        this.migration = migration;
    }

    protected dispatchEvent(event: UserKeyEvent, value: T) {
        forEach(this.listeners[event], listener => listener(value));
    }

    public get() {
        let value = GM_getValue<T>(this.key, this.defaultValue);
        if (isLiteralObject(value) &&
            keys(value).length < keys(this.defaultValue).length) {
            value = merge(this.defaultValue, value);
        }
        if (this.migration) {
            value = this.migration(value);
            GM_setValue(this.key, value);
        }
        this.dispatchEvent("getter", value);
        return value;
    }

    public set(value: T) {
        GM_setValue(this.key, value);
        this.dispatchEvent("setter", value);
    }

    public remove() {
        GM_deleteValue(this.key);
    }

    public merge(value: Partial<T>) {
        if (isLiteralObject(value)) {
            const merged = { ...this.get(), ...value };
            this.set(merged);
            this.dispatchEvent("setter", merged);
        }
    }

    public mergeDeeply(value: Partial<T>) {
        if (isLiteralObject(value)) {
            const merged = merge(this.get(), value);
            this.set(merged);
            this.dispatchEvent("setter", merged);
        }
    }
}

export class UserKeyTS<T, LegacyType = unknown> extends UserKey<T, LegacyType> {
    private defaultInvalid = () => spawnOffsetTS(0, 0, 0, 12);

    constructor(
        key: string,
        defaultValue: T,
        invalidfn?: (() => number),
        listeners?: Partial<UserKeyEventsListener<T>>,
        migration?: (maybeLegacy: T | LegacyType) => T,
    ) {
        super(key, defaultValue, listeners, migration);
        this.defaultInvalid = invalidfn ? invalidfn : this.defaultInvalid;
    }

    public get() {
        let value = getUserValueTS<T>(this.key, this.defaultValue);
        if (isLiteralObject(value) &&
            keys(value).length < keys(this.defaultValue).length) {
            value = merge(this.defaultValue, value);
        }
        if (this.migration) value = this.migration(value);
        this.dispatchEvent("getter", value);
        return value;
    }

    /**
     * 设置时间敏感的用户 key
     * @param value 需要设置的值
     * @param invalidTime 失效时间，默认为函数执行 12 小时后
     */
    public set(value: T, invalidTime?: number) {
        setUserValueTS(this.key, value, invalidTime ? invalidTime : this.defaultInvalid());
        this.dispatchEvent("setter", value);
    }

    public merge(value: Partial<T>, invalidTime?: number) {
        if (isLiteralObject(value)) {
            const merged = { ...this.get(), ...value };
            this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
            this.dispatchEvent("setter", merged);
        }
    }

    public mergeDeeply(value: Partial<T>, invalidTime?: number) {
        if (isLiteralObject(value)) {
            const merged = merge(this.get(), value);
            this.set(merged, invalidTime ? invalidTime : this.defaultInvalid());
            this.dispatchEvent("setter", merged);
        }
    }
}

export interface UpdateConfig {
    time: "1h" | "3h" | "6h" | "never";
    notify: boolean;
}

export type PerfType = "default" | "saver" | "performance";

/** 性能配置 */
export const perfProfile = new UserKey<PerfType>("perfProfile", "default", {
    setter() {
        setPerfAttr();
    },
});
/** 用户禁用的所有模块的 id */
export const disabledModules = new UserKey<string[]>("disabledModules", []);
/** 未读推送 */
export const unreadFeeds = new UserKeyTS<TiebaPost[]>("unreadFeeds", []);
/** 实验性功能配置 */
export const experimental = new UserKey("experimental", {
    moreBlurEffect: false,
    rasterEffect: false,
});
/** 最新发行版相关信息 */
export const latestRelease = new UserKeyTS<Maybe<GiteeRelease>>("latestRelease", undefined);
/** 更新配置 */
export const updateConfig = new UserKey<UpdateConfig>("updateConfig", {
    time: "6h",
    notify: true,
});
/** 今日是否提醒用户更新 */
export const showUpdateToday = new UserKeyTS("showUpdateToday", true, () => new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000);
/** 用户决定跳过更新的版本的标签 */
export const ignoredTag = new UserKey("ignoredTag", "");
/** 用户主题设置 */
export const themeType = new UserKey<"auto" | "dark" | "light">(
    "themeType",
    "auto",
    {
        setter(value) {
            setTheme(value);
        },
    });
/** 紧凑布局 */
export const compactLayout = new UserKey("compactLayout", false);
/** 宽屏设置 */
export const wideScreen = new UserKey("wideScreen", {
    maxWidth: 1080,
    noLimit: false,
});
/** 主题色 */
export const themeColor = new UserKey("themeColor", {
    light: "#614ec2",
    dark: "#7161c1",
});
/** 用户自定义背景图 */
export const customBackground = new UserKey<Maybe<string>>(
    "customBackground",
    undefined,
    {
        setter() {
            setCustomBackground();
        },
    }
);
/** 页面扩展 */
export const pageExtension = new UserKey("pageExtension", {
    index: true,
    thread: true,
});
/** 自定义主要字体组合 */
export const userFonts = new UserKey<string[]>("userFonts", []);
/** 自定义等宽字体组合 */
export const monospaceFonts = new UserKey<string[]>("monospaceFonts", [
    "Consolas", "JetBrains Mono", "Fira Code", "Menlo", "monospace",
]);
/** 导航栏模式 */
export const navBarHideMode = new UserKey<NavBarHideMode>("navBarHideMode", "fold");

export const SymbolFont = "Material Symbols";

const publicLib: LiteralObject = {};

export function getPublicLib<T>(key: string): T | undefined;
export function getPublicLib<T>(key: string, defaultValue: T): T;

export function getPublicLib<T>(key: string, defaultValue?: T) {
    if (publicLib[key]) {
        return publicLib[key];
    } else {
        if (defaultValue)
            return defaultValue;
    }
}

export function setPublicLib<T>(key: string, value: T) {
    publicLib[key] = value;
}

export interface GiteeRelease {
    "id": number
    "tag_name": string
    "target_commitish": string
    "prerelease": boolean
    "name": string
    "body": string
    "author": {
        "id": number
        /** 原始用户名 */
        "login": string
        "name": string
        "avatar_url": string
        "url": string
        "html_url": string
        "remark": string
        "followers_url": string
        "following_url": string
        "gists_url": string
        "starred_url": string
        "subscriptions_url": string
        "organizations_url": string
        "repos_url": string
        "events_url": string
        "received_events_url": string
        "type": string
    },
    "created_at": string
    "assets": {
        "browser_download_url": string
        "name"?: string
    }[]
}

export interface GiteeReleaseNotFound {
    message: string
}

/**
 * 获取时间敏感的值
 * @param key 需要获取的值对应的键
 * @param def 未获取到值时返回的默认值
 * @returns 获取到的对应值 | 预先设置的默认值 | undefined
 */
export function getUserValueTS<T>(key: string, def: T): T {
    try {
        const valueTS = GM_getValue<UserValueTS<T>>(key, {
            value: def,
            invalidTime: 0,
        });

        const timeStamp = Date.now();
        // 当前时间与失效时间匹配
        if (valueTS.invalidTime >= timeStamp) {
            return valueTS.value;
        } else {
            return def;
        }
    } catch (error) {
        return def;
    }
}

/**
 * 设置一个时间敏感的值进行存储
 * @param key 该值对应的键
 * @param value 需要设置的值
 * @param invalidTime 该值的失效时间
 */
export function setUserValueTS<T>(key: string, value: T, invalidTime: number): void;
/**
 * 设置一个时间敏感的值进行存储
 * @param key 该值对应的键
 * @param value 需要设置的值
 */
export function setUserValueTS<T>(key: string, value: UserValueTS<T>): void;

export function setUserValueTS(key: string, value: any, invalidTime?: number): void {
    try {
        if (invalidTime) {
            // 时间戳 + 值
            GM_setValue(key, {
                value: value,
                invalidTime: invalidTime,
            });
        } else {
            // 直接传入 UserValueNS
            GM_setValue(key, value);
        }
    } catch (error) {
        console.warn("setUserValueTS", error);
    }
}
