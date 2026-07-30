import { GM_info, unsafeWindow } from "$";

export type DevSpace = Record<string, unknown>;

export const DEV_SPACE_KEY = "__TiebaRemixDev__" as const;

export function isDeveloperMode(): boolean {
    return import.meta.env.DEV || GM_info.script.version === "developer-only";
}

function getDevScope(): Record<string, unknown> {
    return (typeof unsafeWindow !== "undefined"
        ? unsafeWindow
        : globalThis) as unknown as Record<string, unknown>;
}

function ensureDevSpace(): DevSpace | undefined {
    if (!isDeveloperMode()) {
        return undefined;
    }

    const scope = getDevScope();
    (scope[DEV_SPACE_KEY] as DevSpace | undefined) ??= {} as DevSpace;

    return scope[DEV_SPACE_KEY] as DevSpace;
}

export function initDevSpace(): void {
    ensureDevSpace();
}

export function exportToDevSpace(map: Record<string, unknown>): void {
    if (!isDeveloperMode()) {
        return;
    }

    const devSpace = ensureDevSpace();
    if (devSpace) {
        Object.assign(devSpace, map);
    }
}

export function getDevSpace(): DevSpace | undefined {
    if (!isDeveloperMode()) {
        return undefined;
    }

    const scope = getDevScope();
    return (scope[DEV_SPACE_KEY] as DevSpace | undefined) ?? undefined;
}
