<template>
    <UserDialog v-bind="dialogOpts">
        <div class="toggle-panel">
            <div v-for="toggle in props.toggles" class="toggle-container">
                <UserToggle
                    class="panel-button"
                    :model-value="toggle.defaultValue ?? false"
                    icon-type
                    shadow-border
                    @click="toggle.event"
                    >{{ toggle.icon }}
                </UserToggle>
                <div class="toggle-name">{{ toggle.name }}</div>
            </div>
        </div>
    </UserDialog>
</template>

<script lang="ts" setup>
import type { UserDialogOpts } from "user-view";
import { UserDialog, UserToggle } from "user-view";

interface Toggle {
    icon: string;
    defaultValue?: boolean;
    name?: string;
    event?: (now: boolean) => void;
}

export interface TogglePanelProps {
    toggles: Toggle[];
}

const props = defineProps<TogglePanelProps>();

const dialogOpts: UserDialogOpts = {
    contentStyle: {
        maxWidth: "60vh",
        maxHeight: "60vh",
    },
};
</script>

<style lang="scss" scoped>
.toggle-panel {
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
            font-size: 12px;
        }
    }
}
</style>
