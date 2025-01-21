<template>
    <div class="dropdown-menu" :class="blurEffect ? 'blur-effect' : ''">
        <template v-for="menuItem in props.menuItems">
            <template v-if="typeof menuItem === 'string'">
                <div class="menu-separator"></div>
            </template>

            <template v-else>
                <UserButton class="menu-item" :is-anchor="menuItem.href !== undefined"
                    :href="menuItem.href ? menuItem.href : 'javascript:;'" @click="menuItem.click"
                    :target="menuItem.href ? '_blank' : ''" no-border>
                    <div v-if="menuItem.icon" class="icon">{{ menuItem.icon }}</div>
                    <div class="menu-title">
                        {{ menuItem.title }}
                        <span v-if="menuItem.innerText" class="menu-inner">{{ menuItem.innerText }}</span>
                    </div>
                </UserButton>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { findParent } from "@/lib/elemental";
import { onMounted } from "vue";
import UserButton from "./user-button.vue";

interface Props {
    menuItems: DropdownMenu[],
    blurEffect?: true
}
const props = defineProps<Props>();

const emit = defineEmits(["RequestClose"]);

onMounted(() => {
    // 设置等待时长，防止刚挂载就被卸载
    setTimeout(() => {
        window.addEventListener("click", () => {
            setTimeout(() => {
                emit("RequestClose");
            }, 100);
        });

        window.addEventListener("focusin", (ev) => {
            if (!findParent((ev.target as HTMLElement), "dropdown-menu")) {
                emit("RequestClose");
            }
        });
    }, 100);
});
</script>

<style scoped lang="scss">
$menu-padding: 4px;
$item-padding: 4px 14px;

@keyframes stretch {
    0% {
        padding: 2px 14px;
    }

    100% {
        padding: $item-padding;
    }
}

a {
    color: unset;
}

.dropdown-menu {
    position: fixed;
    z-index: 1;
    display: flex;
    overflow: hidden;
    width: max-content;
    min-width: 120px;
    flex-direction: column;
    padding: $menu-padding;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--default-background);
    box-shadow: 0 0 20px rgb(0 0 0 / 8%);

    @include fade-in(var(--fast-duration));
    font-size: 14px;

    .menu-item {
        display: flex;
        width: 100%;
        align-items: center;
        padding: $item-padding;
        border: none;
        border-radius: 6px;
        animation: stretch var(--fast-duration) cubic-bezier(0.22, 0.61, 0.36, 1);
        background: none;
        color: var(--default-fore);
        font-size: 14px;
        gap: 6px;
        transition: 0.2s;

        .menu-title {
            display: flex;
            width: 100%;
            gap: 12px;
            text-align: justify;

            .menu-inner {
                margin-left: auto;
                color: var(--minimal-fore);
            }
        }
    }

    .menu-item:hover {
        background-color: var(--default-hover);
    }

    .menu-item:active {
        background-color: var(--default-active);
    }

    .menu-separator {
        width: calc(100% + 2 * $menu-padding);
        height: 1px;
        margin: 6px 0 6px (-$menu-padding);
        background-color: var(--border-color);
    }
}

.blur-effect {
    background-color: var(--trans-default-background);

    @include blur-effect;
}
</style>
