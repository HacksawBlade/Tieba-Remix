<template>
    <div class="theme-color-component">
        <ColorPicker text="主题色" v-model="theme" @change="changeThemeColor" />
        <UserButton class="reset-button" @click="resetThemeColor">重置</UserButton>
    </div>
</template>

<script lang="ts" setup>
import ColorPicker from "@/components/color-picker.vue";
import { themeColor } from "@/lib/user-values";
import { UserButton } from "user-view";
import { ref } from "vue";

const theme = ref(themeColor.get());

function changeThemeColor() {
    themeColor.set(theme.value);
}

function resetThemeColor() {
    themeColor.remove();
    theme.value = themeColor.get();
}
</script>

<style lang="scss" scoped>
.theme-color-component {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;

    .reset-button {
        margin-left: auto;
    }
}
</style>

<style lang="scss">
.theme-picker {
    z-index: 9999 !important;
}
</style>
