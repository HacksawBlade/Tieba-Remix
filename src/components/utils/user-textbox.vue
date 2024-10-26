<template>
    <component :is="props.mutiLines ? 'textarea' : 'input'" class="user-textbox"
        :class="{ 'lodash-style': props.lodashStyle }" type="text" :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" autocomplete="off">
    </component>
</template>

<script setup lang="ts">
interface Props {
    modelValue?: string;
    mutiLines?: boolean;
    lodashStyle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    lodashStyle: false,
});

defineEmits(["update:modelValue"]);
</script>

<style lang="scss" scoped>
@use "@/stylesheets/components/user-textbox" as *;

.user-textbox {
    @extend %user-textbox;
}
</style>
