<template>
    <div ref="imageViewer" class="images-viewer dialog-toggle" @wheel="imageWheel">
        <div class="image-container dialog-toggle">
            <img ref="currImage" class="curr-image changing" :src="imageArray[curr]" :style="parseCSSRule(imageStyle)">
        </div>

        <div class="control-panel head-controls" :class="{ 'hide': !showControls }">
            <ToggleButton class="vli-mode head-btn icon" title="长图模式" v-model="vliMode">chrome_reader_mode
            </ToggleButton>
            <span>|</span>
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
                <img class="image-list" :src="image" alt="" @click="curr = index">
            </UserButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import { unloadDialog } from "@/lib/render";
import { map, round } from "lodash-es";
import { computed, onMounted, ref, watch } from "vue";
import ToggleButton from "./utils/toggle-button.vue";
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
const imageLeft = ref<Maybe<number>>(undefined);
const imageTop = ref<Maybe<number>>(undefined);
const showControls = ref(true);
const vliMode = ref(false);

const imageStyle = computed<CSSRule>(() => {
    return {
        transform: `scale(${scale.value}) rotate(${deg.value}deg)`,
        left: `${imageLeft.value}px`,
        top: `${imageTop.value}px`,
    };
});

const imageTransition = computed(function () {
    return vliMode.value
        ? "all 0.4s ease, left 0s, top 0.1s ease-out"
        : "all 0.4s ease, left 0s, top 0s";
});

// 状态
const MIN_SIZE = 0.1 as const;
const MAX_SIZE = 8.0 as const;
// VLI = very long image
const VLI_THRESHOLD = 5 as const;
const VLI_WIDTH_SCALE = 2 as const;

const imageProps = {
    naturalHeight: 0,
    scaledHeight: 0,
    vliMaxTop: 0,
    vliMinTop: 0,
};

onMounted(() => {
    let offsetX = 0, offsetY = 0;

    currImage.value?.addEventListener("mousedown", (e: MouseEvent) => {
        if (!currImage.value) return;
        e.preventDefault();
        if (vliMode.value) return;

        offsetX = e.clientX - currImage.value.offsetLeft;
        offsetY = e.clientY - currImage.value.offsetTop;
        document.addEventListener("mousemove", moveHandler);
    });

    document.addEventListener("mouseup", (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", moveHandler);
    });

    currImage.value?.addEventListener("load", function () {
        if (!currImage.value) return;

        (() => {
            if (currImage.value.naturalHeight < window.innerHeight &&
                currImage.value.naturalWidth < window.innerWidth) {
                scale.value = 1;
                return;
            }

            if (currImage.value.naturalHeight / currImage.value.naturalWidth >= VLI_THRESHOLD) {
                vliMode.value = true;
                scale.value = window.innerWidth / VLI_WIDTH_SCALE / currImage.value.naturalWidth;
                imageLeft.value = undefined;
                return;
            }

            vliMode.value = false;
            scale.value = Math.min(
                window.innerWidth / currImage.value.naturalWidth,
                window.innerHeight / currImage.value.naturalHeight,
            );
        })();

        imageProps.naturalHeight = currImage.value.naturalHeight;
        imageProps.scaledHeight = imageProps.naturalHeight * scale.value;
        imageProps.vliMaxTop = -(imageProps.naturalHeight * (1 - scale.value) / 2) + window.innerHeight / 2;
        imageProps.vliMinTop = -imageProps.scaledHeight - (imageProps.naturalHeight * (1 - scale.value) / 2) + window.innerHeight / 2;

        currImage.value.classList.remove("changing");
    });

    currImage.value?.addEventListener("transitionend", function () {
        if (Math.abs(deg.value) >= 360) {
            currImage.value?.classList.add("changing");
            deg.value = Math.abs(deg.value) % 360;
            currImage.value?.offsetHeight;  // 强制重绘
            currImage.value?.classList.remove("changing");
        }
    });

    function moveHandler(e: MouseEvent) {
        if (!currImage.value) return;
        imageLeft.value = e.clientX - offsetX;
        imageTop.value = e.clientY - offsetY;
    }
});

watch(curr, function () {
    currImage.value?.classList.add("changing");
    deg.value = 0;
    imageLeft.value = undefined;
    imageTop.value = undefined;
});

watch(imageTop, function (newTop) {
    if (vliMode.value) {
        if (!currImage.value || !imageTop.value || !newTop) return;

        if (newTop > imageProps.vliMaxTop) {
            imageTop.value = imageProps.vliMaxTop;
        }
        if (newTop < imageProps.vliMinTop) {
            imageTop.value = imageProps.vliMinTop;
        }
    }
});

watch(vliMode, function (newMode) {
    if (newMode && currImage.value && !imageTop.value) {
        imageTop.value = Math.max(
            imageProps.vliMinTop,
            -(currImage.value.naturalHeight * (1 - scale.value) / 2),
        );
    }
});

/** 卸载组件 */
function unload() {
    emit("RequestClose");
    unloadDialog();
}

/** 上一张照片 */
function listBack() {
    if (curr.value > 0) curr.value--;
}

/** 下一张照片 */
function listForward() {
    if (curr.value < imageArray.length - 1) curr.value++;
}

/** 缩放图片 */
function zoomImage(delta: number) {
    scale.value += delta;
    if (scale.value < MIN_SIZE) {
        scale.value = MIN_SIZE;
    }
    if (scale.value > MAX_SIZE) {
        scale.value = MAX_SIZE;
    }
}

/** 旋转图片 */
function rotateImage(delta: number) {
    deg.value += delta;
}

/** 鼠标滚轮事件 */
function imageWheel(event: WheelEvent) {
    event.preventDefault();
    if (!currImage.value) return;

    if (!vliMode.value) {
        zoomImage(-event.deltaY / 1000);
        showControls.value = event.deltaY > 0;
    } else {
        if (!imageTop.value) imageTop.value = 0;
        imageTop.value += -event.deltaY / 1000 * window.innerHeight;
        showControls.value = event.deltaY < 0;
    }
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
        border-radius: $panel-radius + 6;
        background-color: var(--trans-default-background);
        box-shadow: 0 0 32px rgb(0 0 0 / 40%);

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
            padding: 0;
            border-radius: $panel-radius;
            background-color: unset;
            box-shadow: none;
            font-size: 16px;

            &:hover {
                background-color: var(--default-background);
                color: var(--tieba-theme-color);
            }

            &.toggle-on {
                @extend %filled-icon;
                background-color: var(--tieba-theme-color);
                color: var(--default-background);

                &:hover {
                    filter: brightness(1.2);
                }
            }
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
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;

        .curr-image {
            position: absolute;
            object-fit: contain;
            transition: v-bind("imageTransition");

            &.changing {
                display: none;
                transition: none;
            }
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
            border-radius: $panel-radius - 2;
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
