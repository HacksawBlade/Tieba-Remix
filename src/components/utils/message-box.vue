<template>
    <CommonDialog v-bind="dialogOpts">
        <div ref="messageWrapper" class="message-wrapper">
            <template v-if="content">
                <div ref="messageContent" v-if="typeof content === 'string'" class="message markdown">
                    {{ content }}
                </div>
                <component v-else :is="content"></component>
            </template>
            <slot></slot>
        </div>
    </CommonDialog>
</template>

<script setup lang="tsx">
import { SupportedComponent } from "@/ex";
import { unloadDialog } from "@/lib/render";
import CommonDialog, { CommonDialogButton, CommonDialogOpts } from "../common-dialog.vue";

export type MessageBoxType = "default" | "okCancel" | "forceTrueFalse";
export type MessageBoxResponse = "positive" | "negative" | "cancel";

export interface MessageBoxOpts {
    title?: string;
    content?: string | SupportedComponent;
    type?: MessageBoxType;
}

export interface MessageBoxButton extends CommonDialogButton {
    response: MessageBoxResponse;
}

const props = withDefaults(defineProps<MessageBoxOpts>(), {
    type: "default",
});

const emit = defineEmits<{ (e: MessageBoxResponse, response: MessageBoxResponse): void }>();

const positiveButton: MessageBoxButton = {
    response: "positive",
    text: "确定",
    event: () => emitAndClose("positive"),
    style: "themed",
};
const negativeButton: MessageBoxButton = {
    response: "cancel",
    text: "取消",
    event: () => emitAndClose("cancel"),
};
const forceTrueButton: MessageBoxButton = {
    response: "positive",
    text: "接受",
    event: () => emitAndClose("positive"),
};
const forceFalseButton: MessageBoxButton = {
    response: "negative",
    text: "拒绝",
    event: () => emitAndClose("negative"),
};

const dialogOpts: CommonDialogOpts = {
    animation: true,
    lockScroll: true,
    modal: true,
    title: props.title,
    force: props.type === "forceTrueFalse",
    dialogButtons: ((): CommonDialogButton[] => {
        switch (props.type) {
            case "default":
                return [positiveButton];
            case "okCancel":
                return [positiveButton, negativeButton];
            case "forceTrueFalse":
                return [forceTrueButton, forceFalseButton];
        }
    })(),
};

let response: MessageBoxResponse = "positive";

function emitAndClose(res: MessageBoxResponse) {
    emit(res, res);
    response = res;
    unloadDialog();
}

defineExpose({
    dialogOpts,
    response,
});
</script>

<style scoped lang="scss">
@use "@/stylesheets/main/remixed-main" as *;

.message-wrapper {
    display: flex;
    overflow: hidden auto;
    flex-direction: column;
}
</style>
