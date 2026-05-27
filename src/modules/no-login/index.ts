export default {
    id: "nologin-tieba",
    name: "免登录浏览",
    author: "锯条",
    version: "1.0",
    brief: "免登录浏览贴吧",
    description: `始终伪装为已登录状态，让免登录浏览和已登录基本一致`,
    scope: ["thread"],
    runAt: "DOMLoaded",
    entry: main,
} as UserModule;

function main() {
    if (PageData.user.is_login) {
        return;
    }

    PageData.user.is_login = 1;
    // const nameValue = document.createElement("div");
    // nameValue.id = "nameValue";

    // document.addEventListener("DOMContentLoaded", () => {
    //     document.body.appendChild(nameValue);
    // });
}
