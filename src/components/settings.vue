<template>
    <UserDialog v-bind="dialogOpts">
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
                        <div class="main-key-selected"></div>
                        <div class="icon">{{ setting.icon }}</div>

                        <div class="key-info">
                            <div class="key-title">{{ setting.name }}</div>
                            <div class="key-desc">{{ setting.description }}</div>
                        </div>
                    </UserButton>
                </div>
            </div>

            <div class="middle-container" v-show="selectedKey">
                <UserButton v-for="setting in selectedKey?.sub" class="key-button sub-key"
                    :class="{ 'selected': selectedSubKey?.name === setting.name }" @click="selectSubKey(setting)"
                    no-border="all">
                    <div class="key-title">{{ setting.name }}</div>
                </UserButton>
            </div>

            <div class="right-container">
                <div :key="Math.random()" v-if="selectedSubKey?.name" v-for="content in selectedSubKey.content"
                    class="setting-content">
                    <h3 v-if="content?.title" class="content-title">{{ content?.title }}</h3>
                    <p v-if="content?.description" class="content-desc">
                    <p v-if="content?.description" v-for="line in content.description.split('\n')" class="line">
                        {{ line }}
                    </p>
                    </p>

                    <div v-if="content?.widgets" v-for="widget in content.widgets" class="setting-control">
                        <!-- Toggle -->
                        <UserCheck v-if="widget.type === 'toggle'" class="settings-toggle"
                            :model-value="widget.init ? widget.init() : undefined"
                            :text="typeof widget.content === 'string' ? widget.content : undefined"
                            @change="widget.event" />

                        <!-- Icon -->
                        <div v-if="widget.type === 'icon'" class="icon-component icon">{{ widget.content }}
                        </div>

                        <!-- Button -->
                        <UserButton v-if="widget.type === 'button'" @click="widget.event" shadow-border>
                            {{ widget.content }}</UserButton>

                        <!-- Select -->
                        <select v-if="widget.type === 'select' && isLiteralObject(widget.content)"
                            @change="widget.event">
                            <option v-for="(value, key) in widget.content" :value="value"
                                :selected="widget.init && value === widget.init()">
                                {{ key }}</option>
                        </select>

                        <!-- SubTitle -->
                        <h4 v-if="widget.type === 'subTitle'" class="content-sub-title">{{ widget.content }}</h4>

                        <!-- Description -->
                        <div v-if="widget.type === 'desc'" class="content-desc">
                            <div v-if="widget.content" v-for="line in widget.content.split('\n')" class="line">
                                {{ line }}
                            </div>
                        </div>

                        <!-- Textbox & TextArea -->
                        <UserTextbox v-if="includes(['textbox', 'textarea'], widget.type)" class="content-textbox"
                            :class="{ 'textarea': widget.type === 'textarea' }"
                            :value="widget.init ? widget.init() : ''" :muti-lines="widget.type === 'textarea'"
                            :placeholder="widget.placeHolder" @change="widget.event">
                        </UserTextbox>

                        <!-- Image -->
                        <img v-if="widget.type === 'image'" class="content-image" :src="widget.content?.toString()"
                            :alt="widget.altContent" :title="widget.altContent" @load="widget.init">

                        <!-- Component -->
                        <component v-if="widget.component" :is="widget?.component" @change-view="changeView">
                        </component>
                    </div>
                </div>
                <div v-else class="empty-container filled-icon">settings</div>
            </div>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import { SupportedComponent } from "@/ex";
import { getUserSettings } from "@/lib/common/settings";
import { isLiteralObject } from "@/lib/utils";
import { debounce, find, includes } from "lodash-es";
import { ref } from "vue";
import UserCheck from "./user-check.vue";
import UserDialog, { UserDialogOpts } from "./user-dialog.vue";
import UserButton from "./utils/user-button.vue";
import UserTextbox from "./utils/user-textbox.vue";

export interface UserSettings {
    [props: string]: MainSettingKey;
}

export interface SettingKey {
    name: string;
    icon?: string;
    description?: string;
}

export interface MainSettingKey extends SettingKey {
    sub: {
        [props: string]: SubSettingKey;
    }
}

export interface SubSettingKey extends SettingKey {
    content: {
        [props: string]: SettingContent | undefined;
    }
}

export interface SettingContent {
    title?: string;
    description?: string;
    widgets?: {
        type: "toggle" | "icon" | "button" | "select" | "subTitle" | "desc" | "textbox" | "textarea" | "image" | "component";
        init?: (() => any);
        event?: ((e: any) => any);
        content?: string | LiteralObject;
        component?: SupportedComponent;
        placeHolder?: string;
        altContent?: string;
    }[]
}

const userSettings = getUserSettings();

const dialogOpts: UserDialogOpts = {
    animation: true,
    modal: true,
    lockScroll: true,
    modalStyle: {
        justifyContent: "flex-start",
    },
    contentStyle: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "max-content",
        maxWidth: "var(--content-max)",
        overflow: "hidden",
    },
};

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

defineExpose({
    dialogOpts,
});
</script>

<style lang="scss" scoped>
@use "@/stylesheets/main/animations" as *;
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
    min-width: 120px;
    align-items: center;
    padding: 12px;
    border-radius: 0;
    font-size: 16px;
    gap: 12px;
    text-align: justify;
    transition: var(--default-duration);
    white-space: nowrap;

    .icon {
        font-size: 20px;
        font-variation-settings: "FILL" 0, "wght" 300;
        transition:
            all var(--default-duration),
            margin-left $fast-animation-duration ease-out;
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

    &.main-key {
        box-sizing: content-box;

        .main-key-selected {
            width: 0;
            height: 100%;
            border-radius: 24px;
            margin-left: -12px;
            background-color: var(--tieba-theme-color);
        }

        &.selected {
            color: var(--tieba-theme-fore) !important;

            .main-key-selected {
                width: 4px;
            }

            .icon {
                margin-left: 4px;
                font-variation-settings: "FILL" 1, "GRAD" 48, "wght" 300;
                font-weight: normal;
            }

            .key-desc {
                color: var(--tieba-theme-color);
            }
        }
    }

    &.sub-key {
        text-decoration: none;
        transition: var(--default-duration);

        &.selected {
            color: var(--tieba-theme-fore);
            text-decoration: underline var(--tieba-theme-color) 2px;
        }
    }
}

.settings-wrapper {
    display: flex;
    width: 100%;
    max-width: var(--content-max);
    height: 100%;
    box-sizing: border-box;

    .left-container {
        display: flex;
        width: 30%;
        max-width: 280px;
        flex-direction: column;
        border-right: 2px solid var(--light-border-color);

        .search-controls {
            display: flex;
            flex-direction: column;
            padding: 0 $wrapper-padding $wrapper-padding 0;
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
        padding: 0 6px;
        border-right: 2px solid var(--light-border-color);
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

    $wrapper-padding-2x: $wrapper-padding * 2;
    $wrapper-padding-nega: -$wrapper-padding;

    .right-container {
        display: flex;
        overflow: auto;
        width: 50%;
        flex-direction: column;
        flex-grow: 1;
        padding: $wrapper-padding;
        margin: $wrapper-padding-nega $wrapper-padding-nega $wrapper-padding-nega 0;
        font-size: 16px;
        gap: 32px;

        .setting-content {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .content-title {
                margin: 8px 0 0;
                color: var(--highlight-fore);
                font-size: 18px;
                font-weight: bold;
            }

            .content-sub-title {
                margin: 4px 0 0;
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

                .settings-toggle {
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
