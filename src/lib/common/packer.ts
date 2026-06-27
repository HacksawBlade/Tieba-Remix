import { monkeyWindow } from "$";
import { afterHead } from "libelemental";
import _ from "lodash";
import { onDOMReady, onPageLoaded } from ".";
import { currentPageType } from "../api/remixed";
import { currentStorage, disabledModules, WEBAPP_VERSION } from "../user-values";

/** 用户模块导出时的通用结构 */
interface UserModuleExport {
    [props: string]: unknown;
    default: UserModule;
}
/** 加载后的用户模块状态 */
type LoadedUserModules = Record<
    string,
    {
        ctx: UserModule;
        isMounted(): boolean;
    }
>;

/**
 * 加载所有用户模块
 * @param glob
 * @param callbackfn
 * @returns 所有解析后的模块
 */
export const loadUserModules = _.once(loadUserModulesImpl);

async function loadUserModulesImpl(): Promise<LoadedUserModules> {
    const glob = import.meta.glob("/src/modules/**/index.{ts,tsx}");
    const moduleDefs: UserModule[] = [];

    for (const [_, loader] of Object.entries(
        glob as Record<string, () => Promise<UserModuleExport>>,
    )) {
        const moduleExport = (await loader()).default;
        moduleExport.compatibility ??= "current";
        moduleDefs.push(moduleExport);
    }

    const activeInsts = new Set<string>();
    const loadedModules: LoadedUserModules = {};
    for (const mdef of moduleDefs) {
        loadedModules[mdef.namespace] = {
            ctx: mdef,
            isMounted: () => activeInsts.has(mdef.namespace),
        };
    }

    function shouldRun(umodule: UserModule, url: string): boolean {
        const disabledSet = new Set(disabledModules.get());
        if (disabledSet.has(umodule.namespace)) return false;
        if (umodule.scope === "all") return true;
        if (_.isArray(umodule.scope))
            return _.some(umodule.scope, (pt) => pt === currentPageType());
        if (umodule.scope instanceof RegExp) return umodule.scope.test(url);
        return false;
    }

    function isCompatible(umodule: UserModule): boolean {
        if (umodule.compatibility === "all") return true;
        return umodule.compatibility === currentStorage.get(WEBAPP_VERSION);
    }

    function schedule(url: string) {
        for (const ns of activeInsts) {
            const umodule = _.find(moduleDefs, (m) => m.namespace === ns);
            if (!umodule) continue;
            if (!shouldRun(umodule, url)) {
                umodule.fini?.();
                activeInsts.delete(ns);
            }
        }

        for (const umodule of moduleDefs) {
            if (!shouldRun(umodule, url)) continue;
            if (activeInsts.has(umodule.namespace)) continue;
            if (!isCompatible(umodule)) continue;

            const doInit = () => {
                if (activeInsts.has(umodule.namespace)) return;
                umodule.init();
                activeInsts.add(umodule.namespace);
            };

            const launcher: Record<UserModule["runAt"], () => void> = {
                immediately: doInit,
                afterHead: () => {
                    afterHead(doInit);
                },
                DOMLoaded: () => {
                    onDOMReady(doInit);
                },
                idle: () => {
                    onPageLoaded(doInit);
                },
            };
            launcher[umodule.runAt]();
        }
    }

    schedule(location.href);

    monkeyWindow.addEventListener("urlchange", (e) => {
        schedule(e.url);
    });

    return loadedModules;
}
