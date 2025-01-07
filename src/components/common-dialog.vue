<template>
    <dialog class="common-dialog remove-default" :class="{
        'animation': animation,
    }">
        <div v-if="title" class="dialog-title">{{ title }}</div>
        <slot></slot>
        <div v-if="dialogButtons.length > 0" class="dialog-buttons">
            <UserButton v-for="button in dialogButtons" class="dialog-button" shadow-border
                :theme-style="button.style === 'themed'" @click="button.event" :class="{ 'icon': button.icon }">
                {{ button.icon ? button.icon : button.text }}
            </UserButton>
        </div>
    </dialog>
</template>

<script lang="ts" setup>
import { DialogOpts } from "@/lib/render";
import { ref } from "vue";
import UserButton from "./utils/user-button.vue";

export interface CommonDialogButton {
    text?: string;
    style?: "normal" | "themed";
    icon?: string;
    event?: () => void;
}

export interface CommonDialogOpts extends DialogOpts {
    /** 对话框标题 */
    title?: string;
    /** 使用默认交互按钮 */
    dialogButtons?: CommonDialogButton[];
}

const props = withDefaults(defineProps<CommonDialogOpts>(), {
    modal: true,
    lockScroll: true,
    animation: true,
    dialogButtons: () => [] as CommonDialogButton[],
});

const commonDialog = ref<HTMLDialogElement>();

defineExpose({
    show() {
        props.modal ? commonDialog.value?.showModal() : commonDialog.value?.show();
    },
    close() {
        commonDialog.value?.close();
    },
});
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations.scss" as *;
@use "@/stylesheets/main/remixed-main.scss" as *;

.common-dialog {
    @include main-box-shadow;

    display: flex;
    overflow: hidden;
    box-sizing: border-box;
    flex-direction: column;
    padding: 16px;
    border: 1px solid var(--light-border-color);
    border-radius: 12px;
    margin: auto;
    background-color: var(--default-background);
    font-size: 16px;
    transition: $default-animation-duration;

    &::backdrop {
        background-color: rgb(0 0 0 / 50%);
    }

    &.backdrop-blur::backdrop {
        @include blur-effect;
    }

    &.animation {
        animation: kf-dialog-in $default-animation-duration;
    }

    &.animation.closing {
        animation: kf-dialog-out $default-animation-duration;
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
</style>
