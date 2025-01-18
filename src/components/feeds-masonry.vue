<template>
    <div ref="masonryWrapper" class="masonry-wrapper">
        <div ref="masonryContainer" class="masonry-container"></div>

        <PostContainer v-for="post in feeds" :key="post.id" :post="post" class="post-elem" dynamic shadow-border
            @click-image="showImages" @assets-loaded="addToLoaded">
        </PostContainer>
    </div>
</template>

<script lang="ts" setup>
import { FeedListResponse, parsePostsFromString, tiebaAPI } from "@/lib/api/tieba";
import { FlexMasonry } from "@/lib/render/layout/flex-masonry";
import { toast } from "@/lib/render/toast";
import { headerProgress, imagesViewer } from "@/lib/render/universal";
import { unreadFeeds } from "@/lib/user-values";
import { requestInstance, spawnOffsetTS, waitUntil } from "@/lib/utils";
import { matchShield, shieldList } from "@/modules/shield";
import { debounce, filter, throttle } from "lodash-es";
import { ComponentPublicInstance, nextTick, onMounted, ref, watch } from "vue";
import PostContainer from "./post-container.vue";

interface Props {
    initFeeds?: TiebaPost[];
    showProgress?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    initFeeds: () => [],
    showProgress: false,
});

const feeds = ref<TiebaPost[]>([]);
const masonryWrapper = ref<HTMLDivElement>();
const masonryContainer = ref<HTMLDivElement>();
const hasMoreFeeds = ref(true);

// 状态
const maxFeeds = 1000;
const nextFeedsMargin = 320;
const unreadTTL = 2;
let currentLoadedFeeds: Element[] = [];
let isFetchingFeeds = false;

const debAddFeeds = debounce(addFeeds, 2000, { leading: true });

let flexMasonry: FlexMasonry;

// 根据视图宽度修改布局
window.addEventListener("resize", throttle(function () {
    flexMasonry.adjustWidth();
    if (flexMasonry.columns !== flexMasonry.calcColumns()) flexMasonry.exec();
}, 100), { passive: true });

onMounted(() => {
    if (!masonryWrapper.value) return;
    if (!masonryContainer.value) return;

    debAddFeeds(props.initFeeds);
    renderMasonry();

    // 页面滚动到底部加载新的推送
    window.addEventListener("scroll", () => {
        if (isFetchingFeeds) return;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        // 在距离屏幕底部约 320px的位置请求下一次推送，这个距离在不故意快速滑动的情况下基本保证无感
        if (scrollTop + clientHeight >= scrollHeight - nextFeedsMargin) {
            if (feeds.value.length < maxFeeds) {
                debAddFeeds();
            }
        }
    });
});

watch(hasMoreFeeds, (newVal) => {
    if (!newVal) {
        toast({
            message: "没有更多推送了",
            type: "warning",
        });
    }
});

/**
 * 向 `feeds` 中追加贴子，若未指定追加项则从推送接口中获取
 * @param newFeeds 指定追加的贴子
 */
async function addFeeds(newFeeds?: TiebaPost[]) {
    if (!newFeeds) newFeeds = [];
    if (isFetchingFeeds) return;

    isFetchingFeeds = true;

    if (newFeeds.length <= 0) {
        const response: FeedListResponse = await requestInstance(tiebaAPI.feedlist());
        if (response) {
            newFeeds = parsePostsFromString(response.data.html);
            hasMoreFeeds.value = !!response.data.has_more;

            // 屏蔽推送
            const ruleList = shieldList.get();
            newFeeds = filter(newFeeds, feed => {
                for (const rule of ruleList) {
                    if (matchShield(rule, feed.author.name, "username") ||
                        matchShield(rule, feed.title, "content") ||
                        matchShield(rule, feed.content, "content")) {
                        return false;
                    }
                }
                return true;
            });

            // 展示进度
            if (props.showProgress) {
                headerProgress({ calc: () => currentLoadedFeeds.length / (newFeeds?.length ?? 0) * 100 });
            }
        }
    }

    feeds.value.push(...newFeeds);

    await waitUntil(() => currentLoadedFeeds.length >= (newFeeds ?? []).length);
    renderMasonry().then(function () {
        unreadFeeds.set(newFeeds ? newFeeds : [], spawnOffsetTS(0, 0, 0, unreadTTL));
        currentLoadedFeeds.length = 0;
        isFetchingFeeds = false;
    });
}

/** 创建布局，若布局已存在则追加资源 */
async function renderMasonry() {
    await nextTick(() => {
        if (!masonryContainer.value) return;

        if (!flexMasonry) {
            flexMasonry = new FlexMasonry({
                container: masonryContainer.value,
                // items: ".post-elem.assets-loaded",
                columnWidth: 320,
                gap: 12,
                fixScrollOffset: true,
            });
        } else {
            flexMasonry.append(".masonry-wrapper > .post-elem.assets-loaded", 60);
        }
    });
}

/** 将已经加载好的贴子添加到 `currentLoadedFeeds` */
function addToLoaded(payload: ComponentPublicInstance) {
    currentLoadedFeeds.push(payload.$el);
}

/** 展示图片 */
function showImages(images: string[], index: number) {
    imagesViewer({
        content: images,
        defaultIndex: index,
    });
}

function refresh() {
    if (!isFetchingFeeds) {
        feeds.value.length = 0;
        flexMasonry.clear();
        debAddFeeds();
    }
}

function refreshAndMove() {
    window.scrollTo({ top: masonryContainer.value?.offsetTop, behavior: "smooth" });
    refresh();
}

defineExpose({
    feeds,
    isFetchingFeeds,
    refresh,
    refreshAndMove,
});
</script>

<style lang="scss" scoped>
.masonry-wrapper {
    display: flex;
    width: 100%;
    max-width: var(--content-max);
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .masonry-container {
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

        .post-elem {
            animation: feeds-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.2);
        }

        .post-elem:not(:hover, :active, :focus) {
            box-shadow: none;
        }
    }
}

.masonry-wrapper > .post-elem {
    position: absolute !important;
    visibility: hidden !important;
}
</style>
