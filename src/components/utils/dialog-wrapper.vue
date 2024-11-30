<template>
    <div class="dialog-wrapper dialog-toggle" :class="{ 'blur-effect': props.blurEffect, 'darker': props.darker }"
        @click="onClick">
    </div>
</template>

<script setup lang="ts">
import { unloadDialog } from "@/lib/render";
import { experimental, perfProfile } from "@/lib/user-values";
import { includes } from "lodash-es";
import { Component, createApp, onMounted } from "vue";

export interface DialogWrapperProps {
    dialog: Component
    childProps?: LiteralObject
    blurEffect?: boolean
    forced?: boolean
    darker?: boolean
}
const props = withDefaults(defineProps<DialogWrapperProps>(), {
    blurEffect: perfProfile.get() === "performance" && experimental.get().moreBlurEffect,
    forced: false,
    darker: true,
});

const emit = defineEmits(["RequestClose"]);
const dialog = createApp(props.dialog, props.childProps);

onMounted(() => {
    dialog.mount(".dialog-wrapper");
});

function onClick(e: Event) {
    // 防止事件穿透
    if (!includes((e.target as HTMLElement).classList, "dialog-toggle")) return;
    if (!props.forced) {
        emit("RequestClose");
        dialog.unmount();
        unloadDialog();
    }
}
</script>

<style scoped lang="scss">
@use "@/stylesheets/main/animations" as *;
@use "@/stylesheets/main/remixed-main" as *;

.dialog-wrapper {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    background-color: transparent;

    &.darker {
        background-color: rgba($color: #000, $alpha: 72%);
    }

    @include fade-in(0.2s);
}

.blur-effect {
    @include blur-effect(4px);
}
</style>
