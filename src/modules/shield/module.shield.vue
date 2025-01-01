<template>
    <div class="shield-container">
        <div v-if="shieldListRef.length > 0" class="words-container">
            <UserButton v-for="sh in shieldListRef" class="shield-elem"
                :class="{ 'content-scope': sh.scope === 'posts', 'user-scope': sh.scope === 'users' }">
                <div class="icon">{{ sh.scope === "posts" ? "chat" : "account_circle" }}</div>
                {{ sh.rule }}
            </UserButton>
            <UserButton class="remove-all shield-elem icon" @click="removeAllWithConfirm">delete</UserButton>
        </div>
        <div v-else class="empty-list-container">当前没有记录屏蔽规则</div>

        <div class="shield-controls">
            <UserTextbox v-model="inputRule" :muti-lines="true" class="shield-input" placeholder="输入屏蔽规则"
                @keypress="inputKeyPress">
            </UserTextbox>

            <div class="submit-controls">
                <div class="regex-check">
                    <input v-model="useRegex" id="use-regex" type="checkbox">
                    <label for="use-regex">正则表达式</label>
                </div>

                <div class="user-scope">
                    <input v-model="scope" id="user-scope" type="checkbox">
                    <label for="user-scope">屏蔽用户名</label>
                </div>

                <UserButton class="submit-button" :shadow-border="true" :theme-style="true" @click="updateShieldList">确定
                </UserButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UserTextbox from "@/components/utils/user-textbox.vue";
import UserButton from "@/components/utils/user-button.vue";
import { ShieldObject, shieldList } from "./shield";

const shieldListRef = ref(shieldList.get());
const inputRule = ref("");
const useRegex = ref(false);
const scope = ref<ShieldObject["scope"]>("posts");

function inputKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();
        updateShieldList();
    }
}

function removeAll() {
    shieldListRef.value.length = 0;
    shieldList.remove();
}

function removeAllWithConfirm() {
    if (confirm("确定要删除所有屏蔽规则吗？")) {
        removeAll();
    }
}

function updateShieldList() {
    if (inputRule.value.length <= 0) return;

    const sh: ShieldObject = {
        rule: inputRule.value,
        type: useRegex.value ? "regex" : "string",
        scope: scope.value,
        switch: true,
    };
    shieldListRef.value.push(sh);

    inputRule.value = "";
    shieldList.set(shieldListRef.value);
}
</script>

<style lang="scss" scoped>
@use "sass:color";

.shield-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 16px;

    .words-container {
        display: flex;
        flex-wrap: wrap;
        padding: 12px;
        border-radius: 12px;
        background-color: var(--trans-light-background);
        gap: 4px;

        .shield-elem {
            display: flex;
            align-items: center;
            padding: 4px 8px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            gap: 4px;

            .icon {
                color: var(--light-fore);
            }
        }

        .remove-all {
            background-color: color.adjust(red, $saturation: -32%);
            color: var(--default-background);
            font-variation-settings: "FILL" 0;
        }
    }

    .empty-list-container {
        color: var(--minimal-fore);
    }

    .shield-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .shield-input {
            width: 100%;
            height: auto;
            max-height: 6em;
            box-sizing: border-box;
            padding: 6px;
            font-size: 16px;
            resize: none;
        }

        .submit-controls {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;

            label {
                margin-left: 4px;
                user-select: none;
            }

            .regex-check {
                margin-right: 8px;
                font-size: 16px;
            }

            .submit-button {
                padding: 4px 12px;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }
}
</style>
