<template>
    <UserDialog ref="dialog" v-bind="dialogOpts" @unload="unloadHandler(response)">
        <div ref="messageWrapper" class="message-wrapper">
            <template v-if="content">
                <div ref="messageContent" v-if="typeof content === 'string'" class="message markdown">
                    {{ content }}
                </div>
                <component v-else :is="content"></component>
            </template>
            <slot></slot>
        </div>
    </UserDialog>
</template>

<script setup lang="tsx">
import { SupportedComponent } from "@/ex";
import { ref } from "vue";
import UserDialog, { UserDialogButton, UserDialogOpts } from "../user-dialog";

export type MessageBoxType = "okOnly" | "okCancel" | "forceTrueFalse";
export type MessageBoxResponse = "positive" | "negative" | "cancel";

export interface MessageBoxOpts {
    title?: string;
    content?: string | SupportedComponent;
    type?: MessageBoxType;
}

export interface MessageBoxButton extends UserDialogButton {
    response: MessageBoxResponse;
}

const props = withDefaults(defineProps<MessageBoxOpts>(), {
    type: "okOnly",
});

const positiveButton: MessageBoxButton = {
    response: "positive",
    text: "确定",
    event: () => unloadHandler("positive"),
    style: "themed",
};
const negativeButton: MessageBoxButton = {
    response: "cancel",
    text: "取消",
    event: () => unloadHandler("cancel"),
};
const forceTrueButton: MessageBoxButton = {
    response: "positive",
    text: "接受",
    event: () => unloadHandler("positive"),
    style: "themed",
};
const forceFalseButton: MessageBoxButton = {
    response: "negative",
    text: "拒绝",
    event: () => unloadHandler("negative"),
};

const dialog = ref<InstanceType<typeof UserDialog>>();
const response = ref<MessageBoxResponse>("cancel");

const dialogOpts: UserDialogOpts = {
    animation: true,
    lockScroll: true,
    modal: true,
    title: props.title,
    force: props.type === "forceTrueFalse",
    dialogButtons: ((): UserDialogButton[] => {
        switch (props.type) {
            case "okOnly":
                return [positiveButton];
            case "okCancel":
                return [positiveButton, negativeButton];
            case "forceTrueFalse":
                return [forceTrueButton, forceFalseButton];
        }
    })(),
    defaultPayload: response.value,
};

function unloadHandler(_response: MessageBoxResponse, event?: (() => void)) {
    response.value = _response;
    event?.();
    dialog.value?.unload(_response);
}

defineExpose({
    response,
});
</script>

<style scoped lang="scss">
.message-wrapper {
    display: flex;
    overflow: hidden auto;
    flex-direction: column;
}
</style>
