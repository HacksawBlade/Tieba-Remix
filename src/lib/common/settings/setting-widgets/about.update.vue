<template>
    <div v-if="!forbidden" class="update-wrapper">
        <div v-if="isLatest !== undefined" class="latest-info" :class="{ 'is-latest': isLatest }">
            <div class="icon">{{ isLatest ? 'check' : 'warning' }}</div>
            <div class="content">{{ isLatest ? '当前是最新版本' : '检测到新版本' }}</div>
        </div>

        <div class="title-container">
            <h2 class="title">{{ release?.name }}</h2>
            <div v-if="release?.prerelease" class="is-pre-release">预览版</div>
        </div>

        <div class="main-info">
            <img v-if="release?.author.avatar_url" :src="release?.author.avatar_url" alt="" class="avatar">
            <div class="owner">{{ release?.author.name }}</div>
        </div>

        <div class="release-body markdown" v-html="release?.body ? marked(release?.body) : ''"></div>

        <div class="update-controls">
            <UserButton class="up-button download-button" shadow-border theme-style is-anchor
                :href="release?.assets[0].browser_download_url">安装更新
            </UserButton>
        </div>
    </div>

    <div v-else class="forbidden-wrapper">
        <div class="icon">warning</div>
        <div class="forbidden-text">请求过于频繁，请稍后重试</div>
    </div>
</template>

<script lang="ts" setup>
import { GM_info } from "$";
import UserButton from "@/components/utils/user-button.vue";
import { getLatestReleaseFromGitee } from "@/lib/api/remixed";
import { GiteeRelease } from "@/lib/user-values";
import { marked } from "marked";
import { onMounted, ref } from "vue";

const release = ref<GiteeRelease>();
const forbidden = ref(false);
const isLatest = ref<boolean>();

const scriptInfo = GM_info;

onMounted(async () => {
    const latest = await getLatestReleaseFromGitee();
    if (latest) {
        forbidden.value = false;
        release.value = latest;
        isLatest.value = `v${scriptInfo.script.version}` >= release.value.tag_name;
    } else {
        forbidden.value = true;
    }
});
</script>

<style lang="scss" scoped>
.update-wrapper {
    display: flex;
    max-width: 100%;
    flex-direction: column;
    gap: 8px;

    .latest-info {
        display: flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 16px;
        margin: auto;
        margin-bottom: 12px;
        background-color: var(--level-blue-background);
        color: var(--level-blue-fore);
        gap: 6px;
    }

    .latest-info.is-latest {
        background-color: var(--level-green-background);
        color: var(--level-green-fore);
    }

    .title-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .title {
            flex-shrink: 1;
            font-size: 20px;
            font-weight: bold;
        }

        .is-pre-release {
            min-width: max-content;
            padding: 2px 8px;
            border-radius: 16px;
            background-color: var(--level-orange-background);
            color: var(--level-orange-fore);
            font-size: 14px;
        }
    }

    .main-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 32px;
        }

        .release-time {
            margin-left: auto;
        }
    }

    .update-controls {
        display: flex;
        align-items: center;
        margin-top: 8px;
        gap: 8px;

        .up-button {
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: bold;
        }

        .up-name {
            font-family: var(--code-monospace);
        }
    }
}

.forbidden-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;

    .icon {
        font-size: 64px;
    }
}
</style>
