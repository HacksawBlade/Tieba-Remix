declare module "*.json";

type Maybe<T> = T | undefined;

interface LiteralObject {
    [prop: string]: T
}

type ValueOf<T> = T[keyof T]

type Mapped<T> = {
    [prop in keyof T]: T[prop]
}

type KeyMapped<T, U> = {
    [prop in keyof T]: U
}

type OptionalMapped<T> = {
    [prop in keyof T]?: T[prop];
}

type PageType = "index" | "thread" | "forum" | "user" | "unhandled"

/** 用户模块 */
interface UserModule {
    [prop: string]: any

    id: string
    /** 需要显示给用户的模块名称 */
    name: string
    author: string
    version: string
    brief: string
    description: string

    switch?: boolean
    scope: true | PageType[] | RegExp
    runAt: "immediately" | "afterHead" | "DOMLoaded" | "loaded"

    entry: (() => void)
}

/** 贴子 */
interface TiebaPost {
    id: string
    forum: {
        id: string
        name: string
        href: string
    }

    author: {
        portrait: string
        name: string
        href: string
    }
    time: string

    title: string
    content: string
    replies: number | string
    images: {
        thumb: string
        original: string
    }[]
}

type DropdownMenu = {
    title: string
    href?: string
    click?: (() => void)
    icon?: string
    innerText?: string
} | "separator"

interface UserValueTS<T> {
    value: T
    invalidTime: number
}

interface SimpleButton {
    title: string
    event: (() => void)
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

declare global {
    interface Global {
        none: undefined;
    }

    const globalThis: Global;
}

interface EventRecord {
    target: EventTarget;
    type: string;
    callback: ((e: any) => void) | EventListenerObject;
    options?: EventListenerOptions | boolean;
}
