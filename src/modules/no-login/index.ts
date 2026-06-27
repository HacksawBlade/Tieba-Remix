import { Owner, OwnerProfile } from "@/lib/user-values";

export default {
    namespace: "nologin-tieba",
    title: "免登录浏览 (已弃用)",
    contributors: [{ name: Owner, url: OwnerProfile }],
    version: "1.0",
    brief: "免登录浏览贴吧",
    description: `始终伪装为已登录状态，让免登录浏览和已登录基本一致`,
    scope: ["thread"],
    runAt: "DOMLoaded",
    compatibility: "legacy",
    init() {
        if (PageData.user.is_login) return;
        PageData.user.is_login = 1;
    },
} satisfies UserModule;
