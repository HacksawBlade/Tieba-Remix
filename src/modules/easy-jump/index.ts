import { asyncdom } from "@/lib/elemental";
import { Owner, OwnerProfile } from "@/lib/user-values";

const LEGACY_SAFE_REGEX = /jump2?.bdimg.com\/safecheck\//;
const CURRENT_SAFE_REGEX = /\/mo\/q\/checkurl\?url=/;

export default {
    namespace: "easy-jump",
    title: "直链跳转",
    contributors: [{ name: Owner, url: OwnerProfile }],
    version: "1.0.2",
    brief: "链接跳转避免二次确认",
    description: `自动跳转至分享链接的原始地址，不再进行中转（不处理被严重警告的链接）`,
    scope: [LEGACY_SAFE_REGEX, CURRENT_SAFE_REGEX],
    runAt: "immediately",
    compatibility: "all",
    async init() {
        location.href = ((await asyncdom(".link")) as HTMLElement).innerText;
    },
} satisfies UserModule;
