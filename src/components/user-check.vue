<template>
    <div class="user-check">
        <label :for="id" class="check-label">
            <ToggleButton v-model="model" :id="id" class="check-button icon" :theme-style="model"
                @update:model-value="emit('change', model)">
                {{ model ? "check" : "" }}
            </ToggleButton>
            <p class="label-text">{{ text }}</p>
        </label>
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

const emit = defineEmits<{ (e: "change", value: boolean): void }>();
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations.scss" as *;

.user-check {
    display: flex;
    align-items: center;

    .check-button {
        width: 16px;
        min-width: 16px;
        height: 16px;
        min-height: 16px;
        padding: 0;
        border-radius: 4px;
        color: var(--tieba-theme-color);
        font-size: 14px;
        font-weight: bold;
    }

    .check-label {
        display: flex;
        align-items: center;
        color: var(--light-fore);
        cursor: pointer;
        font-size: 16px;
    }

    .label-text {
        padding-left: 6px;
    }
}
</style>
