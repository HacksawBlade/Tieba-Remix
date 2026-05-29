<template>
    <div class="about-wrapper">
        <div class="main-title">
            <!-- <img
                :src="getResource('/assets/images/main/icon.png')"
                alt="icon"
                class="main-icon"
            /> -->

            <div class="title">{{ MainTitle }}</div>
        </div>

        <div class="script-info">
            <div class="author-info">
                <div class="version">{{ scriptInfo.script.version }}</div>
                <div class="author">@{{ scriptInfo.script.author }}</div>
            </div>

            <div class="about-desc">
                <div v-for="line in `本开源项目使用 MIT 协议`.split('\n')" class="line">
                    {{ line }}
                </div>
            </div>
        </div>

        <div class="about-controls">
            <UserButton
                class="about-button github"
                :is-anchor="true"
                :href="GithubRepo"
                :shadow-border="true"
                target="_balnk">开放源代码
            </UserButton>

            <UserButton
                class="about-button update"
                :shadow-border="true"
                @click="emit('changeView', 'about', 'update')">
                检查更新
            </UserButton>
        </div>

        <div class="about-desc"></div>
    </div>
</template>

<script lang="ts" setup>
import { GM_info } from "$";
import { GithubRepo, MainTitle } from "@/lib/user-values";
import { UserButton } from "user-view";

const scriptInfo = GM_info;

const emit = defineEmits(["changeView"]);
</script>

<style lang="scss" scoped>
.about-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin: auto;
    gap: 12px;

    .main-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .main-icon {
            width: 64px;
            height: 64px;
        }

        .title {
            color: var(--highlight-fore);
            font-size: 32px;
            font-style: italic;
            font-weight: var(--font-weight-bold);
            text-decoration: underline var(--tieba-theme-color);
        }
    }

    .script-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--minimal-fore);
        gap: 8px;

        .author-info {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }
    }

    .about-controls {
        display: flex;
        margin-top: 16px;
        // padding: 16px;
        // border-radius: 16px;
        // background-color: var(--trans-light-background);
        gap: 8px;

        .about-button {
            padding: 6px 10px;
            font-size: 14px;
        }
    }
}
</style>
