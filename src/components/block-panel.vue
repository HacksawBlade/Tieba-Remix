<template>
    <div class="block-panel blur-if-custom-background">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.block-panel {
    display: flex;
    min-width: 30px;
    height: 26px;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 24px;
    background-color: var(--trans-light-background);
    font-size: 14px;
    text-align: center;

    .icon {
        color: var(--light-fore);
        font-size: 18px;
    }

    .panel-button {
        width: 30px;
        height: 30px;
        padding: 4px;
        border: none !important;
        border-radius: 48px;
    }

    &.left-align {
        margin-left: 0;
    }
}
</style>
