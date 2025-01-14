<template>
    <Teleport to="body">
        <div ref="dialogModal" aria-modal class="user-dialog-modal" :style="parseCSSRule(modalStyle)">
            <Transition name="dialog" type="animation" @after-leave="unloadDialog">
                <div ref="userDialog" v-show="dialogTrigger" class="user-dialog remove-default"
                    :style="parseCSSRule(contentStyle)" :class="{
                        'default': !shadowMode,
                        'shadow': shadowMode,
                    }">
                    <div v-if="title" class="dialog-title">{{ title }}</div>
                    <slot></slot>
                    <div v-if="dialogButtons.length > 0" class="dialog-buttons">
                        <UserButton v-for="button in dialogButtons" class="dialog-button" shadow-border
                            :theme-style="button.style === 'themed'" @click="button.event"
                            :class="{ 'icon': button.icon }">
                            {{ button.icon ? button.icon : button.text }}
                        </UserButton>
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import { DialogOpts, scrollbarWidth } from "@/lib/render";
import { nextTick, onMounted, ref } from "vue";
import UserButton from "./utils/user-button.vue";

export interface UserDialogButton {
    text?: string;
    style?: "normal" | "themed";
    icon?: string;
    event?: () => void;
}

export interface UserDialogOpts<PayloadType = any> extends DialogOpts {
    /** 对话框标题 */
    title?: string;
    /** 使用默认交互按钮 */
    dialogButtons?: UserDialogButton[];
    /** 隐藏样式 */
    shadowMode?: boolean;
    /** 注入遮罩样式 */
    modalStyle?: CSSRule;
    /** 堆叠顺序 */
    zIndex?: number;
    /** 注入容器样式 */
    contentStyle?: CSSRule;
    /** 在点击遮罩部分是否会执行默认卸载函数（force 模式下永远不会执行默认函数） */
    clickModalToUnload?: boolean;
    /** 在按下 `ESC` 时是否会执行默认卸载函数（force 模式下永远不会执行默认函数） */
    pressEscapeToUnload?: boolean;
    /** 卸载事件负载 */
    defaultPayload?: PayloadType;
    /** 替换渲染动画 */
    renderAnimation?: string;
    /** 替换卸载动画 */
    unloadAnimation?: string;
}

const props = withDefaults(defineProps<UserDialogOpts>(), {
    modal: true,
    force: false,
    lockScroll: true,
    animation: true,
    dialogButtons: () => [] as UserDialogButton[],
    zIndex: 2025,
    modalStyle: () => ({}),
    contentStyle: () => ({}),
    clickModalToUnload: true,
    pressEscapeToUnload: true,
    renderAnimation: "kf-dialog-in var(--default-duration)",
    unloadAnimation: "kf-dialog-out var(--default-duration)",
});

const emit = defineEmits<{ (e: "unload", payload?: any): void }>();

const dialogTrigger = ref(false);
const dialogModal = ref<HTMLDivElement>();
const userDialog = ref<HTMLDivElement>();
const currentPayload = ref(props.defaultPayload);

onMounted(async function () {
    dialogTrigger.value = true;
    await nextTick();

    if (!dialogModal.value) return;
    if (!userDialog.value) return;

    if (props.lockScroll) {
        document.body.setAttribute("no-scrollbar", "");
        document.body.style.paddingRight = `${scrollbarWidth()}px`;
    }

    if (props.force) {
        const FORCE_ALERT_CLASS = "force-alert" as const;

        dialogModal.value.addEventListener("mousedown", function (e) {
            if (e.target !== dialogModal.value) return;
            if (userDialog.value?.classList.contains(FORCE_ALERT_CLASS)) return;

            userDialog.value?.classList.add(FORCE_ALERT_CLASS);
            userDialog.value?.addEventListener("transitionend", function () {
                userDialog.value?.classList.remove(FORCE_ALERT_CLASS);
            }, { once: true });
        });
    } else {
        if (props.clickModalToUnload) {
            dialogModal.value.addEventListener("mousedown", function (e) {
                if (e.target !== dialogModal.value) return;
                unload(props.defaultPayload);
            });
        }

        if (props.pressEscapeToUnload) {
            dialogModal.value.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    unload(props.defaultPayload);
                }
            });
        }
    }
});

function unload(payload?: any) {
    currentPayload.value = payload;
    dialogTrigger.value = false;
}

function unloadDialog() {
    if (currentPayload.value) {
        emit("unload", currentPayload.value);
        return;
    }
    emit("unload");
}

defineExpose({
    unload,
});
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations.scss" as *;
@use "@/stylesheets/main/remixed-main.scss" as *;

.user-dialog-modal {
    position: fixed;
    z-index: v-bind("$props.zIndex");
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgb(0 0 0 / 50%);
    inset: 0;

    .user-dialog {
        &.default {
            @include main-box-shadow;
            display: flex;
            overflow: hidden;
            box-sizing: border-box;
            flex-direction: column;
            padding: 16px;
            border: 1px solid var(--light-border-color);
            border-radius: 12px;
            margin: 16px;
            background-color: var(--default-background);
            font-size: 16px;
            transition: $default-animation-duration;
        }

        &.dialog-enter-active {
            animation: v-bind("$props.renderAnimation");
        }

        &.dialog-leave-active {
            animation: v-bind("$props.unloadAnimation");
        }

        &.default.force-alert {
            box-shadow: 0 0 0 2px var(--error-color) !important;
        }

        .dialog-title {
            margin-bottom: 8px;
            color: var(--highlight-fore);
            font-size: 20px;
            font-weight: bold;
        }

        .dialog-buttons {
            display: flex;
            padding: 16px;
            margin: 16px -16px -16px;
            background-color: var(--deep-background);
            gap: 8px;

            .dialog-button {
                flex-grow: 1;
                padding: 6px 16px;
                font-size: 14px;
            }
        }
    }
}
</style>
