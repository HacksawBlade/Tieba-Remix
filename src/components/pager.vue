<template>
    <div class="pager-wrapper">
        <div v-if="showPagers" class="pager-button-container">
            <UserButton v-show="current > Math.ceil(pagerCount / 2) && current > 1 && total > pagerCount"
                class="pager-button pager-head-button " no-border @click="pagerChange('head', 1)">1</UserButton>
            <UserButton v-show="current > Math.ceil(pagerCount / 2) && current > 1 && total > pagerCount"
                class="pager-button pager-back-button icon" no-border
                @click="pagerChange('prev', Math.max(1, current - pagerCount))">
                keyboard_double_arrow_left
            </UserButton>

            <UserButton v-for="(displayNumber, i) in _.range(pagerStart, pagerEnd)" :key="i" class="pager-button"
                :class="{ 'fill': fill, 'curr-pager-button': displayNumber === current }"
                @click="pagerChange('page', displayNumber)" no-border="all" :disabled="displayNumber === current">
                {{ displayNumber }}
            </UserButton>

            <UserButton v-show="total - pagerCount > 1 && total - current > pagerCount / 2"
                class="pager-button pager-forward-button icon" no-border
                @click="pagerChange('next', Math.min(total, current + pagerCount))">
                keyboard_double_arrow_right
            </UserButton>
            <UserButton v-show="tail && total - pagerCount > 1 && total - current > pagerCount / 2"
                class="pager-button pager-tail-button" no-border @click="pagerChange('tail', total)">
                {{ total }}</UserButton>
        </div>

        <div v-if="showPagers && jumper" class="pager-separactor">|</div>

        <div v-if="showPagers && jumper" class="jumper-container">
            转到
            <UserTextbox v-model="jumperValue" class="jumper"
                @update:model-value="emit('update:jumperValue', jumperValue)" @keydown.enter="handleJumperEnter">
            </UserTextbox>
            页
        </div>

        <div class="tail-slot">
            <slot name="tailSlot"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { PagerType } from "@/lib/tieba-components/pager";
import _ from "lodash";
import { computed, ref } from "vue";
import UserButton from "./utils/user-button.vue";
import UserTextbox from "./utils/user-textbox.vue";

export interface PagerProps {
    total: number;
    current: number;
    jumperValue?: string;
    maxDisplay?: number;
    fill?: boolean;
    showPagers?: boolean;
    head?: boolean;
    tail?: boolean;
    jumper?: boolean;
    pagerClick?(page: number): void;
    headClick?(): void;
    tailClick?(): void;
    prevClick?(page: number): void;
    nextClick?(page: number): void;
    pagerChange?(page: number): void;
    jumperEnter?(page: number): void;
}

const props = withDefaults(defineProps<PagerProps>(), {
    maxDisplay: 9,
    fill: false,
    showPagers: true,
    head: true,
    tail: true,
    jumper: true,
});

const current = ref(props.current);
const jumperValue = ref(props.jumperValue ?? "");

// const current = defineModel<number>("current", { default: 0 });
// const jumperValue = defineModel<string>("jumperValue", { default: "" });

const emit = defineEmits([
    "update:current",
    "update:jumperValue",
]);

const pagerCount = Math.min(props.maxDisplay, props.total);

// 额外维护一个内部使用
const pagerStart = computed(
    () =>
        current.value + pagerCount / 2 > props.total
            ? props.total - pagerCount + 1
            : Math.max(1, current.value - Math.floor(props.maxDisplay / 2))
);
const pagerEnd = computed(() => Math.min(props.total, pagerStart.value + props.maxDisplay - 1) + 1);

defineExpose({
    current,
    jumperValue,
});

function pagerChange(type: PagerType | null, page: number) {
    if (props.pagerChange && page !== current.value)
        props.pagerChange(page);
    current.value = page;
    emit("update:current", page);

    switch (type) {
        case "page":
            if (props.pagerClick) props.pagerClick(page);
            break;
        case "head":
            if (props.headClick) props.headClick();
            break;
        case "tail":
            if (props.tailClick) props.tailClick();
            break;
        case "prev":
            if (props.prevClick) props.prevClick(page);
            break;
        case "next":
            if (props.nextClick) props.nextClick(page);
            break;
    }
}

function handleJumperEnter() {
    if (!jumperValue.value) return;

    const page = +jumperValue.value;
    if (page < 1 || page > props.total) return;

    pagerChange(null, page);
    if (props.jumperEnter) props.jumperEnter(page);
    jumperValue.value = "";
}
</script>

<style lang="scss" scoped>
.pager-wrapper {
    display: flex;
    width: fit-content;
    box-sizing: border-box;
    align-items: center;
    padding: 4px;
    font-size: 16px;
    gap: 6px;

    .pager-button-container {
        display: flex;
        align-items: center;

        .pager-button {
            padding: 4px 10px;
            color: var(--default-fore);
            font-family: var(--code-zh);

            &:not(:hover, :active, :focus) {
                background-color: transparent;
            }

            &.fill:not(:hover, :active, :focus) {
                background-color: var(--default-background);
            }

            &.curr-pager-button {
                border-radius: 0;
                box-shadow: 0 3px 0 var(--tieba-theme-color);
                color: var(--tieba-theme-color);
            }

            &.icon {
                @extend %icon;
            }
        }
    }

    .pager-separactor {
        color: var(--minimal-fore);
        font-family: var(--code-monospace);
    }

    .jumper-container {
        display: flex;
        align-items: center;
        color: var(--light-fore);
        gap: 6px;

        .jumper {
            width: 36px;
            width: 3em;
            padding: 2px 4px;
            color: var(--default-fore);
            font-family: var(--code-monospace);
        }
    }

    .tail-slot {
        margin-left: auto;
        color: var(--minimal-fore);
    }
}
</style>
