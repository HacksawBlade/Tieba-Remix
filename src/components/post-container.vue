<template>
    <UserButton
        ref="postContainer"
        :is-anchor="true"
        class="post-container"
        :href="'/p/' + props.post.id"
        target="_blank"
        :class="{
            dynamic: props.dynamic,
            'assets-loaded': loadedAssets === props.post.images.length,
        }"
    >
        <div>
            <UserButton
                :is-anchor="true"
                class="forum-btn"
                :shadow-border="true"
                :href="props.post.forum.href"
                target="_blank"
            >
                {{ props.post.forum.name + " 吧" }}
            </UserButton>
        </div>

        <div class="main-content">
            <p class="title">{{ props.post.title }}</p>
            <p v-if="props.post.content && props.post.content !== ' '" class="content">
                {{ props.post.content }}
            </p>
        </div>

        <div v-if="props.post.images.length > 0" class="img-container">
            <UserButton
                v-for="(image, index) in props.post.images"
                class="img-button"
                @click="showImage($event, index)"
                no-border="all"
            >
                <img
                    class="post-img"
                    :src="isIntersecting ? image.original : image.thumb"
                    @load="addLoadedPost"
                />
            </UserButton>
        </div>

        <div class="bottom-controls">
            <UserButton
                class="author"
                :is-anchor="true"
                :href="props.post.author.href"
                target="_blank"
                :shadow-border="true"
            >
                <img
                    class="author-portrait"
                    :src="
                        isIntersecting
                            ? tiebaAPI.URL_profile(props.post.author.portrait)
                            : ''
                    "
                />
                <div class="author-info">
                    <div class="author-name">{{ props.post.author.name }}</div>
                    <div class="post-time">{{ props.post.time }}</div>
                </div>
            </UserButton>
            <div class="replies">{{ props.post.replies }}</div>
        </div>
    </UserButton>
</template>

<script setup lang="ts">
import type { GetThreadImagesResponse } from "@/lib/api/tieba";
import { tiebaAPI } from "@/lib/api/tieba";
import { renderDialog } from "@/lib/render";
import { currentStorage, highQualityImage, HOME_FEED_IMAGES } from "@/lib/user-values";
import _ from "lodash";
import { UserButton } from "user-view";
import { onMounted, ref } from "vue";
import type { AwaitDialogOpts } from "./await-dialog.vue";
import AwaitDialog from "./await-dialog.vue";
import { imagesViewer } from "./images-viewer";

interface Props {
    post: TiebaPost;
    lazyLoad?: boolean;
    dynamic?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    lazyLoad: false,
    dynamic: false,
});

const emit = defineEmits(["assetsLoaded"]);

const postContainer = ref<InstanceType<typeof UserButton>>();
const isIntersecting = ref(!props.lazyLoad);
const loadedAssets = ref(0);

onMounted(() => {
    if (!postContainer.value) {
        return;
    }

    if (props.post.images.length === 0) {
        emit("assetsLoaded", postContainer.value);
    }

    if (!props.lazyLoad) {
        return;
    }
    // 进入视图后再加载图片
    const iObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                isIntersecting.value = true;
                iObs.disconnect();
            }
        });
    });

    iObs.observe(postContainer.value.$el);
});

async function showImage(e: MouseEvent, index: number) {
    e.preventDefault();
    if (
        !_.isNil(currentStorage.get(HOME_FEED_IMAGES)) &&
        !_.isNil(currentStorage.get(HOME_FEED_IMAGES)[+props.post.id])
    ) {
        imagesViewer({
            content: currentStorage.get(HOME_FEED_IMAGES)[+props.post.id],
            defaultIndex: index,
        });
    } else {
        renderDialog<AwaitDialogOpts>(
            AwaitDialog,
            {
                unloadPred: () =>
                    !_.isNil(currentStorage.get(HOME_FEED_IMAGES)) &&
                    !_.isNil(currentStorage.get(HOME_FEED_IMAGES)[+props.post.id]),
            },
            {
                unloaded() {
                    imagesViewer({
                        content: pictureList,
                        defaultIndex: index,
                    });
                },
            },
        );

        const response: GetThreadImagesResponse = await (
            await tiebaAPI.getThreadImages(+props.post.id, true)
        ).json();
        const pictureList: ThreadPicture[] = _(response!.data.pic_list)
            .keys()
            .sortBy((key) => parseInt(key.slice(1)))
            .map((key) => {
                const value = response!.data.pic_list[key];
                return {
                    original: highQualityImage.get()
                        ? value.img.original.waterurl
                        : value.img.screen.waterurl,
                    thumbnail: value.img.medium.url,
                };
            })
            .value();
        currentStorage.set(HOME_FEED_IMAGES, {
            ...currentStorage.get(HOME_FEED_IMAGES),
            [+props.post.id]: pictureList,
        });
    }
}

function addLoadedPost() {
    loadedAssets.value += 1;
    if (loadedAssets.value === props.post.images.length) {
        emit("assetsLoaded", postContainer.value);
    }
}
</script>

<style scoped lang="scss">
a {
    color: unset;
    text-decoration: none;
}

p {
    margin: 0;
}

img::before {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: var(--light-background);
    content: "";
}

.dynamic {
    .img-button {
        min-width: 30% !important;
        flex: unset !important;
        flex-grow: 1 !important;
    }
}

.post-container {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    flex-direction: column;
    padding: 16px;
    border-radius: 16px;
    background-color: var(--default-background);
    cursor: pointer;
    gap: 20px;
    text-align: justify;

    .forum-btn {
        border-radius: 24px;
        font-size: 14px;
    }

    .forum-btn:not(:hover, :active, :focus) {
        background-color: var(--light-background);
        box-shadow: none;
    }

    .main-content {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .title {
            margin: 0;
            color: var(--highlight-fore);
            font-weight: var(--font-weight-bold);
        }

        .content {
            overflow: hidden;
            color: var(--light-fore);
            font-size: 14px;
            text-overflow: ellipsis;
        }
    }

    .img-container {
        display: flex;
        overflow: hidden;
        flex-wrap: wrap;
        border-radius: 16px;
        gap: 6px;

        .img-button {
            overflow: hidden;
            min-width: 40%;
            height: 144px;
            flex: 1;
            padding: 0;
            border: none;
            border-radius: 0;

            .post-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: 0.4s cubic-bezier(0, 0, 0.2, 1);
            }

            .post-img:hover {
                scale: 1.2;
            }
        }
    }

    .bottom-controls {
        display: flex;
        align-items: center;
        gap: 12px;

        .author {
            display: flex;
            align-items: center;
            padding: 0;
            border-radius: 24px;
            background-color: unset;

            .author-portrait {
                width: 32px;
                height: 32px;
                border-radius: 24px;
                object-fit: cover;
            }

            .author-info {
                display: flex;
                flex-direction: column;
                padding: 0 10px;
                text-align: left;

                .author-name {
                    font-size: 14px;
                    font-weight: var(--font-weight-bold);
                }

                .post-time {
                    color: var(--minimal-fore);
                    font-size: 12px;
                }
            }
        }

        .author:not(:hover, :active, :focus) {
            box-shadow: none;
        }

        .replies {
            display: flex;
            min-width: 16px;
            align-items: center;
            border-radius: 24px;
            margin-left: auto;
            color: var(--light-fore);
            font-family: var(--code-zh);
            font-size: 13px;
            font-weight: var(--font-weight-bold);
        }

        .replies::before {
            @extend %icon;
            margin-right: 6px;
            content: "forum";
            font-size: 16px;
            font-weight: var(--font-weight-normal);
        }
    }
}
</style>
