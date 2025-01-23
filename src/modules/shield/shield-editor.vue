<template>
    <UserDialog ref="dialog" title="编辑" :dialog-buttons="[
        { text: '确定', event: submit, style: 'themed' },
        { text: '取消', event: unload },
    ]" :default-payload="{ ...props.rule }">
        <div id="shield-editor">
            <div id="shield-editor-rule-control">
                <label for="shield-editor-rule">规则</label>
                <UserTextbox v-model="ruleRef.content" id="shield-editor-rule" muti-lines @keypress="keyPressHandler" />
            </div>
            <div id="shield-editor-toggle-control">
                <UserCheck v-model="ruleRef.toggle" id="shield-editor-toggle" text="启用" />
                <UserCheck v-model="useRegex" id="shield-editor-regex" text="正则表达式" />
                <UserCheck v-model="userScope" id="shield-editor-user" text="屏蔽用户名" />
            </div>
            <UserButton id="shield-editor-delete" @click="deleteRule">删除规则</UserButton>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import UserCheck from "@/components/user-check.vue";
import UserDialog from "@/components/user-dialog";
import UserButton from "@/components/utils/user-button.vue";
import UserTextbox from "@/components/utils/user-textbox.vue";
import { ref } from "vue";
import { ShieldRule } from "./shield";

interface ShieldEditorOpts {
    rule: ShieldRule;
}

const props = defineProps<ShieldEditorOpts>();

const dialog = ref<InstanceType<typeof UserDialog>>();
const useRegex = ref(props.rule.type === "regex");
const userScope = ref(props.rule.scope === "username");

const ruleRef = ref({ ...props.rule });

function keyPressHandler(e: KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();
        submit();
    }
}

function submit() {
    const newRule: ShieldRule = {
        ...ruleRef.value,
        type: useRegex.value ? "regex" : "text",
        scope: userScope.value ? "username" : "content",
    };
    dialog.value?.unload(newRule);
}

function unload() {
    dialog.value?.unload({ ...props.rule });
}

function deleteRule() {
    dialog.value?.unload();
}
</script>

<style lang="scss" scoped>
#shield-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;

    #shield-editor-rule-control {
        display: flex;
        align-items: flex-start;
        gap: 6px;

        #shield-editor-rule {
            flex: 1;
            font-size: 16px;
        }

        label {
            color: var(--light-fore);
        }
    }

    #shield-editor-toggle-control {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    #shield-editor-delete {
        padding: 6px 8px;
        background-color: var(--error-color);
        color: var(--default-background);
    }
}
</style>
