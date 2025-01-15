<template>
    <div class="user-select">
        <ToggleButton ref="selectToggle" v-model="useSelect" class="select-toggle">
            <p class="current-text">{{ data[currentIndex].text }}</p>
            <div class="icon">{{ useSelect ? "keyboard_arrow_up" : "keyboard_arrow_down" }}</div>
        </ToggleButton>
        <Transition name="select">
            <div ref="selectContainer" v-show="useSelect" class="select-container">
                <UserButton v-for="(d, i) in data" :theme-style="currentIndex === i" class="select-button"
                    @click="currentIndex = i, useSelect = false">
                    {{ d.text }}
                </UserButton>
            </div>
        </Transition>
    </div>
</template>

<script lang="tsx" setup>
import { findIndex } from "lodash-es";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import ToggleButton from "./utils/toggle-button.vue";
import UserButton from "./utils/user-button.vue";

type ValueType = string | number | object;

export interface UserSelectItem<T = ValueType> {
    text: string;
    value: T;
    desc?: string;
}

export interface UserSelectOpts {
    data: UserSelectItem[];
    defaultValue?: ValueType;
}

const props = withDefaults(defineProps<UserSelectOpts>(), {});

defineModel<UserSelectItem["value"]>("value");

const emit = defineEmits<{ (e: "change", value: ValueType): void }>();

const eventRecords: EventRecord[] = [];

const selectToggle = ref<InstanceType<typeof ToggleButton>>();
const selectContainer = ref<HTMLDivElement>();
const useSelect = ref(false);
const currentIndex = ref((function () {
    if (!props.defaultValue) return 0;
    const index = findIndex(props.data, (d) => d.value === props.defaultValue);
    return index === -1 ? 0 : index;
})());

onMounted(function () {
    const onBlur = (e: FocusEvent) => {
        if (selectContainer.value?.contains(e.relatedTarget as Node)) return;
        useSelect.value = false;
    };
    (selectToggle.value?.$el as HTMLButtonElement).addEventListener("blur", onBlur);
    eventRecords.push({ target: selectToggle.value?.$el, type: "blur", callback: onBlur });
});

onBeforeUnmount(function () {
    eventRecords.forEach(({ target, type, callback, options }) => {
        target.removeEventListener(type, callback, options);
    });
});

watch(currentIndex, index => {
    emit("change", props.data[index].value);
});
</script>

<style lang="scss" scoped>
$select-gap: 4px;

.user-select {
    position: relative;

    .select-toggle {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        text-align: justify;

        &.toggle-on {
            background-color: var(--default-background);
            box-shadow: 0 0 0 1px var(--tieba-theme-color);
            color: var(--default-fore);
        }

        &.toggle-off {
            box-shadow: 0 0 0 1px var(--border-color);
        }

        .icon {
            font-weight: bold;
        }
    }

    .select-container {
        position: absolute;
        top: calc(100% + $select-gap);
        left: 0;
        display: flex;
        overflow: hidden;
        width: 100%;
        flex-direction: column;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--default-background);
        box-shadow: 0 0 10px rgb(0 0 0 / 20%);

        &.select-enter-active .select-button,
        &.select-leave-active .select-button {
            transition: transform var(--fast-duration) ease-out, opacity var(--fast-duration);
        }

        &.select-enter-from .select-button,
        &.select-leave-to .select-button {
            opacity: 0;
            transform: translateY(-20%);
        }

        @keyframes select-out {
            100% {
                opacity: 0;
                transform: translateY(-20%);
            }
        }

        &.closing .select-button {
            animation: select-out var(--fast-duration);
        }

        .select-button {
            border-radius: 0;
            box-shadow: none;
            text-align: justify;
        }
    }
}
</style>
