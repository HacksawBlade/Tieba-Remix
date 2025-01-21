<template>
    <nav ref="navBar" id="nav-bar" class="nav-bar remove-default"
        :class="{ 'fold': hideMode === 'alwaysFold', 'blur-effect': !experimental.get().rasterEffect, 'raster-effect': experimental.get().rasterEffect, 'fixed-on-top': hideMode === 'fixedOnTop' }">
        <div v-show="teiggerHide" id="fold-bar"></div>

        <div id="nav-container">
            <div class="left-container">
                <UserButton class="nav-button nav-title-container" is-anchor href="/" no-border="all">
                    <img :src="getResource('/assets/images/main/icon64.png')" alt="" class="nav-icon">
                    <p class="nav-title">贴吧</p>
                </UserButton>
            </div>

            <div class="right-container">
                <div class="middle-container">
                    <template v-for="(menu, key) in middleMenu" :key="key">
                        <UserButton class="menu-trigger middle-menu-trigger" no-border="all">
                            {{ key }}
                            <DropdownMenu class="nav-menu" :menu-items="menu"></DropdownMenu>
                        </UserButton>
                    </template>
                </div>

                <UserButton class="nav-button menu-trigger avatar-button" no-border="all">
                    <img ref="navAvatar" class="nav-avatar">
                    <DropdownMenu class="nav-menu" :menu-items="userMenu!"></DropdownMenu>
                </UserButton>

                <UserButton class="nav-button menu-trigger menu-button" shadow-border no-border="all">
                    <div class="icon">menu</div>
                    <DropdownMenu class="nav-menu" :menu-items="extendMenu!">
                    </DropdownMenu>
                </UserButton>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { checkUpdateAndNotify, getResource } from "@/lib/api/remixed";
import { tiebaAPI } from "@/lib/api/tieba";
import { dom } from "@/lib/elemental";
import { renderDialog } from "@/lib/render";
import { getFloatCoord } from "@/lib/render/layout/float";
import { messageBox } from "@/lib/render/message-box";
import { toast } from "@/lib/render/toast";
import { experimental, GiteeRepo, GithubRepo, navBarHideMode } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import _ from "lodash";
import { onMounted, ref } from "vue";
import Settings from "./settings.vue";
import DropdownMenu from "./utils/dropdown-menu.vue";
import UserButton from "./utils/user-button.vue";

export type NavBarHideMode = "fold" | "alwaysFold" | "hideWhenScroll" | "fixedOnTop" | "never";

interface Props {
    hideMode?: NavBarHideMode
}

const props = withDefaults(defineProps<Props>(), {
    hideMode: navBarHideMode.get(),
});

const navBar = ref<HTMLDivElement>();
const teiggerHide = ref(false);

const navAvatar = ref<HTMLImageElement>();
const userPortrait = ref<string>("");

const middleMenu = ref<{ [props: string]: DropdownMenu[] } | undefined>({});
const userMenu = ref<DropdownMenu[]>([]);
const extendMenu = ref<DropdownMenu[]>([]);

init();
onMounted(async function () {
    {
        waitUntil(() => userPortrait.value !== "").then(function () {
            if (navAvatar.value)
                navAvatar.value.src = tiebaAPI.URL_profile(userPortrait.value);
        });
    }
});

async function init() {
    await waitUntil(() => PageData !== undefined).then(() => {
        userPortrait.value = PageData.user.portrait;
        loadNavMenuContent();
    });

    const navBarElement = dom("#nav-bar");
    if (navBarElement) {
        _.forEach(dom<"button">(".menu-trigger", navBarElement, []), el => {
            el.addEventListener("mousemove", function (e) {
                e.stopPropagation();
                const menu = el.lastElementChild as HTMLElement;

                const elRect = el.getBoundingClientRect();
                const menuCoord = getFloatCoord(menu, { x: elRect.left + elRect.width / 2, y: 0 }, "middle");
                menu.style.left = `${menuCoord.x}px`;
                menu.style.top = "48px";
            });
        });
    }

    switch (props.hideMode) {
        case "alwaysFold":
            teiggerHide.value = true;
            break;

        case "fold":
        case "hideWhenScroll": {
            const modeClass = props.hideMode === "fold" ? "fold" : "hide";
            const threshold = 50, timeout = 1000;
            let lastScrollY = window.scrollY;
            let timer = -1;
            const handle = _.throttle(function () {
                if (window.scrollY > lastScrollY + threshold) {
                    navBar.value?.classList.add(modeClass);
                    teiggerHide.value = true;
                    clearTimeout(timer);
                } else if (window.scrollY < lastScrollY - threshold) {
                    navBar.value?.classList.remove(modeClass);
                    teiggerHide.value = false;
                    clearTimeout(timer);
                } else {
                    clearTimeout(timer);
                    timer = setTimeout(handle, timeout);
                }
                lastScrollY = window.scrollY;
            });
            window.addEventListener("scroll", handle);
            break;
        }

        case "never":
            break;
    }
}

async function login() {
    const loginButton = dom(".u_login");
    const directLoginButton = dom<"a">("#TANGRAM__PSP_24__submit");

    if (directLoginButton) {
        const confirmDirect = await messageBox({
            title: "快速登录",
            content: "检测到快速登录入口，是否尝试直接登录？",
            type: "okCancel",
        });

        if (confirmDirect === "positive") {
            directLoginButton.click();
        } else {
            regularLogin();
        }
    } else {
        regularLogin();
    }

    function regularLogin() {
        loginButton
            ? dom<"a">("a", loginButton)?.click()
            : cannotLogin();
    }

    function cannotLogin() {
        toast({ message: "未检测到可用的登录入口，请刷新重试", type: "warning" });
    }
}

function loadNavMenuContent() {
    middleMenu.value = {
        "消息": [
            {
                title: "查看私信",
                href: "/im/pcmsg",
            },
            {
                title: "查看回复",
                href: `/i/sys/jump?u=${userPortrait.value}&type=replyme`,
            },
            {
                title: "查看 @",
                href: `/i/sys/jump?u=${userPortrait.value}&type=atme`,
            },
            "separator",
            {
                title: "查看好友申请",
                href: `/i/sys/jump?u=${userPortrait.value}&type=friendapply`,
            },
            {
                title: "查看新粉丝",
                href: `/i/sys/jump?u=${userPortrait.value}&type=fans`,
            },
            "separator",
            {
                title: "我的收藏",
                href: `/i/sys/jump?u=${userPortrait.value}&type=storethread`,
            },
            {
                title: "我的通知",
                href: "/sysmsg/index?type=notity",
            },
        ],

        "更多": [
            {
                title: "账号设置",
                href: "//passport.baidu.com/?center&tpl=tb&aid=6&default_tab=3#3,0",
            },
            {
                title: "贴吧设置",
                href: `/home/profile?un=${PageData.user.name_url}`,
            },
            "separator",
            {
                title: "服务中心",
                href: "//tieba.baidu.com/pmc",
            },
            {
                title: "问题反馈",
                href: "//tieba.baidu.com/hermes/feedback",
            },
        ],
    };
    userMenu.value = [
        {
            title: "我的贴吧",
            href: `/home/main?id=${userPortrait.value}&fr=userbar`,
        },
        {
            title: "我的收藏",
            href: `/i/sys/jump?un=${PageData.user.user_name}${PageData.user.name_url}&type=storethread&st_mod=userbar&fr=tb0_pb`,
        },
    ];

    PageData.user.is_login
        ? userMenu.value.push("separator", {
            title: "退出登录",
            click() {
                const logoutButton = dom(".u_logout");
                if (logoutButton) {
                    dom<"a">("a", logoutButton)?.click();
                } else {
                    toast({ message: "未检测到退出登录入口，请刷新重试。", type: "warning" });
                }
            },
        })
        : userMenu.value.push("separator", {
            title: "登录",
            click() {
                login();
            },
        });

    extendMenu.value = [
        {
            title: "脚本设置",
            click() {
                renderDialog(Settings);
            },
        },
        {
            title: "检查更新",
            click() {
                checkUpdateAndNotify(true);
            },
        },
        "separator",
        {
            title: "源代码仓库",
            innerText: "GitHub",
            href: GithubRepo,
        },
        {
            title: "源代码仓库",
            innerText: "Gitee",
            href: GiteeRepo,
        },
        {
            title: "切换至 GreasyFork",
            href: "https://greasyfork.org/zh-CN/scripts/486367",
        },
    ];
}
</script>

<style lang="scss" scoped>
$nav-height: 48px;
$nav-fold-height: 16px;
$fold-bar-height: 3px;

#nav-bar {
    position: fixed;
    z-index: 1200;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: $nav-height;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--trans-page-background);
    transition: all var(--default-duration), width 0s;

    @include main-box-shadow(0, 10px);

    &.fold {
        transform: translateY(calc(-1 * $nav-height + $nav-fold-height));

        &::after {
            position: absolute;
            top: $nav-height;
            width: 100%;
            height: calc($nav-height - $nav-fold-height);
            content: "";
        }

        &:hover {
            transform: translateY(0);

            #nav-container {
                display: flex;
            }

            #fold-bar {
                display: none;
            }
        }

        #fold-bar {
            position: absolute;
            bottom: calc(($nav-fold-height - $fold-bar-height) / 2);
            width: 60px;
            height: $fold-bar-height;
            border-radius: 3px;
            margin: 0 auto;
            background-color: var(--border-color);
        }

        #nav-container {
            display: none;
        }
    }

    &.hide {
        // height: 0;
        box-shadow: none !important;
        transform: translateY(-100%);
    }

    &.fixed-on-top {
        position: absolute;
    }

    [no-scrollbar] & {
        width: calc(100% - var(--scrollbar-width));
    }

    #nav-container {
        display: flex;
        width: 100%;
        max-width: var(--content-max);
        height: 100%;
        justify-content: space-between;

        .shrink-view & {
            justify-content: space-around;
        }

        .left-container {
            .nav-title-container {
                display: flex;
                height: 100%;
                align-items: center;
                padding: 0;
                border: none;
                background: none;
                gap: 8px;
                text-decoration: underline 3px var(--tieba-theme-color);

                .nav-icon {
                    width: 36px;
                }

                .nav-title {
                    color: var(--default-fore);
                    font-size: 20px;
                    font-style: italic;
                    font-weight: bold;
                    transition: 0.2s;
                }

                &:hover .nav-title,
                &:active .nav-title,
                &:focus .nav-title {
                    color: var(--highlight-fore);
                }
            }
        }

        .middle-container {
            display: flex;
            height: 100%;
            justify-content: center;

            .middle-menu-trigger {
                height: 100%;
                padding: 0 10px;
                border: none;
                color: var(--default-fore);
                font-size: 15px;
                font-weight: bold;
                text-decoration: underline 2px rgba($color: #000, $alpha: 0%);

                &:hover {
                    text-decoration: underline 2px var(--tieba-theme-color);
                }
            }
        }

        .right-container {
            display: flex;
            gap: 6px;

            .avatar-button {
                display: flex;
                height: 100%;
                align-items: center;
                padding: 0;
                padding: 0 2px;
                border: 4px;

                .nav-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 24px;
                    box-shadow: 0 0 0 1px var(--border-color);
                    transition: 0.4s;
                }

                &:hover > .nav-avatar {
                    box-shadow: 0 0 0 2px var(--tieba-theme-color);
                }
            }

            .menu-button {
                padding: 2px 8px;
                border: none;
                color: var(--highlight-fore);
                font-size: 26px;

                &:hover {
                    color: var(--tieba-theme-color);
                }
            }
        }
    }
}

.menu-trigger {
    border-radius: 0;
    background-color: transparent;

    &:hover {
        background-color: var(--default-hover);
    }

    &:hover > .nav-menu,
    &:active > .nav-menu {
        display: block;
    }
}

.nav-menu {
    position: absolute;
    z-index: 1201;
    display: none;
    cursor: default;
    font-weight: normal;

    &:hover {
        display: block;
    }
}
</style>
