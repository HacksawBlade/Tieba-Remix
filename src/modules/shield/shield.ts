import { UserKey } from "@/lib/user-values";
import _ from "lodash";

/**
 * 屏蔽规则对象
 */
export interface ShieldRule {
    /** 匹配规则，它可能是直接的屏蔽词，也可能是正则表达式 */
    content: string;
    /** 描述当前规则的类型 */
    type: "text" | "regex";
    /** 作用域，屏蔽规则作用于贴子或用户 */
    scope: "content" | "username";
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
    "shieldList", [], undefined, (maybeLegacy) => _.map(maybeLegacy, shieldRuleMigration)
);

/**
 * 匹配字符串是否和屏蔽对象规则符合
 * @param rule 屏蔽对象
 * @param str 需要匹配的字符串
 * @param scope 作用域，屏蔽规则作用于内容或用户
 * @returns 是否匹配成功
 */
export function matchShield(rule: ShieldRule, str: string, scope: ShieldRule["scope"]): boolean {
    // 规则未启用，直接返回
    if (!rule.toggle) return false;

    // 作用域不匹配，直接返回
    if (rule.scope !== scope) return false;

    // 可选参数
    if (rule.ignoreCase === undefined) rule.ignoreCase = true;

    // 字符串
    if (rule.type === "text") {
        // 忽略大小写，先转为小写
        if (rule.ignoreCase) {
            rule.content = rule.content.toLowerCase();
            str = str.toLowerCase();
        }

        if (str.indexOf(rule.content) !== -1) {
            return true;
        }
    }

    // 正则
    if (rule.type === "regex") {
        let regex: RegExp;

        // 忽略大小写
        if (rule.ignoreCase) {
            regex = new RegExp(rule.content, "i");
        } else {
            regex = new RegExp(rule.content);
        }

        if (regex.test(str)) {
            return true;
        }
    }

    return false;
}

export function shieldRuleMigration(rule: ShieldRule | ShieldRuleLegacy): ShieldRule {
    if (!_.has(rule, "rule")) return rule as ShieldRule;
    rule = rule as ShieldRuleLegacy;

    const newRule: ShieldRule = {
        content: rule.rule,
        type: "text",
        scope: "content",
        toggle: rule.switch,
        ignoreCase: rule.ignoreCase,
        matchHTML: rule.matchHTML,
    };

    if (rule.type === "string") newRule.type = "text";
    if (rule.scope === "posts") newRule.scope = "content";
    if (rule.scope === "users") newRule.scope = "username";

    return newRule;
}
