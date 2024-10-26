<template>
    <div class="settings-wrapper remove-default">
        <div class="left-container">
            <div class="search-controls">
                <div class="title">设置</div>

                <!-- 搜索文本框 -->
                <UserTextbox v-model="searchText" class="search-box" placeholder="输入需要搜索的设置"
                    @update:model-value="debSearchKey"></UserTextbox>
            </div>

            <div class="left-panel">
                <UserButton v-for="setting in userSettings" class="key-button main-key"
                    :class="{ 'selected': selectedKey?.name === setting.name }" @click="selectMainKey(setting)"
                    no-border="all">
                    <div class="icon">{{ setting.icon }}</div>

                    <div class="key-info">
                        <div class="key-title">{{ setting.name }}</div>
                        <div class="key-desc">{{ setting.description }}</div>
                    </div>
                </UserButton>
            </div>
        </div>

        <div class="middle-container">
            <UserButton v-for="setting in selectedKey?.sub" class="key-button sub-key"
                :class="{ 'selected': selectedSubKey?.name === setting.name }" @click="selectSubKey(setting)"
                no-border="all">
                <div class="key-title">{{ setting.name }}</div>
            </UserButton>
        </div>

        <div v-if="selectedSubKey?.name" class="right-container">
            <div v-if="selectedSubKey?.name" v-for="content in selectedSubKey.content" class="setting-content">
                <div v-if="content?.title" class="content-title">{{ content?.title }}</div>
                <div v-if="content?.description" class="content-desc">
                    <div v-if="content?.description" v-for="line in content.description.split('\n')" class="line">
                        {{ line }}
                    </div>
                </div>

                <div v-if="content?.widgets" v-for="widget in content.widgets" class="setting-control">
                    <!-- Toggle -->
                    <ToggleButton v-if="widget.type === 'toggle'" class="settings-toggle-button icon"
                        :default-value="widget.init ? widget.init() : undefined" @click="widget.event" icon-type
                        no-border="all">
                    </ToggleButton>

                    <!-- Icon -->
                    <div v-if="widget.type === 'icon'" class="icon-component icon">{{ widget.content }}
                    </div>

                    <!-- Button -->
                    <UserButton v-if="widget.type === 'button'" @click="widget.event" shadow-border>
                        {{ widget.content }}</UserButton>

                    <!-- Select -->
                    <select v-if="widget.type === 'select' && isLiteralObject(widget.content)" @change="widget.event">
                        <option v-for="(value, key) in widget.content" :value="value"
                            :selected="widget.init && value === widget.init()">
                            {{ key }}</option>
                    </select>

                    <!-- SubTitle -->
                    <div v-if="widget.type === 'subTitle'" class="content-sub-title">{{ widget.content }}</div>

                    <!-- Description -->
                    <div v-if="widget.type === 'desc'" class="content-desc">
                        <div v-if="widget.content" v-for="line in widget.content.split('\n')" class="line">
                            {{ line }}
                        </div>
                    </div>

                    <!-- Textbox & TextArea -->
                    <UserTextbox v-if="includes(['textbox', 'textarea'], widget.type)" class="content-textbox"
                        :class="{ 'textarea': widget.type === 'textarea' }" :value="widget.init ? widget.init() : ''"
                        :muti-lines="widget.type === 'textarea'" :placeholder="widget.placeHolder"
                        @change="widget.event">
                    </UserTextbox>

                    <!-- Image -->
                    <img v-if="widget.type === 'image'" class="content-image" :src="widget.content?.toString()"
                        :alt="widget.altContent" :title="widget.altContent" @load="widget.init">

                    <!-- Component -->
                    <component v-if="widget.component" :is="widget?.component" @change-view="changeView">
                    </component>
                </div>
            </div>
        </div>
        <div v-else class="empty-container filled-icon">settings</div>
    </div>
</template>

<script lang="tsx" setup>
import { getUserSettings } from "@/lib/common/settings";
import { isLiteralObject } from "@/lib/utils";
import { debounce, find, includes } from "lodash-es";
import type { Component, VNode } from "vue";
import { ref } from "vue";
import { JSX } from "vue/jsx-runtime";
import ToggleButton from "./utils/toggle-button.vue";
import UserButton from "./utils/user-button.vue";
import UserTextbox from "./utils/user-textbox.vue";

export interface UserSettings {
    [props: string]: MainSettingKey
}

export interface SettingKey {
    name: string
    icon?: string
    description?: string
}

export interface MainSettingKey extends SettingKey {
    sub: {
        [props: string]: SubSettingKey
    }
}

export interface SubSettingKey extends SettingKey {
    content: {
        [props: string]: SettingContent | undefined
    }
}

export interface SettingContent {
    title?: string
    description?: string
    widgets?: {
        type: "toggle" | "icon" | "button" | "select" | "subTitle" | "desc" | "textbox" | "textarea" | "image" | "component"
        init?: (() => any)
        event?: ((e: Event) => any)
        content?: string | LiteralObject
        component?: Component | VNode | JSX.Element
        placeHolder?: string
        altContent?: string
    }[]
}

const userSettings = getUserSettings();

const searchText = ref("");
const selectedKey = ref<MainSettingKey>();
const selectedSubKey = ref<SubSettingKey>();

function selectMainKey(key: MainSettingKey) {
    selectedKey.value = key;
    selectedSubKey.value = undefined;
}

function selectSubKey(key: SubSettingKey) {
    selectedSubKey.value = key;
}

function changeView(key: string, sub: string) {
    selectedKey.value = userSettings[key];
    selectedSubKey.value = userSettings[key].sub[sub];
}

function clearSelections() {
    selectedKey.value = undefined;
    selectedSubKey.value = undefined;
}

function searchKey() {
    if (searchText.value.length <= 0) {
        clearSelections();
        return;
    }

    if (!find(userSettings, (mainKey) => {
        if (find(mainKey.sub, (subKey) => {
            if (subKey.name.toLowerCase().includes(searchText.value.toLowerCase())) {
                selectedKey.value = mainKey;
                selectedSubKey.value = subKey;
                return true;
            } else {
                return false;
            }
        })) return true;
        else return false;
    })) clearSelections();
}

const debSearchKey = debounce(searchKey, 500);
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/remixed-main" as *;

$wrapper-padding: 16px;

@keyframes content-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
    }
}

.key-button {
    display: flex;
    overflow: hidden;
    min-width: 80px;
    align-items: center;
    padding: 12px $wrapper-padding;
    border-radius: 0;
    box-shadow: none;
    font-size: 16px;
    gap: 12px;
    text-align: justify;
    white-space: nowrap;

    .icon {
        font-size: 20px;
        font-variation-settings: "FILL" 0, "wght" 300;
        transition: font-variation-settings 0.2s ease;
    }

    .key-info {
        display: flex;
        width: calc(100% - 2 * $wrapper-padding);
        flex-direction: column;
    }

    .key-title,
    .key-desc {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .key-desc {
        color: var(--minimal-fore);
        font-size: 14px;
    }

    &.selected {
        background-color: var(--tieba-theme-color) !important;
        color: var(--default-background) !important;
        font-weight: bold;

        .icon {
            font-variation-settings: "FILL" 1, "GRAD" 48, "wght" 300;
            font-weight: normal;
        }

        .key-desc {
            color: var(--default-background);
        }
    }
}

.settings-wrapper {
    display: flex;
    overflow: hidden;
    width: 72%;
    min-width: 720px;
    height: 72%;
    min-height: 400px;
    box-sizing: border-box;
    border: 1px solid var(--light-border-color);
    border-radius: 18px;
    margin: auto;
    animation: kf-dialog-in 0.4s ease;
    background-color: var(--default-background);
    box-shadow: 0 0 24px rgb(0 0 0 / 20%);

    .left-container {
        display: flex;
        width: 30%;
        max-width: 280px;
        flex-direction: column;

        .search-controls {
            display: flex;
            flex-direction: column;
            padding: $wrapper-padding;
            gap: 8px;

            .title {
                margin-top: 8px;
                color: var(--default-fore) !important;
                font-size: 20px;
                font-weight: bold;
                line-height: normal;
            }

            .search-box {
                padding: 6px;
                font-size: 14px;
            }
        }

        .left-panel {
            display: flex;
            box-sizing: border-box;
            flex-direction: column;
        }
    }

    .middle-container {
        display: flex;
        width: 20%;
        max-width: 220px;
        flex-direction: column;
        padding: $wrapper-padding 6px;
        background-color: var(--deep-background);
        gap: 6px;

        .sub-key {
            display: flex;
            padding: 8px 16px;
            border-radius: 12px;
            gap: 4px;

            .key-title {
                font-size: 14px;
            }
        }

        .sub-key:not(:hover, :active, :focus) {
            background-color: unset;
        }
    }

    .right-container {
        display: flex;
        overflow: auto;
        width: 50%;
        flex-direction: column;
        flex-grow: 1;
        padding: $wrapper-padding;
        animation: content-in 0.2s cubic-bezier(0, 0, 0.2, 1);
        background-color: var(--default-background);
        font-size: 14px;
        gap: 32px;

        .setting-content {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .content-title {
                color: var(--highlight-fore);
                font-size: 18px;
                font-weight: bold;
            }

            .content-sub-title {
                color: var(--default-fore);
                font-size: 16px;
                font-weight: bold;
            }

            .content-desc {
                display: flex;
                flex-direction: column;
                color: var(--light-fore);
                gap: 6px;
            }

            .content-textbox {
                box-sizing: content-box;
                margin-left: auto;

                &.textarea {
                    width: 100%;
                    height: 6em;
                    resize: none;
                }
            }

            .content-image {
                max-width: 100%;
                max-height: 320px;
                border-radius: 8px;
                margin: 0 auto;
            }

            .setting-control {
                display: flex;

                .settings-toggle-button {
                    margin-left: auto;
                    background: none;
                    font-size: 36px;

                    &.toggle-on {
                        color: var(--tieba-theme-color);
                    }

                    &.toggle-on:hover {
                        color: var(--tieba-theme-fore);
                    }
                }

                .icon-component {
                    margin-left: auto;
                    font-size: 64px;
                    font-variation-settings: "FILL" 1;
                }
            }
        }
    }

    .empty-container {
        margin: auto;
        color: var(--minimal-fore);
        font-size: 72px;
    }
}
</style>
