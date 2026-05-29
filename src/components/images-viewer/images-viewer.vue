<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <div ref="imagesViewer" class="images-viewer" @click="clickModal">
            <div ref="imageContainer" class="image-container dialog-toggle">
                <img
                    ref="currImage"
                    class="curr-image changing"
                    :src="imageArray[curr]"
                    :style="parseCSSRule(imageStyle)" />
            </div>

            <div class="control-panel head-controls" :class="{ hide: !showControls.top }">
                <UserToggle
                    class="vli-mode head-btn icon"
                    title="长图模式"
                    v-model="vliMode"
                    >chrome_reader_mode
                </UserToggle>
                <span>|</span>
                <UserButton
                    class="zoom-in head-btn icon"
                    title="缩小"
                    @click="zoomImage(0.5)">
                    zoom_in
                </UserButton>
                <UserButton
                    class="zoom-out head-btn icon"
                    title="放大"
                    @click="zoomImage(-0.5)">
                    zoom_out
                </UserButton>
                <span class="zoom-size">{{ _.round(scale * 100) + "%" }}</span>
                <span>|</span>
                <UserButton
                    class="turn-left head-btn icon"
                    title="逆时针旋转"
                    @click="rotateImage(-90)">
                    undo
                </UserButton>
                <UserButton
                    class="turn-right head-btn icon"
                    title="顺时针旋转"
                    @click="rotateImage(90)">
                    redo
                </UserButton>
                <span>|</span>
                <UserButton class="close head-btn icon" title="关闭" @click="unload">
                    close
                </UserButton>
            </div>

            <UserButton
                v-if="imageArray.length > 1"
                class="control-panel back icon"
                :class="{ hide: !showControls.left }"
                title="上一张"
                @click="listBack">
                chevron_left
            </UserButton>
            <UserButton
                v-if="imageArray.length > 1"
                class="control-panel forward icon"
                :class="{ hide: !showControls.right }"
                title="下一张"
                @click="listForward">
                chevron_right
            </UserButton>

            <div
                ref="bottomPanel"
                class="control-panel bottom-controls-wrapper"
                :class="{ hide: !showControls.bottom }">
                <div class="bottom-controls-container">
                    <div ref="thumbContainer" class="thumb-container">
                        <UserButton
                            v-for="(thumb, index) in thumbArray"
                            class="bottom-btn"
                            :class="{ selected: index === curr }"
                            no-border="all">
                            <img
                                class="image-list"
                                alt=""
                                :data-lazyload="thumb"
                                @click="curr = index" />
                        </UserButton>
                    </div>
                </div>
                <div class="bottom-panel-scroll-bar"></div>
            </div>
        </div>
    </UserDialog>
</template>

<script setup lang="ts">
import { dom } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import type { CSSRule } from "@/lib/elemental/styles";
import { parseCSSRule } from "@/lib/elemental/styles";
import _ from "lodash";
import type { UserDialogOpts } from "user-view";
import { UserButton, UserDialog, UserToggle } from "user-view";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export interface ImagesViewerOpts {
    content: string | string[] | TiebaPost | ThreadPicture[];
    defaultIndex?: number;
}

interface ControlDirectionMap<T> {
    left: T;
    right: T;
    top: T;
    bottom: T;
}

const props = withDefaults(defineProps<ImagesViewerOpts>(), {
    defaultIndex: 0,
});

const imageArray: string[] = [];
const thumbArray: string[] = [];
if (typeof props.content === "string") {
    imageArray.push(props.content);
    thumbArray.push(props.content);
} else if (Array.isArray(props.content)) {
    if (typeof props.content[0] === "string") {
        imageArray.push(...(props.content as string[]));
        thumbArray.push(...(props.content as string[]));
    } else {
        _.forEach(props.content as ThreadPicture[], (value) => {
            imageArray.push(value.original);
            thumbArray.push(value.thumbnail);
        });
    }
} else {
    _.forEach((props.content as TiebaPost).images, (value) => {
        imageArray.push(value.original);
        thumbArray.push(value.thumb);
    });
}

const dialog = ref<InstanceType<typeof UserDialog>>();
const imagesViewer = ref<HTMLDivElement>();
const imageContainer = ref<HTMLDivElement>();
const currImage = ref<HTMLImageElement>();
const bottomPanel = ref<HTMLDivElement>();
const thumbContainer = ref<HTMLDivElement>();
const curr = ref(props.defaultIndex);
const scale = ref(1.0);
const deg = ref(0);
const imageLeft = ref<Maybe<number>>(undefined);
const imageTop = ref<Maybe<number>>(undefined);
const showControls = ref<ControlDirectionMap<boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
});
const lockControls = ref<ControlDirectionMap<boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
});
const vliMode = ref(false);

const imageStyle = computed<CSSRule>(() => ({
    transform: `scale(${scale.value}) rotate(${deg.value}deg)`,
    left: `${imageLeft.value}px`,
    top: `${imageTop.value}px`,
    transition: vliMode.value
        ? "all 0.4s ease, left 0s, top 0.1s ease-out"
        : "all 0.4s ease, left 0s, top 0s",
}));

const imageProps = computed(() => {
    const naturalHeight = currImage.value?.naturalHeight ?? 0;
    return {
        naturalHeight: naturalHeight ?? 0,
        scaledHeight: naturalHeight ?? 0 * scale.value,
        vliMaxTop: -((naturalHeight * (1 - scale.value)) / 2) + window.innerHeight / 2,
        vliMinTop:
            -(naturalHeight * scale.value) -
            (naturalHeight * (1 - scale.value)) / 2 +
            window.innerHeight / 2,
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
    uniqueName: "images-viewer",
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
let lastMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lastControlTimeout: ControlDirectionMap<number> = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
let thumbLazyloadObserver: IntersectionObserver;

onMounted(async () => {
    await nextTick();

    if (!thumbContainer.value) return;
    const currentBottom = dom(".bottom-btn", thumbContainer.value, [])[
        props.defaultIndex
    ];
    currentBottom.scrollIntoView({
        inline: "center",
    });

    let offsetX = 0,
        offsetY = 0;

    evproxy.on(
        window,
        "mousemove",
        _.throttle(
            (e: MouseEvent) => {
                const { clientX, clientY } = e;
                lastMousePos = { x: clientX, y: clientY };
                showControls.value = verifyPos();
            },
            100,
            { leading: true },
        ),
    );

    lockControlsTemporarily("all", DEFAULT_HIDE_CONTROLS_DELAY);

    evproxy.on(imagesViewer.value, "wheel", imageWheel, { passive: true });

    evproxy.on(currImage.value, "mousedown", (e: MouseEvent) => {
        if (!currImage.value) {
            return;
        }
        e.preventDefault();
        if (vliMode.value) {
            return;
        }

        offsetX = e.clientX - currImage.value.offsetLeft;
        offsetY = e.clientY - currImage.value.offsetTop;
        document.addEventListener("mousemove", moveHandler);
    });

    evproxy.on(document, "mouseup", (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", moveHandler);
    });

    evproxy.on(currImage.value, "load", () => {
        if (!currImage.value) {
            return;
        }
        vliMode.value = false;

        (() => {
            if (
                currImage.value.naturalHeight < window.innerHeight &&
                currImage.value.naturalWidth < window.innerWidth
            ) {
                scale.value = 1;
                return;
            }

            if (
                currImage.value.naturalHeight / currImage.value.naturalWidth >=
                VLI_THRESHOLD
            ) {
                vliMode.value = true;
                scale.value =
                    window.innerWidth / VLI_WIDTH_SCALE / currImage.value.naturalWidth;
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

    evproxy.on(currImage.value, "transitionend", () => {
        if (Math.abs(deg.value) >= 360) {
            currImage.value?.classList.add("changing");
            deg.value = Math.abs(deg.value) % 360;
            currImage.value?.offsetHeight; // force reflow
            currImage.value?.classList.remove("changing");
        }
    });

    thumbLazyloadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                (entry.target as HTMLImageElement).src =
                    (entry.target as HTMLImageElement).dataset.lazyload ?? "";
                thumbLazyloadObserver.unobserve(entry.target);
            }
        });
    });

    const bottomPanelScrollBar = dom<"div">(
        ".bottom-panel-scroll-bar",
        bottomPanel.value,
    );
    const bottomContainer = dom<"div">(".bottom-controls-container", bottomPanel.value);
    if (bottomPanel.value) {
        dom("img", bottomPanel.value, []).forEach((img) => {
            thumbLazyloadObserver.observe(img);
        });

        if (bottomPanelScrollBar && bottomContainer) {
            const scrollBarScale =
                bottomContainer.clientWidth / bottomContainer.scrollWidth;
            if (scrollBarScale >= 1) {
                bottomPanelScrollBar.style.display = "none";
            }
            bottomPanelScrollBar.style.width = `${scrollBarScale * 100}%`;
        }
    }

    evproxy.on(
        bottomPanel.value,
        "wheel",
        (e: WheelEvent) => {
            e.stopPropagation();
            if (!bottomContainer) {
                return;
            }

            if (e.deltaX === 0 && e.deltaY !== 0) {
                bottomContainer.scrollBy({
                    left: e.deltaY,
                });
            } else if (e.deltaX !== 0 && e.deltaY === 0) {
                bottomContainer.scrollBy({
                    left: e.deltaX,
                });
            }
            if (bottomPanelScrollBar) {
                bottomPanelScrollBar.style.left = `${(bottomContainer.scrollLeft / bottomContainer.scrollWidth) * 100}%`;
            }
        },
        { passive: false },
    );

    function moveHandler(e: MouseEvent) {
        if (!currImage.value) {
            return;
        }
        imageLeft.value = e.clientX - offsetX;
        imageTop.value = e.clientY - offsetY;
    }
});

onUnmounted(() => {
    evproxy.release();
    thumbLazyloadObserver.disconnect();
});

watch(curr, () => {
    currImage.value?.classList.add("changing");
    deg.value = 0;
    imageLeft.value = undefined;
    imageTop.value = undefined;
});

watch(imageTop, (newTop) => {
    if (vliMode.value) {
        if (!currImage.value || !imageTop.value || !newTop) {
            return;
        }

        if (newTop > imageProps.value.vliMaxTop) {
            imageTop.value = imageProps.value.vliMaxTop;
        }
        if (newTop < imageProps.value.vliMinTop) {
            imageTop.value = imageProps.value.vliMinTop;
        }
    }
});

watch(vliMode, (newMode) => {
    lockControlsTemporarily("top", DEFAULT_HIDE_CONTROLS_DELAY);
    if (newMode && currImage.value && !imageTop.value) {
        imageTop.value = Math.max(
            imageProps.value.vliMinTop,
            -((currImage.value.naturalHeight * (1 - scale.value)) / 2),
        );
    }
});

/** 卸载组件 */
function unload() {
    dialog.value?.unload();
}

/** 上一张照片 */
function listBack() {
    if (curr.value > 0) {
        curr.value--;
    }
}

/** 下一张照片 */
function listForward() {
    if (curr.value < imageArray.length - 1) {
        curr.value++;
    }
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
    if (!currImage.value) {
        return;
    }

    if (!vliMode.value) {
        zoomImage(-e.deltaY / 1000);
    } else {
        imageTop.value ??= 0;
        imageTop.value += (-e.deltaY / 1000) * window.innerHeight;
    }
}

function clickModal(e: MouseEvent) {
    if (e.target === imageContainer.value) {
        unload();
    }
}

/**
 * 暂时锁定某个方向的控件，支持直接锁定全部控件
 * @param direction 方向
 * @param timeout 超时时间
 */
function lockControlsTemporarily(
    direction: keyof ControlDirectionMap<unknown> | "all",
    timeout: number,
) {
    if (direction !== "all") {
        lock(direction);
    } else {
        lock("left");
        lock("right");
        lock("top");
        lock("bottom");
    }

    function lock(direction: keyof ControlDirectionMap<unknown>) {
        lockControls.value[direction] = true;
        if (lastControlTimeout[direction]) {
            clearTimeout(lastControlTimeout[direction]);
        }
        showControls.value[direction] = true;
        lastControlTimeout[direction] = setTimeout(() => {
            lockControls.value[direction] = false;
            showControls.value = verifyPos();
        }, timeout);
    }
}

/**
 * 验证光标位置，返回控件显示状态
 * @param pos 光标位置
 */
function verifyPos(pos = lastMousePos) {
    const distanceToLeft = pos.x;
    const distanceToRight = window.innerWidth - pos.x;
    const distanceToTop = pos.y;
    const distanceToBottom = window.innerHeight - pos.y;
    const calcValue: ControlDirectionMap<boolean> = {
        left: false,
        right: false,
        top: false,
        bottom: false,
    };

    distanceToLeft <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.left
        ? (calcValue.left = true)
        : (calcValue.left = false);
    distanceToRight <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.right
        ? (calcValue.right = true)
        : (calcValue.right = false);
    distanceToTop <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.top
        ? (calcValue.top = true)
        : (calcValue.top = false);
    distanceToBottom <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.bottom
        ? (calcValue.bottom = true)
        : (calcValue.bottom = false);

    return calcValue;
}
</script>

<style scoped lang="scss">
$panel-margin: 16px;
$panel-radius: 12px;
$panel-padding: 10px;

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
        padding: $panel-padding;
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
        width: min-content;
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

    .bottom-controls-wrapper {
        bottom: $panel-margin;
        max-width: calc(100% - #{$panel-margin * 3});
        padding: 0;
        margin-top: auto;
        overflow-x: hidden;
        transition: var(--default-duration);

        &.hide {
            box-shadow: none;
            transform: translateY(calc(100% + $panel-margin)) scale(0.85);
        }

        &:hover {
            .bottom-panel-scroll-bar {
                opacity: 1;
            }
        }

        .bottom-controls-container {
            display: flex;
            overflow: hidden;
            padding: $panel-padding;

            img[src=""],
            img:not([src]) {
                opacity: 0;
            }

            .thumb-container {
                display: flex;
                gap: 4px;

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

        .bottom-panel-scroll-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background-color: var(--minimal-fore);
            opacity: 0;
            transition: opacity var(--default-duration);
        }
    }
}
</style>
