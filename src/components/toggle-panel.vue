<template>
    <div id="toggle-panel" class="toggle-panel">
        <div class="panel-info">
            <div class="panel-title"></div>
            <div class="panel-desc"></div>
        </div>

        <div class="toggle-wrapper">
            <div v-for="toggle in props.toggles" class="toggle-container">
                <ToggleButton class="panel-button" :model-value="toggle.defaultValue ?? false" icon-type shadow-border
                    @click="toggle.event">{{ toggle.icon }}
                </ToggleButton>
                <div class="toggle-name">{{ toggle.name }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import ToggleButton from "./utils/toggle-button.vue";

interface Toggle {
    icon: string;
    defaultValue?: boolean;
    name?: string;
    event?: ((now: boolean) => void);
}

export interface TogglePanelProps {
    toggles: Toggle[];
}

const props = defineProps<TogglePanelProps>();
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/remixed-main" as *;

.toggle-panel {
    display: flex;
    overflow: hidden;
    max-width: 60vh;
    max-height: 60vh;
    box-sizing: border-box;
    flex-direction: column;
    padding: 12px;
    border: 1px solid var(--light-border-color);
    border-radius: 16px;
    margin: auto;
    animation: kf-dialog-in 0.4s ease;
    background-color: var(--default-background);
    box-shadow: 0 0 10px rgba($color: #000, $alpha: 10%);
    color: var(--default-fore);
    transition: 0.4s ease;

    .toggle-wrapper {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;

        .toggle-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;

            .panel-button {
                width: 58px;
                height: 58px;
                border-radius: 12px;
                font-size: 24px;

                &.toggle-off {
                    @extend %icon;
                    color: var(--minimal-fore);
                }

                &.toggle-on {
                    @extend %filled-icon;

                    &:focus {
                        box-shadow: 0 0 0 1px var(--tieba-theme-color);
                    }
                }
            }

            .toggle-name {
                color: var(--light-fore);

            }
        }
    }
}
</style>
