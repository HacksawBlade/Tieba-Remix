<template>
    <div class="index-wrapper">
        <div class="grid-container">
            <div class="head-controls">
                <!-- 搜索组件 -->
                <div class="search-controls">
                    <UserTextbox
                        v-model="searchText"
                        class="search-box"
                        placeholder="搜索 贴吧"
                        autocomplete="none"
                        @focus="searchBoxFocus"
                        @input="searchMatch">
                    </UserTextbox>

                    <UserButton class="search-button" :theme-style="true" no-border
                        >搜索</UserButton
                    >

                    <!-- 搜索建议组件 -->
                    <div
                        v-show="suggToggle && suggestions.length > 0"
                        class="search-suggestions">
                        <UserButton
                            :is-anchor="true"
                            class="search-elem"
                            v-for="sugg in suggestions"
                            :href="sugg.href"
                            target="_blank"
                            no-border>
                            <img class="sugg-img" :src="sugg.image" alt="" />
                            <div class="sugg-content">
                                <p class="sugg-title">{{ sugg.title }}</p>
                                <p class="sugg-desc">{{ sugg.desc }}</p>
                            </div>
                        </UserButton>
                    </div>
                </div>
            </div>

            <div class="home-section-wrapper">
                <div class="home-section-container">
                    <UserToggle
                        v-for="(toggle, key) in homeSections"
                        v-show="toggle.active"
                        v-model="homeSectionToggles[key]"
                        class="home-section-button"
                        :title="toggle.name"
                        :key="key"
                        :class="{ active: currentSection === key }"
                        no-border="all"
                        @click="currentSection = key">
                        <span class="icon">{{ toggle.icon }}</span>
                        <span v-show="key === currentSection" class="name">{{
                            toggle.name
                        }}</span>
                    </UserToggle>
                </div>

                <div class="home-section-container">
                    <UserButton
                        class="home-section-button"
                        title="设置"
                        no-border="all"
                        @click="renderDialog(Settings)">
                        <span class="icon">settings</span>
                    </UserButton>
                </div>

                <div
                    v-show="homeSections[currentSection].moreOpts"
                    class="home-section-container"
                    style="margin-left: auto">
                    <UserButton
                        v-for="opt in homeSections[currentSection].moreOpts"
                        class="home-section-button"
                        :title="opt.name"
                        :key="opt.name"
                        no-border="all"
                        @click="opt.event()">
                        <span class="icon">{{ opt.icon }}</span>
                    </UserButton>
                </div>
            </div>

            <div
                v-show="followed && currentSection === 'followed'"
                class="block-wrapper followed-container">
                <div class="block-container followed-list">
                    <UserButton
                        v-for="forum in followed?.like_forum"
                        :is-anchor="true"
                        class="followed-btn"
                        :shadow-border="true"
                        :href="tiebaAPI.URL_forum(forum.forum_name)"
                        target="_blank"
                        no-border>
                        <div v-if="forum.is_sign === 1" class="icon signed">check</div>
                        <div class="forum-title">{{ forum.forum_name }}</div>
                        <div
                            class="forum-level"
                            :class="'level-' + levelToClass(forum.user_level)">
                            {{ forum.user_level }}
                        </div>
                    </UserButton>
                </div>
            </div>

            <div
                v-show="topicList.length > 0 && currentSection === 'topicList'"
                class="block-wrapper topic-container">
                <div class="block-container topic-list">
                    <UserButton
                        v-for="topic in _.take(topicList, 10)"
                        :is-anchor="true"
                        class="topic-btn"
                        :shadow-border="true"
                        :href="topic.topic_url"
                        target="_blank">
                        <img class="topic-img" :src="topic.topic_pic" />
                        <div class="topic-content">
                            <div class="topic-title">
                                <div :class="'topic-rank-' + topic.idx_num">
                                    {{ topic.idx_num }}
                                </div>
                                <div class="topic-name">
                                    {{ _.unescape(topic.topic_name) }}
                                </div>
                            </div>
                            <div class="topic-desc">
                                {{ _.unescape(topic.topic_desc) }}
                            </div>
                        </div>
                    </UserButton>
                </div>
            </div>

            <div v-show="false" id="carousel_wrap"></div>
        </div>

        <div
            ref="masonryContainer"
            v-if="currentSection === 'feeds'"
            class="masonry-container">
            <FeedsMasonry
                ref="feedsMasonry"
                v-show="currentSection === 'feeds'"
                :init-feeds="initFeeds"
                :auto-update="currentSection === 'feeds'"
                show-progress></FeedsMasonry>

            <div v-show="initFeeds.length === 0" class="empty-container">
                <p class="no-feed-content">没有更多了</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    FollowedForumsResponse,
    SuggestionResponse,
    TopicList,
    TopicListResponse,
    UserInfoResponse,
} from "@/lib/api/tieba";
import { levelToClass, tiebaAPI } from "@/lib/api/tieba";

import _ from "lodash";
import { computed, onMounted, ref, watch } from "vue";

import { findParent } from "@/lib/elemental";
import { renderDialog } from "@/lib/render";
import { errorMessage, requestInstance } from "@/lib/utils";
import { messageBox, toast, UserToggle } from "user-view";

import FeedsMasonry from "@/components/feeds-masonry.vue";
import Settings from "@/components/settings.vue";
import type { OneKeySignResponse } from "@/lib/api/tieba";
import { BaiduPassport, GiteeRepo, GithubRepo, unreadFeeds } from "@/lib/user-values";
import { UserButton, UserTextbox } from "user-view";

interface HomeSection {
    name: string;
    icon: string;
    active: boolean;
    moreOpts?: {
        name: string;
        icon: string;
        event(): void;
    }[];
}

type HomeSectionKey = "followed" | "feeds" | "topicList";

const initFeeds = ref<TiebaPost[]>([]);
const userInfo = ref<UserInfoResponse["data"]>();
const followed = ref<FollowedForumsResponse["data"]>();

const masonryContainer = ref<HTMLDivElement>();
const feedsContainer = ref<HTMLAnchorElement>();
const searchText = ref<string>("");
const suggToggle = ref(false);
const suggestions = ref<
    {
        image: string;
        title: string;
        desc: string;
        href: string;
    }[]
>([]);
const configMenu = ref<DropdownMenu[]>();
const profileMenu = ref<DropdownMenu[]>();
const topicList = ref<TopicList[]>([]);
const feedsIntersecting = ref(false);
const feedsMasonry = ref({} as InstanceType<typeof FeedsMasonry>);
const signedForums = ref(0);
const homeSections = computed<Record<HomeSectionKey, HomeSection>>(() => ({
    followed: {
        name: `关注的吧 (${signedForums.value ?? 0}/${followed.value?.like_forum.length ?? 0})`,
        icon: "star",
        active: true,
        moreOpts: [
            {
                name: "一键签到",
                icon: "task_alt",
                event: oneKeySignInstance,
            },
        ],
    },
    feeds: {
        name: "推送",
        icon: "web_stories",
        active: true,
        moreOpts: [
            {
                name: "刷新",
                icon: "refresh",
                event() {
                    feedsMasonry.value.refreshAndMove();
                },
            },
        ],
    },
    topicList: {
        name: "贴吧热议",
        icon: "mode_heat",
        active: true,
    },
}));
const currentSection = ref<HomeSectionKey>("followed");
const homeSectionToggles = computed<Record<HomeSectionKey, boolean>>(() => ({
    followed: currentSection.value === "followed",
    feeds: currentSection.value === "feeds",
    topicList: currentSection.value === "topicList",
}));

initFeeds.value = unreadFeeds.get();

// 初始化
onMounted(async () => {
    init().then(() => {
        // 监控
        if (masonryContainer.value) {
            const iObs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    feedsIntersecting.value = true;
                } else {
                    feedsIntersecting.value = false;
                }
            });
            iObs.observe(masonryContainer.value);
        }
    });
});

window.addEventListener("focusin", (ev) => {
    toggleSuggControls(ev);
});
window.addEventListener("mousedown", (ev) => {
    toggleSuggControls(ev);
});

watch(currentSection, (_, oldVal) => {
    if (oldVal === "feeds") {
        initFeeds.value = feedsMasonry.value.feeds;
    }
});

async function init() {
    // 用户信息
    userInfo.value = await (async () => {
        try {
            const userInfoResp = (await (
                await tiebaAPI.userInfo()
            ).json()) as UserInfoResponse;
            if (userInfoResp) {
                return userInfoResp.data;
            }
        } catch (error) {
            toast({
                message: errorMessage(error as Error),
                type: "error",
                duration: 6000,
            });
        }
    })();

    // 配置菜单
    configMenu.value = [
        {
            title: "设置",
            click() {
                renderDialog(Settings);
            },
        },
        "separator",
        {
            title: "源代码 (GitHub)",
            href: GithubRepo,
        },
        {
            title: "源代码 (Gitee)",
            href: GiteeRepo,
        },
    ];

    // 用户菜单
    profileMenu.value = [
        {
            title: "登录",
            icon: "login",
            href: BaiduPassport,
        },
    ];

    if (userInfo.value) {
        profileMenu.value = [
            {
                title: "我的收藏",
                icon: "star",
            },
            "separator",
            {
                title: "主页",
                icon: "home",
                href: tiebaAPI.URL_userHome(userInfo.value.user_portrait),
            },
            {
                title: "修改",
                icon: "settings",
            },
            "separator",
            {
                title: "退出登录",
                icon: "logout",
            },
        ];
    }

    // 获取关注的吧
    if (userInfo.value) {
        getFollowedInstance();
    }

    // 贴吧热议
    requestInstance(tiebaAPI.topicList()).then((response: TopicListResponse) => {
        if (response) {
            topicList.value.push(...response.data.bang_topic.topic_list);
        }
    });

    // 页面
    if (!feedsContainer.value) {
        return;
    }
}

function toggleSuggControls(e: Event) {
    const el = e.target as HTMLElement;
    const pt = findParent(el, "search-controls");
    if (pt) {
        suggToggle.value = true;
    } else {
        suggToggle.value = false;
    }
}

/**
 * 加载搜索建议
 * @param query 搜索关键字
 */
async function loadSuggestions(query?: string) {
    const response = await tiebaAPI.suggestions(query);
    if (response.ok) {
        response.json().then((value: SuggestionResponse) => {
            // 没有输入搜索内容则获取热门搜索
            if (!query || query === "") {
                const topicList = value.hottopic_list.search_data;
                if (topicList) {
                    suggestions.value = _.map(topicList, (topic) => ({
                        image: topic.topic_pic,
                        title: topic.topic_name,
                        desc: topic.topic_desc,
                        href: topic.topic_url,
                    }));
                }
            } else {
                const matchList = value.query_match.search_data;
                if (matchList) {
                    suggestions.value = _.map(matchList, (match) => ({
                        image: match.fpic,
                        title: match.fname,
                        desc: match.forum_desc,
                        href: tiebaAPI.URL_forum(match.fname),
                    }));
                }
            }
        });
    }
}

// 事件处理
function searchBoxFocus() {
    if (suggestions.value.length <= 0) {
        loadSuggestions().then(() => {
            suggToggle.value = true;
        });
    } else {
        suggToggle.value = true;
    }
}

function searchTextChange() {
    loadSuggestions(searchText.value);
}

const searchMatch = _.debounce(searchTextChange, 500);

function getFollowedInstance() {
    requestInstance(tiebaAPI.followedForums()).then(
        (response: FollowedForumsResponse) => {
            if (response) {
                signedForums.value = 0;
                followed.value = response.data;

                // 已签到计数
                _.forEach(followed.value.like_forum, (forum) => {
                    if (forum.is_sign === 1) {
                        signedForums.value++;
                    }
                });
                // 排序关注吧
                followed.value.like_forum.sort((a, b) => +b.user_exp - +a.user_exp);
            }
        },
    );
}

async function oneKeySignInstance() {
    messageBox({
        title: "一键签到",
        content:
            "需要注意，Web端签到获取到的经验远少于移动端，建议使用其他设备进行签到。",
        type: "okCancel",
    }).then((tag) => {
        if (tag === "positive") {
            requestInstance(tiebaAPI.oneKeySign()).then(
                (response: OneKeySignResponse) => {
                    toast({
                        message: `本次共签到成功 ${response.data.signedForumAmount} 个吧，未签到 ${response.data.unsignedForumAmount} 个吧，签到失败 ${response.data.signedForumAmountFail} 个吧，共获得 ${response.data.gradeNoVip} 经验。`,
                        type: "check",
                        blurEffect: true,
                    });

                    // 刷新关注的吧
                    getFollowedInstance();
                },
            );
        }
    });
}
</script>

<style scoped lang="scss">
.home-section-wrapper {
    display: flex;
    max-width: var(--content-max);
    align-items: center;
    gap: 8px;

    .home-section-container {
        display: flex;
        align-items: center;
        gap: 8px;

        .home-section-button {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 64px;
            font-size: 14px;
            gap: 4px;
            transition:
                all 0s,
                transform var(--fast-duration) cubic-bezier(0.39, 0.58, 0.57, 1),
                background-color var(--default-duration);

            .icon {
                font-size: 18px;
            }

            &:not(:hover, :active, :focus, .active) {
                background-color: var(--trans-light-background);
            }

            &.active {
                font-weight: var(--font-weight-bold);
                transform: scale(1.05);

                .icon {
                    @extend %filled-icon;
                }
            }

            .name {
                font-family: var(--code-zh);
            }
        }
    }
}
</style>

<style scoped lang="scss">
$menu-margin: 24px;
$menu-button-size: 32px;

a {
    color: unset;
    text-decoration: none;
}

.block-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.block-controls {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;

    .block-title {
        margin: 0;
        font-size: 24px;
        font-weight: var(--font-weight-bold);
    }
}

.block-container {
    padding: 8px;
    border-radius: 12px;
    background-color: var(--trans-light-background);

    @include blur-if-custom-background;
}

.block-panel {
    display: flex;
    min-width: 30px;
    height: 26px;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 24px;
    margin-left: auto;
    background-color: var(--trans-light-background);
    font-size: 14px;
    text-align: center;

    .icon {
        color: var(--light-fore);
        font-size: 18px;
    }

    .panel-btn {
        width: 30px;
        height: 30px;
        padding: 4px;
        border: none;
        border-radius: 48px;
    }

    &.left-align {
        margin-left: 0;
    }
}

.index-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;

    .grid-container {
        display: grid;
        width: calc(100% - 32px);
        max-width: var(--content-max);
        margin: 16px;
        gap: 20px;
        grid-template-rows: repeat(1, 1fr);

        .head-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px;
            margin-top: 24px;
            gap: 24px;

            .main-title {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                .main-icon {
                    height: 64px;
                }

                .title {
                    font-size: 36px;
                    font-style: italic;
                    font-weight: var(--font-weight-bold);
                }
            }

            .search-controls {
                position: relative;
                display: grid;
                width: 100%;
                max-width: 420px;
                justify-content: center;
                grid-template-columns: 1fr 72px;

                .search-box {
                    width: 100%;
                    padding: 8px;
                    border-bottom-right-radius: 0;
                    border-top-right-radius: 0;
                    font-size: 16px;
                }

                .search-button {
                    border: none;
                    border-bottom-left-radius: 0;
                    border-top-left-radius: 0;
                    font-size: 16px;
                    font-weight: var(--font-weight-bold);
                }

                .search-suggestions {
                    position: absolute;
                    z-index: 1;
                    top: 100%;
                    display: flex;
                    overflow: hidden;
                    width: 100%;
                    box-sizing: border-box;
                    flex-direction: column;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    margin-top: 4px;
                    background-color: var(--default-background);
                    box-shadow: 0 0 20px rgb(0 0 0 / 20%);

                    @include fade-in(0.2s);

                    .search-elem {
                        $img-size: 42px;
                        $gap: 8px;
                        display: flex;
                        overflow: hidden;
                        box-sizing: border-box;
                        padding: 0;
                        padding: $gap;
                        border: none;
                        border-radius: 0;

                        @keyframes stretch {
                            0% {
                                padding: calc($gap / 2) $gap;
                            }

                            100% {
                                padding: $gap;
                            }
                        }

                        animation: stretch 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
                        gap: $gap;
                        text-align: justify;

                        .sugg-img {
                            width: $img-size;
                            height: $img-size;
                            border-radius: 8px;
                        }

                        .sugg-content {
                            position: relative;
                            display: flex;
                            width: calc(100% - $img-size - $gap);
                            flex-direction: column;
                            justify-content: center;
                            gap: 4px;

                            .sugg-title {
                                overflow: hidden;
                                margin: 0;
                                font-size: 14px;
                                font-weight: var(--font-weight-bold);
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }

                            .sugg-desc {
                                overflow: hidden;
                                margin: 0;
                                color: var(--light-fore);
                                font-size: 12px;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }
                }
            }
        }

        .profile-menu-container {
            position: absolute;
            z-index: 1;

            .curr-user {
                position: fixed;
                top: $menu-margin;
                left: $menu-margin;
                overflow: hidden;
                width: 36px;
                height: 36px;
                padding: 0;
                border: 3px solid var(--border-color);
                border-radius: 36px;

                .user-profile {
                    @extend %avatar-fit;

                    width: 100%;
                }
            }

            .profile-menu {
                top: 64px;
                left: 24px;
            }
        }

        .config-menu-container {
            position: absolute;
            z-index: 1;
            display: flex;

            .config-menu-btn {
                position: fixed;
                top: $menu-margin;
                right: $menu-margin;
                height: 32px;
                border: none;
                border-radius: 36px;
                background-color: var(--page-background);
                font-size: 24px;
            }

            .config-menu-btn:hover {
                background-color: var(--default-background);
            }

            .config-menu-btn:active {
                background-color: var(--default-hover);
            }

            .config-menu {
                top: 64px;
                right: 24px;
                opacity: 1;
            }
        }

        .signed-count {
            font-weight: var(--font-weight-bold);
        }

        .block-panel.followed {
            margin-left: auto;
        }

        .followed-container {
            .followed-list {
                display: flex;
                flex-wrap: wrap;
                padding: 8px;
                border-radius: 12px;
                background-color: var(--trans-light-background);
                gap: 4px;

                .followed-btn {
                    display: flex;
                    align-items: center;
                    padding: 6px 8px;
                    border-radius: 12px;
                    font-size: 14px;
                    gap: 6px;

                    .signed {
                        color: green;
                        font-weight: var(--font-weight-bold);
                    }

                    .forum-level {
                        min-width: 24px;
                        padding: 0 2px;
                        border-radius: 24px;
                        font-weight: var(--font-weight-bold);
                        text-align: center;
                    }
                }
            }
        }

        .topic-list {
            display: grid;
            gap: 4px;
            grid-auto-rows: max-content;
            grid-template-columns: repeat(2, 1fr);

            .topic-btn {
                display: flex;
                width: 100%;
                height: 100%;
                align-items: center;
                padding: 12px;
                border-radius: 12px;
                gap: 8px;

                .topic-img {
                    width: 72px;
                    border-radius: 12px;
                }

                .topic-content {
                    display: flex;
                    flex-flow: column wrap;
                    gap: 4px;
                    text-align: justify;

                    .topic-title {
                        display: flex;
                        align-items: center;
                        gap: 6px;

                        [class^="topic-rank"] {
                            padding: 0 4px;
                            border-radius: 4px;
                            background-color: orange;
                            color: var(--default-background);
                            font-weight: var(--font-weight-bold);
                            text-align: center;
                        }

                        .topic-name {
                            font-size: 16px;
                            font-weight: var(--font-weight-bold);
                        }
                    }

                    .topic-desc {
                        color: var(--light-fore);
                        font-size: 14px;
                    }
                }
            }
        }
    }

    .masonry-container {
        display: flex;
        width: calc(100% - 32px);
        max-width: var(--content-max);
        box-sizing: border-box;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .feeds-container {
            width: 100%;
            margin: auto;

            @keyframes feeds-in {
                0% {
                    transform: scale(0.72);
                }

                100% {
                    transform: scale(1);
                }
            }

            @keyframes refresh-btn-in {
                0% {
                    padding: 0 18px;
                    opacity: 0;
                }

                100% {
                    padding: 8px 18px;
                    opacity: 1;
                }
            }

            .feeds-refresh-btn {
                position: fixed;
                z-index: 1;
                bottom: 24px;
                left: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 18px;
                border-width: 2px;
                border-radius: 16px;
                animation: refresh-btn-in 0.4s ease;
                box-shadow: 0 6px 20px rgb(0 0 0 / 30%);
                font-size: 14px;
                font-weight: var(--font-weight-bold);
                gap: 6px;
                transform: translateX(-50%);

                .icon {
                    font-size: 18px;
                }
            }
        }

        .empty-container {
            .no-feed-content {
                color: var(--minimal-fore);
                font-size: small;
                text-align: center;
            }
        }
    }
}
</style>
