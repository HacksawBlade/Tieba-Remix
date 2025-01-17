<template>
    <div class="shield-container">
        <div v-if="shieldListRef.length > 0" class="words-container">
            <UserButton v-for="(sh, index) in shieldListRef" class="shield-elem" :class="{
                'content-scope': sh.scope === 'content',
                'user-scope': sh.scope === 'username',
                'disabled': !sh.toggle,
            }" @click="editRule(sh, index)">
                <div class="icon">{{ sh.scope === "content" ? "chat" : "account_circle" }}</div>
                <p class="content">{{ sh.content }}</p>
            </UserButton>
            <UserButton class="remove-all shield-elem icon" @click="removeAllWithConfirm">delete</UserButton>
        </div>
        <div v-else class="empty-list-container">当前没有记录屏蔽规则</div>

        <div class="shield-controls">
            <UserTextbox v-model="inputRule" muti-lines class="shield-input" placeholder="输入屏蔽规则，按下 [ENTER] 提交。"
                @keypress="inputKeyPress">
            </UserTextbox>

            <div class="submit-controls">
                <UserCheck v-model="useRegex" id="use-regex" text="正则表达式" />
                <UserCheck v-model="userScope" id="user-scope" text="屏蔽用户名" />
                <UserButton class="submit-button" :shadow-border="true" :theme-style="true" @click="updateShieldList">确定
                </UserButton>
            </div>
        </div>
    </div>
</template>

<script lang="tsx" setup>
import UserCheck from "@/components/user-check.vue";
import UserButton from "@/components/utils/user-button.vue";
import UserTextbox from "@/components/utils/user-textbox.vue";
import { renderDialog } from "@/lib/render";
import { messageBox } from "@/lib/render/message-box";
import { ref } from "vue";
import { ShieldRule, shieldList } from "./shield";
import ShieldEditor from "./shield-editor.vue";

const shieldListRef = ref<ShieldRule[]>(shieldList.get());
const inputRule = ref("");
const useRegex = ref(false);
const userScope = ref(false);

function inputKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();
        updateShieldList();
    }
}

function editRule(rule: ShieldRule, index: number) {
    renderDialog(ShieldEditor, { rule }, {
        unloaded(rule?: ShieldRule) {
            if (!rule) {
                shieldListRef.value.splice(index, 1);
                shieldList.set(shieldListRef.value);
                return;
            }
            shieldListRef.value[index] = rule;
            shieldList.set(shieldListRef.value);
        },
    });
}

function removeAll() {
    shieldListRef.value.length = 0;
    shieldList.remove();
}

async function removeAllWithConfirm() {
    if (await messageBox({
        content: "该操作将无法恢复，确定要删除所有屏蔽规则吗？",
        type: "forceTrueFalse",
    }) === "positive") {
        removeAll();
    }
}

function updateShieldList() {
    if (inputRule.value.length <= 0) return;

    const rule: ShieldRule = {
        content: inputRule.value,
        type: useRegex.value ? "regex" : "text",
        scope: userScope.value ? "username" : "content",
        toggle: true,
    };
    shieldListRef.value.push(rule);

    inputRule.value = "";
    shieldList.set(shieldListRef.value);
}
</script>

<style lang="scss" scoped>
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

            &.disabled {
                opacity: 0.5;

                .content {
                    text-decoration: line-through;
                }
            }

            .icon {
                color: var(--light-fore);
            }
        }

        .remove-all {
            background-color: var(--error-color);
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

            .submit-button {
                padding: 4px 12px;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }
}
</style>
