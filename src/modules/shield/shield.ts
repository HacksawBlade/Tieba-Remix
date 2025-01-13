import { UserKey } from "@/lib/user-values";
import { has, map } from "lodash-es";

/**
 * 屏蔽规则对象
 */
export interface ShieldRule {
    /** 匹配规则，它可能是直接的屏蔽词，也可能是正则表达式 */
    content: string;
    /** 描述当前规则的类型 */
    type: "string" | "regex";
    /** 作用域，屏蔽规则作用于贴子或用户 */
    scope: "posts" | "users";
    /** 是否启用该规则 */
    toggle: boolean;
    /** 是否忽略大小写，默认忽略 */
    ignoreCase?: boolean;
    /** 是否匹配 innerHTML？默认匹配 textContent */
    matchHTML?: boolean;
}

export interface ShieldRuleLegacy {
    rule: string;
    type: "string" | "regex";
    scope: "posts" | "users";
    switch: boolean;
    ignoreCase?: boolean;
    matchHTML?: boolean;
}

export const shieldList = new UserKey<ShieldRule[], (ShieldRule | ShieldRuleLegacy)[]>(
    "shieldList", [], undefined, (maybeLegacy) => map(maybeLegacy, shieldRuleMigration)
);

export function shieldRuleMigration(rule: ShieldRule | ShieldRuleLegacy): ShieldRule {
    if (!has(rule, "rule")) return rule as ShieldRule;
    rule = rule as ShieldRuleLegacy;
    return {
        content: rule.rule,
        type: rule.type,
        scope: rule.scope,
        toggle: rule.switch,
        ignoreCase: rule.ignoreCase,
        matchHTML: rule.matchHTML,
    };
}
