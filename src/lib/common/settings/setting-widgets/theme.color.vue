<template>
    <div class="theme-color-component">
        <ColorPicker text="浅色主题" v-model="lightTheme" @change="changeThemeColor" />
        <ColorPicker text="深色主题" v-model="darkTheme" @change="changeThemeColor" />
        <UserButton class="reset-button" @click="resetThemeColor">重置</UserButton>
    </div>
</template>

<script lang="ts" setup>
import ColorPicker from "@/components/color-picker.vue";
import UserButton from "@/components/utils/user-button.vue";
import { themeColor } from "@/lib/user-values";
import { ref } from "vue";

const lightTheme = ref(themeColor.get().light);
const darkTheme = ref(themeColor.get().dark);

function changeThemeColor() {
    themeColor.set({
        dark: darkTheme.value,
        light: lightTheme.value,
    });
}

function resetThemeColor() {
    themeColor.remove();
    lightTheme.value = themeColor.get().light;
    darkTheme.value = themeColor.get().dark;
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
