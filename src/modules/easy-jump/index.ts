import { asyncdom } from "@/lib/elemental";
import { Owner, OwnerProfile } from "@/lib/user-values";

export default {
    namespace: "easy-jump",
    title: "直链跳转",
    contributors: [{ name: Owner, url: OwnerProfile }],
    version: "1.0.2",
    brief: "链接跳转避免二次确认",
    description: `自动跳转至分享链接的原始地址，不再进行中转（不处理被严重警告的链接）`,
    scope: /jump2?.bdimg.com\/safecheck\//,
    runAt: "immediately",
    compatibility: "all",
    async init() {
        location.href = (await asyncdom<"a">(".link")).innerText;
    },
} satisfies UserModule;
