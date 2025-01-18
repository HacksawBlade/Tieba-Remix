<template>
    <div class="user-select">
        <ToggleButton ref="selectToggle" v-model="useSelect" class="select-toggle" @focusout="selectFocusout">
            <p class="current-text">{{ data[currentIndex].text }}</p>
            <div class="icon">keyboard_arrow_down</div>
        </ToggleButton>
        <Transition name="select">
            <div ref="selectContainer" v-show="useSelect" class="select-container">
                <UserButton v-for="(value, i) in data" :theme-style="currentIndex === i"
                    class="select-transition select-button" @click="currentIndex = i, useSelect = false"
                    @mouseenter="hoverIndex = i" @focusout="selectFocusout">
                    {{ value.text }}
                </UserButton>
                <div v-show="data[hoverIndex].desc" class="select-transition select-desc" tabindex="-1"
                    @focusout="selectFocusout">
                    {{ useSelect ? data[hoverIndex].desc : "" }}
                </div>
            </div>
        </Transition>
    </div>
</template>

<script lang="tsx" setup>
import { findIndex } from "lodash-es";
import { ref, watch } from "vue";
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

const selectToggle = ref<InstanceType<typeof ToggleButton>>();
const selectContainer = ref<HTMLDivElement>();
const useSelect = ref(false);
const currentIndex = ref((function () {
    if (!props.defaultValue) return 0;
    const index = findIndex(props.data, (d) => d.value === props.defaultValue);
    return index === -1 ? 0 : index;
})());
const hoverIndex = ref(currentIndex.value);

watch(useSelect, function () {
    hoverIndex.value = currentIndex.value;
});

watch(currentIndex, index => {
    emit("change", props.data[index].value);
});

function selectFocusout(e: FocusEvent) {
    selectContainer.value?.contains(e.relatedTarget as Node)
        ? useSelect.value = true
        : useSelect.value = false;
}
</script>

<style lang="scss" scoped>
$select-gap: 4px;

@keyframes select-arrow-down {
    0% {
        transform: translateY(0);
    }

    70% {
        transform: translateY(10%);
    }

    100% {
        transform: translateY(0);
    }
}

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

            .icon {
                animation: select-arrow-down var(--fast-duration) cubic-bezier(0.18, 0.89, 0.32, 1.6);
                color: var(--tieba-theme-color);
                font-weight: bold;
            }
        }

        &.toggle-off {
            box-shadow: 0 0 0 1px var(--border-color);
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
        border-radius: 6px;
        background-color: var(--default-background);
        box-shadow: 0 0 10px rgb(0 0 0 / 20%);

        &.select-enter-active,
        &.select-leave-active {
            transition: transform var(--fast-duration), opacity var(--fast-duration);
        }

        &.select-enter-from,
        &.select-leave-to {
            opacity: 0;
            transform: scale(0.95) translateY(-10%);
        }

        .select-button {
            border-radius: 0;
            box-shadow: none;
            text-align: justify;
        }

        .select-desc {
            padding: 4px 14px;
            border-top: 1px solid var(--border-color);
            color: var(--light-fore);
            font-size: 14px;
        }
    }
}
</style>
