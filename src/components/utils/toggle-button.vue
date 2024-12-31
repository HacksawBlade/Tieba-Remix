<template>
    <UserButton class="toggle-button" :class="toggleClass" @click="toggle">
        <slot></slot>
    </UserButton>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import UserButton from "./user-button.vue";



const TOGGLE_ON_CLASS = "toggle-on" as const;
const TOGGLE_OFF_CLASS = "toggle-off" as const;

const model = defineModel<boolean>({
    required: true,
    default: false,
});

const toggleClass = computed(() => {
    return model.value ? TOGGLE_ON_CLASS : TOGGLE_OFF_CLASS;
});

function toggle() {
    model.value = !model.value;
}
</script>

<style lang="scss" scoped>
.toggle-button {
    color: var(--default-fore);

    .icon,
    .outline-icon {
        color: var(--minimal-fore);
    }

    &.toggle-on {
        background-color: var(--tieba-theme-color);
        color: var(--default-background);
    }
}
</style>
