<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <div ref="imagesViewer" class="images-viewer" @click="clickModal">
            <div ref="imageContainer" class="image-container dialog-toggle">
                <img ref="currImage" class="curr-image changing" :src="imageArray[curr]"
                    :style="parseCSSRule(imageStyle)">
            </div>

            <div class="control-panel head-controls" :class="{ 'hide': !showControls.top }">
                <ToggleButton class="vli-mode head-btn icon" title="长图模式" v-model="vliMode">chrome_reader_mode
                </ToggleButton>
                <span>|</span>
                <UserButton class="zoom-in head-btn icon" title="缩小" @click="zoomImage(0.5)">
                    zoom_in
                </UserButton>
                <UserButton class="zoom-out head-btn icon" title="放大" @click="zoomImage(-0.5)">
                    zoom_out
                </UserButton>
                <span class="zoom-size">{{ _.round(scale * 100) + "%" }}</span>
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

            <UserButton v-if="imageArray.length > 1" class="control-panel back icon"
                :class="{ 'hide': !showControls.left }" title="上一张" @click="listBack">
                chevron_left
            </UserButton>
            <UserButton v-if="imageArray.length > 1" class="control-panel forward icon"
                :class="{ 'hide': !showControls.right }" title="下一张" @click="listForward">
                chevron_right
            </UserButton>

            <div class="control-panel bottom-controls" :class="{ 'hide': !showControls.bottom }">
                <UserButton v-for="image, index in imageArray" class="bottom-btn"
                    :class="{ 'selected': index === curr }" no-border="all">
                    <img class="image-list" :src="image" alt="" @click="curr = index">
                </UserButton>
            </div>
        </div>
    </UserDialog>
</template>

<script setup lang="ts">
import { EventProxy } from "@/lib/elemental/event-proxy";
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import _ from "lodash";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import UserDialog, { UserDialogOpts } from "../user-dialog";
import ToggleButton from "../utils/toggle-button.vue";
import UserButton from "../utils/user-button.vue";

export interface ImagesViewerOpts {
    content: string | string[] | TiebaPost;
    defaultIndex?: number;
}

const props = withDefaults(defineProps<ImagesViewerOpts>(), {
    defaultIndex: 0,
});

const imageArray: string[] = [];
if (typeof props.content === "string") {
    imageArray.push(props.content);
} else if (Array.isArray(props.content)) {
    imageArray.push(...props.content);
} else {
    _.map(props.content.images, (value) => {
        imageArray.push(value.original);
    });
}

const dialog = ref<InstanceType<typeof UserDialog>>();
const imagesViewer = ref<HTMLDivElement>();
const imageContainer = ref<HTMLDivElement>();
const currImage = ref<HTMLImageElement>();
const curr = ref(props.defaultIndex);
const scale = ref(1.0);
const deg = ref(0);
const imageLeft = ref<Maybe<number>>(undefined);
const imageTop = ref<Maybe<number>>(undefined);
const showControls = ref({
    left: true,
    right: true,
    top: true,
    bottom: true,
});
const vliMode = ref(false);

const imageStyle = computed<CSSRule>(() => {
    return {
        transform: `scale(${scale.value}) rotate(${deg.value}deg)`,
        left: `${imageLeft.value}px`,
        top: `${imageTop.value}px`,
        transition: vliMode.value
            ? "all 0.4s ease, left 0s, top 0.1s ease-out"
            : "all 0.4s ease, left 0s, top 0s",
    };
});

const imageProps = computed(function () {
    const naturalHeight = currImage.value?.naturalHeight ?? 0;
    return {
        naturalHeight: naturalHeight ?? 0,
        scaledHeight: naturalHeight ?? 0 * scale.value,
        vliMaxTop: -(naturalHeight * (1 - scale.value) / 2) + window.innerHeight / 2,
        vliMinTop: -(naturalHeight * scale.value) - (naturalHeight * (1 - scale.value) / 2) + window.innerHeight / 2,
    };
});

const dialogOpts: UserDialogOpts = {
    blurEffect: false,
    shadowMode: true,
    contentStyle: {
        width: "100%",
        height: "100%",
    },
    renderAnimation: "kf-fade-in var(--fast-duration)",
    unloadAnimation: "kf-fade-out var(--fast-duration)",
};

// 状态
const MIN_SIZE = 0.1 as const;
const MAX_SIZE = 8.0 as const;
// VLI = very long image
const VLI_THRESHOLD = 5 as const;
const VLI_WIDTH_SCALE = 2 as const;
const DEFAULT_HIDE_CONTROLS_DELAY = 1000 as const;
const SHOW_CONTROLS_THRESHOLD_X = 180 as const;
const SHOW_CONTROLS_THRESHOLD_Y = 140 as const;

const evproxy = new EventProxy();

onMounted(async () => {
    await nextTick();
    let offsetX = 0, offsetY = 0;

    const showControlsBefore = {
        left: false,
        right: false,
        top: false,
        bottom: false,
    };
    let beforeDefaultHide = true;

    evproxy.on(window, "mousemove", _.throttle(function (e: MouseEvent) {
        const { clientX, clientY } = e;

        const distanceToLeft = clientX;
        const distanceToRight = window.innerWidth - clientX;
        const distanceToTop = clientY;
        const distanceToBottom = window.innerHeight - clientY;

        const dataRef = beforeDefaultHide ? showControlsBefore : showControls.value;

        distanceToLeft <= SHOW_CONTROLS_THRESHOLD_X
            ? dataRef.left = true
            : dataRef.left = false;
        distanceToRight <= SHOW_CONTROLS_THRESHOLD_X
            ? dataRef.right = true
            : dataRef.right = false;
        distanceToTop <= SHOW_CONTROLS_THRESHOLD_Y
            ? dataRef.top = true
            : dataRef.top = false;
        distanceToBottom <= SHOW_CONTROLS_THRESHOLD_Y
            ? dataRef.bottom = true
            : dataRef.bottom = false;
    }, 100, { leading: true }));

    setTimeout(() => {
        showControls.value = {
            ...{
                left: false,
                right: false,
                top: false,
                bottom: false,
            },
            ...showControlsBefore,
        };
        beforeDefaultHide = false;
    }, DEFAULT_HIDE_CONTROLS_DELAY);

    evproxy.on(imagesViewer.value, "wheel", imageWheel, { passive: true });

    evproxy.on(currImage.value, "mousedown", (e: MouseEvent) => {
        if (!currImage.value) return;
        e.preventDefault();
        if (vliMode.value) return;

        offsetX = e.clientX - currImage.value.offsetLeft;
        offsetY = e.clientY - currImage.value.offsetTop;
        document.addEventListener("mousemove", moveHandler);
    });

    evproxy.on(document, "mouseup", (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", moveHandler);
    });

    evproxy.on(currImage.value, "load", function () {
        if (!currImage.value) return;
        vliMode.value = false;

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

        currImage.value.classList.remove("changing");
    });

    evproxy.on(currImage.value, "transitionend", function () {
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

onUnmounted(function () {
    evproxy.release();
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

        if (newTop > imageProps.value.vliMaxTop) {
            imageTop.value = imageProps.value.vliMaxTop;
        }
        if (newTop < imageProps.value.vliMinTop) {
            imageTop.value = imageProps.value.vliMinTop;
        }
    }
});

watch(vliMode, function (newMode) {
    if (newMode && currImage.value && !imageTop.value) {
        imageTop.value = Math.max(
            imageProps.value.vliMinTop,
            -(currImage.value.naturalHeight * (1 - scale.value) / 2),
        );
    }
});

/** 卸载组件 */
function unload() {
    dialog.value?.unload();
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
function imageWheel(e: WheelEvent) {
    if (!currImage.value) return;

    if (!vliMode.value) {
        zoomImage(-e.deltaY / 1000);
    } else {
        if (!imageTop.value) imageTop.value = 0;
        imageTop.value += -e.deltaY / 1000 * window.innerHeight;
    }
}

function clickModal(e: MouseEvent) {
    if (e.target === imageContainer.value) {
        unload();
    }
}
</script>

<style scoped lang="scss">
$panel-margin: 16px;
$panel-radius: 12px;

.images-viewer {
    position: fixed;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inset: 0;
    transition: var(--default-duration);

    .icon {
        color: var(--light-fore);
    }

    .control-panel {
        @include blur-effect;
        position: absolute;
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--light-border-color);
        border-radius: $panel-radius + 6;
        background-color: var(--trans-default-background);
        box-shadow: 0 0 32px rgb(0 0 0 / 40%);
    }

    .head-controls {
        top: $panel-margin;
        margin-bottom: auto;
        transition: var(--default-duration);

        &.hide {
            box-shadow: none;
            transform: translateY(calc(-100% - $panel-margin)) scale(0.85);
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
            transform: translateX(calc(-100% - #{$panel-margin * 2})) scale(0.85);
        }
    }

    .forward {
        right: $panel-margin * 2;

        &.hide {
            box-shadow: none;
            transform: translateX(calc(100% + #{$panel-margin * 2})) scale(0.85);
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
        transition: var(--default-duration);

        &.hide {
            box-shadow: none;
            transform: translateY(calc(100% + $panel-margin)) scale(0.85);
        }

        .bottom-btn {
            overflow: hidden;
            width: 100px;
            height: 75px;
            padding: 0;
            border: none;
            border-radius: $panel-radius - 2;
            background-color: var(--trans-default-background);
            transition: linear var(--xfast-duration);

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
