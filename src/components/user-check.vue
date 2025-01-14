<template>
    <div class="user-check">
        <ToggleButton v-model="model" :id="id" class="check-button icon" :theme-style="model">
            {{ model ? "check" : "" }}
        </ToggleButton>
        <label :for="id" class="check-label">{{ text }}</label>
    </div>
</template>

<script lang="tsx" setup>
import ToggleButton from "./utils/toggle-button.vue";

interface UserCheckOpts {
    id?: string;
    text?: string;
}

withDefaults(defineProps<UserCheckOpts>(), {
    text: "",
});

const model = defineModel<boolean>({
    required: true,
    default: false,
});
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations.scss" as *;

.user-check {
    display: flex;
    align-items: center;

    .check-button {
        width: 16px;
        height: 16px;
        padding: 0;
        border-radius: 4px;
        color: var(--tieba-theme-color);
        font-size: 14px;
        font-weight: bold;
    }

    .check-label {
        padding-left: 6px;
    }
}
</style>
