<template>
    <Teleport to="body">
        <div ref="dialogModal" aria-modal class="user-dialog-modal" :style="parseCSSRule(modalStyle)">
            <Transition name="dialog" type="animation" @after-leave="unloadDialog">
                <div ref="userDialog" v-show="dialogTrigger" class="user-dialog remove-default"
                    :style="parseCSSRule(contentStyle)" :class="{
                        'default': !shadowMode,
                        'shadow': shadowMode,
                    }" tabindex="-1">
                    <div v-if="title" class="dialog-title">{{ title }}</div>
                    <slot></slot>
                    <div v-if="dialogButtons.length > 0" class="dialog-button-panel">
                        <UserButton v-for="button in dialogButtons" class="dialog-button" shadow-border
                            :theme-style="button.style === 'themed'" @click="handleButtonEvent(button.event)"
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
import { dom, findParent } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import { DialogOpts, scrollbarWidth } from "@/lib/render";
import _ from "lodash";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import UserButton from "./utils/user-button.vue";

export interface UserDialogButton {
    text?: string;
    style?: "normal" | "themed";
    icon?: string;
    /** 按钮事件。返回值为 `true` 时将会卸载对话框 */
    event?: () => boolean | void;
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

const evproxy = new EventProxy();

const dialogTrigger = ref(false);
const dialogModal = ref<HTMLDivElement>();
const userDialog = ref<HTMLDivElement>();
const currentPayload = ref(props.defaultPayload);

/** 待归还的焦点元素，用于在卸载时恢复焦点位置（如果有的话） */
let focusRelatedTarget: Maybe<HTMLElement> = undefined;
/** 待归还焦点元素对应的对话框，作为上元素被移出文档时的备选 */
let focusRelatedDialog: Maybe<HTMLDivElement> = undefined;

onMounted(async function () {
    dialogTrigger.value = true;
    await nextTick();

    if (!dialogModal.value) return;
    if (!userDialog.value) return;

    if (props.modal) {
        evproxy.on(
            userDialog.value,
            "focusin",
            (e: FocusEvent) => {
                focusRelatedTarget = (e.relatedTarget as HTMLElement) ?? undefined;
                if (focusRelatedTarget) focusRelatedDialog = findParent<"div">(focusRelatedTarget, "user-dialog");
            },
            { once: true }
        );
        userDialog.value.focus();

        evproxy.on(
            userDialog.value,
            "focusout",
            (e: FocusEvent) => {
                const modalDialogs = dom(".user-dialog-modal", []);
                if (!modalDialogs[modalDialogs.length - 1].contains(userDialog.value as Node)) return;

                if (_.isNil(e.relatedTarget) || !userDialog.value?.contains(e.relatedTarget as Node)) {
                    userDialog.value?.focus();

                    // 存在模态框时，允许通过 tab 切换到页面之外，但焦点回归至页面时必须回到对话框内
                    evproxy.on(window, "focusin", function () {
                        userDialog.value?.focus();
                    }, { once: true });
                }
            }
        );
    }

    if (props.lockScroll) {
        document.body.setAttribute("no-scrollbar", "");
        document.body.style.paddingRight = `${scrollbarWidth()}px`;
    }

    if (props.force) {
        const FORCE_ALERT_CLASS = "force-alert" as const;

        evproxy.on(
            dialogModal.value,
            "mousedown",
            (e: MouseEvent) => {
                if (e.target !== dialogModal.value) return;
                if (userDialog.value?.classList.contains(FORCE_ALERT_CLASS)) return;

                userDialog.value?.classList.add(FORCE_ALERT_CLASS);
                if (userDialog.value) {
                    evproxy.on(userDialog.value, "transitionend", function () {
                        userDialog.value?.classList.remove(FORCE_ALERT_CLASS);
                    }, { once: true });
                }
            }
        );
    } else {
        if (props.clickModalToUnload) {
            evproxy.on(
                dialogModal.value,
                "mousedown",
                (e: MouseEvent) => {
                    if (e.target !== dialogModal.value) return;
                    unload(props.defaultPayload);
                },
            );
        }

        if (props.pressEscapeToUnload) {
            evproxy.on(
                dialogModal.value,
                "keydown",
                (e: KeyboardEvent) => {
                    if (e.key === "Escape") {
                        unload(props.defaultPayload);
                    }
                },
            );
        }
    }
});

onBeforeUnmount(function () {
    evproxy.release();
});

function unload(payload?: any) {
    currentPayload.value = payload;
    dialogTrigger.value = false;
}

function unloadDialog() {
    if (props.modal) {
        if (focusRelatedTarget &&
            document.body.contains(focusRelatedTarget)) {
            focusRelatedTarget.focus();
        } else if (focusRelatedDialog &&
            document.body.contains(focusRelatedDialog)) {
            focusRelatedDialog.focus();
        }
    }
    if (currentPayload.value) {
        emit("unload", currentPayload.value);
        return;
    }
    emit("unload");
}

function handleButtonEvent(eventfn: UserDialogButton["event"]) {
    if (eventfn?.()) {
        unload();
    }
}

defineExpose({
    unload,
});
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations.scss" as *;
@use "@/stylesheets/main/remixed-main.scss" as *;

$dialog-padding: 16px;
$dialog-radius: 12px;

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
            box-sizing: border-box;
            flex-direction: column;
            padding: $dialog-padding;
            border: 1px solid var(--light-border-color);
            border-radius: $dialog-radius;
            margin: $dialog-padding;
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

        .dialog-button-panel {
            $dialog-padding-nega: -$dialog-padding;
            display: flex;
            padding: $dialog-padding;
            border-radius: 0 0 $dialog-radius $dialog-radius;
            margin: $dialog-padding $dialog-padding-nega $dialog-padding-nega;
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
