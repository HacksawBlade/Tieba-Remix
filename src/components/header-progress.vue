<template>
    <div ref="headerProgress" id="header-progress" :class="{ 'complete': valueRef >= 100 }"
        :style="`width: ${valueRef}vw;`">
    </div>
</template>

<script lang="ts" setup>
import { FrameInterval } from "@/lib/utils/frame-interval";
import { onMounted, ref } from "vue";

export interface HeaderProgressProps {
    calc: (() => number);
}

const props = defineProps<HeaderProgressProps>();

const headerProgress = ref<HTMLDivElement>();
const valueRef = ref(0);

onMounted(function () {
    if (headerProgress.value) {
        new FrameInterval(calcValue)
            .until(() => valueRef.value >= 100);
    }
});

function calcValue() {
    valueRef.value = props.calc();
}
</script>

<style lang="scss" scoped>
#header-progress {
    position: fixed;
    z-index: 99999;
    top: 0;
    max-width: 100vw;
    height: 4px;
    background-color: var(--tieba-theme-color);
    transition: 0.4s;

    &.complete {
        animation: kf-fade-out var(--xslow-duration) forwards;
    }
}
</style>
