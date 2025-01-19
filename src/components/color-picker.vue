<template>
    <label class="color-picker">
        <input class="color-input" type="color" v-model="model" />
        <p v-if="text">{{ text }}</p>
    </label>
</template>

<script setup lang="ts">
import _ from "lodash";
import { onBeforeUnmount, watch } from "vue";

export interface ColorPickerOpts {
    text?: string;
}

withDefaults(defineProps<ColorPickerOpts>(), {
    text: "",
});

const model = defineModel<string>({ required: true });

const emit = defineEmits<{ (e: "change", value: string): void }>();

const DEBOUNCE_TIME = 500 as const;

const debouncedUpdate = _.debounce(() => {
    emit("change", model.value);
}, DEBOUNCE_TIME);

onBeforeUnmount(function () {
    debouncedUpdate.cancel();
});

watch(model, function () {
    debouncedUpdate();
});
</script>

<style lang="scss" scoped>
$picker-size: 24px;

.color-picker {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-input {
        width: $picker-size;
        height: $picker-size;
    }
}
</style>
