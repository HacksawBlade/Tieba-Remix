declare module "*.json";

declare const VOID: undefined;

type Maybe<T> = T | undefined;

interface LiteralObject {
    [prop: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

type ValueOf<T> = T[keyof T];

type Mapped<T> = {
    [prop in keyof T]: T[prop];
};

type KeyMapped<T, U> = {
    [prop in keyof T]: U;
};

type OptionalMapped<T> = {
    [prop in keyof T]?: T[prop];
};

type WebAppVersion = "legacy" | "current";
type PageType = "index" | "thread" | "forum" | "user" | "unhandled";

/** 用户模块 */
interface UserModule {
    /** 唯一标识符 */
    namespace: string;
    /** 显示给用户的模块名称 */
    title: string;
    /** 模块贡献者们 */
    contributors: {
        /** 贡献者名称 */
        name: string;
        /** 贡献者的个人网址 */
        url?: string;
    }[];
    /** 模块版本号 */
    version: string;
    /** 模块简介 */
    brief: string;
    /** 模块的详细说明 */
    description: string;
    /** 模块作用域：指定 `PageType[]` 则匹配对应页面类型；指定正则表达式则测试当前 URL；指定 "all" 始终运行； */
    scope: PageType[] | RegExp | "all";
    /** 运行时机：尽快运行；`head` 标签可用后运行；文档基本加载完毕后运行；页面完全加载后运行； */
    runAt: "immediately" | "afterHead" | "DOMLoaded" | "idle";
    /** 网页兼容性：仅旧版；仅新版；二者都兼容； */
    compatibility?: WebAppVersion | "all";

    /**
     * 模块挂载操作。旧版只在页面首次加载时检查一次运行要求并决定是否挂载，新版则会根据页面 URL 变化进行多次挂载尝试，具体为：
     * - 页面首次加载时，若条件符合则执行一次挂载；
     * - 页面 URL 发生变化时，若模块已挂载且符合页面变化后的运行要求，则不会重复挂载（也不会卸载）；
     * - 页面 URL 发生变化时，若页面变化前模块未挂载、变化后符合运行要求，则执行一次挂载。
     */
    init(): void;
    /**
     * 模块卸载操作。若模块曾使用过一些页面破坏性操作，则需指定该函数进行恢复。在旧版中永远不会调用，在新版中的行为具体为：
     * - 页面 URL 发生变化时，若模块已挂载但页面变化后不符合运行要求，则执行卸载。
     */
    fini?(): void;
    /**
     * 模块更新操作。在旧版中永远不会调用，在新版中页面 URL 变化时：
     * - 若页面变化前模块已挂载、变化后仍符合运行要求，则调用此方法。
     */
    update?(): void;
}

/** 贴子 */
interface TiebaPost {
    id: string;
    forum: {
        id: string;
        name: string;
        href: string;
    };

    author: {
        portrait: string;
        name: string;
        href: string;
    };
    time: string;

    title: string;
    content: string;
    replies: number | string;
    images: {
        thumb: string;
        original: string;
    }[];
}

type DropdownMenu =
    | {
          title: string;
          href?: string;
          click?: () => void;
          icon?: string;
          innerText?: string;
      }
    | "separator";

interface UserValueTS<T> {
    value: T;
    invalidTime: number;
}

interface SimpleButton {
    title: string;
    event: () => void;
}

interface Meta {
    author: string;
    description: string;
    downloadURL: string;
    grant: string[];
    icon: string;
    icon64: string;
    license: string;
    match: string[];
    name: string;
    namespace: string;
    "run-at": string;
    updateURL: string;
    version: string;
}

interface Coord {
    x: number;
    y: number;
}

interface EventRecord {
    target: EventTarget;
    type: string;
    callback: EventListener | EventListenerObject;
    options?: EventListenerOptions | boolean;
}

interface ThreadPicture {
    original: string;
    thumbnail: string;
    pictureId?: string;
    postId?: number;
}

interface Window {
    __TiebaRemixDev__?: Record<string, unknown>;
}
