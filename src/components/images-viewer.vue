<template>
    <div ref="imageViewer" class="images-viewer dialog-toggle" @wheel="imageWheel">
        <div class="image-container dialog-toggle">
            <img ref="currImage" class="curr-image" :src="imageArray[curr]" alt="">
        </div>

        <div class="control-panel head-controls" :class="{ 'hide': !showControls }">
            <UserButton class="zoom-in head-btn icon" title="缩小" @click="zoomImage(0.5)">
                zoom_in
            </UserButton>
            <UserButton class="zoom-out head-btn icon" title="放大" @click="zoomImage(-0.5)">
                zoom_out
            </UserButton>
            <span class="zoom-size">{{ round(scale * 100) + "%" }}</span>
            <span>|</span>
            <UserButton class="turn-left head-btn icon" title="逆时针旋转" @click="rotateImage(-90)">
                undo
            </UserButton>
            <UserButton class=" turn-right head-btn icon" title="顺时针旋转" @click="rotateImage(90)">
                redo
            </UserButton>
            <span>|</span>
            <UserButton class="close head-btn icon" title="关闭" @click="unload">
                close
            </UserButton>
        </div>

        <UserButton v-if="imageArray.length > 1" class="control-panel back icon" :class="{ 'hide': !showControls }"
            title="上一张" @click="listBack">
            chevron_left
        </UserButton>
        <UserButton v-if="imageArray.length > 1" class="control-panel forward icon" :class="{ 'hide': !showControls }"
            title="下一张" @click="listForward">
            chevron_right
        </UserButton>

        <div class="control-panel bottom-controls" :class="{ 'hide': !showControls }">
            <UserButton v-for="image, index in imageArray" class="bottom-btn" :class="{ 'selected': index === curr }"
                no-border="all">
                <img class="image-list" :src="image" alt="" @click="changeCurr(index)">
            </UserButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { unloadDialog } from "@/lib/render";
import { map, round } from "lodash-es";
import { onMounted, ref } from "vue";
import UserButton from "./utils/user-button.vue";

export interface ImageViewerProps {
    content: string | string[] | TiebaPost
    defaultIndex?: number
}

const props = withDefaults(defineProps<ImageViewerProps>(), {
    defaultIndex: 0,
});

const imageArray: string[] = [];
if (typeof props.content === "string") {
    imageArray.push(props.content);
} else if (Array.isArray(props.content)) {
    imageArray.push(...props.content);
} else {
    map(props.content.images, (value) => {
        imageArray.push(value.original);
    });
}

const emit = defineEmits(["RequestClose"]);

const imageViewer = ref<HTMLDivElement>();
const currImage = ref<HTMLImageElement>();
const curr = ref(props.defaultIndex);
const scale = ref(1.0);
const deg = ref(0);
const showControls = ref(true);

// 状态
const minSize = 0.2;
const maxSize = 4.0;

onMounted(() => {
    let offsetX = 0, offsetY = 0;

    currImage.value?.addEventListener("mousedown", (e: MouseEvent) => {
        if (!currImage.value) return;
        e.preventDefault();

        offsetX = e.clientX - currImage.value.offsetLeft;
        offsetY = e.clientY - currImage.value.offsetTop;

        document.addEventListener("mousemove", moveHandler);
    });

    document.addEventListener("mouseup", (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", moveHandler);
    });

    function moveHandler(e: MouseEvent) {
        if (!currImage.value) return;
        currImage.value.style.left = `${(e.clientX - offsetX)}px`;
        currImage.value.style.top = `${(e.clientY - offsetY)}px`;
    }
});

/** 卸载组件 */
function unload() {
    emit("RequestClose");
    unloadDialog();
}

/** 切换当前显示的图片 */
function changeCurr(newIndex: number) {
    curr.value = newIndex;
    transformDefault();
}

/** 上一张照片 */
function listBack() {
    if (curr.value > 0) changeCurr(--curr.value);
}

/** 下一张照片 */
function listForward() {
    if (curr.value < imageArray.length - 1) changeCurr(++curr.value);
}

/** 更新照片的变形状态 */
function transformImage() {
    if (currImage.value) {
        currImage.value.style.transform = `scale(${scale.value}) rotate(${deg.value}deg)`;
    }
}

/** 将照片的变形状态重置 */
function transformDefault() {
    scale.value = 1.0;
    deg.value = 0;
    transformImage();
}

/** 缩放图片 */
function zoomImage(delta: number) {
    scale.value += delta;
    scale.value < minSize
        ? scale.value = minSize
        : scale.value > maxSize
            ? scale.value = maxSize
            : true;
    transformImage();
}

/** 旋转图片 */
function rotateImage(delta: number) {
    deg.value += delta;
    deg.value % 360
        ? true
        : deg.value = 0;
    transformImage();
}

/** 鼠标滚轮事件 */
function imageWheel(event: WheelEvent) {
    event.preventDefault();
    zoomImage(-event.deltaY / 1000);
    showControls.value = event.deltaY > 0;
}
</script>

<style scoped lang="scss">
@use "@/stylesheets/main/animations" as *;
@use "@/stylesheets/main/remixed-main" as *;

$panel-margin: 16px;
$panel-radius: 12px;

.images-viewer {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: $default-animation-duration;

    .icon {
        color: var(--light-fore);
    }

    .control-panel {
        position: absolute;
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--light-border-color);
        border-radius: $panel-radius;
        background-color: var(--trans-default-background);
        box-shadow: 0 0 32px rgb(0 0 0 / 40%);
        gap: 2px;

        @include blur-effect;
    }

    .head-controls {
        top: $panel-margin;
        margin-bottom: auto;
        transition: $default-animation-duration;

        &.hide {
            box-shadow: none;
            transform: translateY(calc(-100% - $panel-margin));
        }

        .head-btn {
            width: 36px;
            height: 36px;
            border-radius: $panel-radius;
            background-color: unset;
            box-shadow: none;
        }

        .head-btn:hover {
            background-color: var(--default-background);
            color: var(--tieba-theme-color);
        }

        .close:hover {
            color: var(--error-color);
        }

        span {
            color: var(--minimal-fore);
            font-family: var(--code-monospace);
        }

        .zoom-size {
            padding: 10px;
        }
    }

    .back,
    .forward {
        height: 60px;
        box-shadow: 0 0 20px rgb(0 0 0 / 10%);
        font-size: large;
    }

    .back {
        left: $panel-margin * 2;

        &.hide {
            box-shadow: none;
            transform: translateX(calc(-100% - #{$panel-margin * 2}));
        }
    }

    .forward {
        right: $panel-margin * 2;

        &.hide {
            box-shadow: none;
            transform: translateX(calc(100% + #{$panel-margin * 2}));
        }
    }

    .back:hover,
    .forward:hover {
        background-color: var(--default-background);
    }

    .back:focus,
    .forward:focus {
        box-shadow: 0 0 0 2px var(--tieba-theme-color);
    }

    .image-container {
        display: flex;
        width: auto;
        align-items: center;
        justify-content: center;
        margin: auto;

        .curr-image {
            position: absolute;
            object-fit: contain;
            transition: all 0.4s ease, left 0s, top 0s;
        }
    }

    .bottom-controls {
        bottom: $panel-margin;
        display: flex;
        margin-top: auto;
        gap: 4px;
        transition: $default-animation-duration;

        &.hide {
            box-shadow: none;
            transform: translateY(calc(100% + $panel-margin));
        }

        .bottom-btn {
            overflow: hidden;
            width: 100px;
            height: 75px;
            padding: 0;
            border: none;
            border-radius: $panel-radius - 6;
            background-color: var(--trans-default-background);

            @include transition-prototype(all linear, 0.1s);

            .image-list {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .bottom-btn.selected {
            border: 3px solid var(--tieba-theme-color);
        }
    }
}
</style>
