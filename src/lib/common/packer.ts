import _ from "lodash";
import { currentPageType } from "../api/remixed";
import { afterHead } from "../elemental";
import { disabledModules } from "../user-values";

/**
 * 解析用户模块，并根据默认情况按需执行模块
 * @param glob 
 * @param callbackfn 
 * @returns 所有解析后的模块
 */
export function parseUserModules(
    glob: Record<string, () => Promise<any>>,
    callbackfn?: ((module: UserModule) => void)
): UserModule[] {
    const modules: UserModule[] = [];

    _.forEach(glob, async moduleExport => {
        const currentModule = (await moduleExport()).default as UserModule;
        const disabledSet = new Set(disabledModules.get());

        // 先判断模块是否开启
        const runnable = (() => {
            if (currentModule.switch || currentModule.switch === undefined) {
                // 用户配置优先级最高，可以直接否决
                if (disabledSet.has(currentModule.id)) {
                    return false;
                }

                // 判断当前模块是否在作用域内
                // 始终运行
                if (currentModule.scope === true) {
                    return true;
                }

                // 数组
                if (Array.isArray(currentModule.scope)) {
                    for (let i = 0; i < currentModule.scope.length; i++) {
                        const scope = currentModule.scope[i];
                        if (currentPageType() === scope) {
                            return true;
                        }
                    }
                }

                // 正则表达式
                if (currentModule.scope instanceof RegExp) {
                    if (currentModule.scope.test(location.href)) {
                        return true;
                    }
                }
            }

            return false;
        })();

        // 根据模块 runAt 选择运行模式
        const runModule = {
            "immediately": () => { currentModule.entry(); },

            "afterHead": () => {
                afterHead(() => {
                    currentModule.entry();
                });
            },

            "DOMLoaded": () => {
                document.addEventListener("DOMContentLoaded", () => {
                    currentModule.entry();
                });
            },

            "loaded": () => {
                window.addEventListener("load", () => {
                    currentModule.entry();
                });
            },
        };

        currentModule.runnable = runnable;
        if (runnable) {
            runModule[currentModule.runAt]();
        }

        modules.push(currentModule);

        // 处理回调函数
        if (callbackfn) callbackfn(currentModule);
    });

    return modules;
}
