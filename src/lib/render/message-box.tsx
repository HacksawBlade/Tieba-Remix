import MessageBox, { MessageBoxOpts, MessageBoxResponse } from "@/components/utils/message-box.vue";
import { DialogBeforeUnloadEvent, DialogEvents, renderDialog } from ".";

/**
 * 渲染标准消息对话框
 * @param opts 消息对话框的配置
 * @returns 用户操作的消息类型
 */
export async function messageBox(opts: MessageBoxOpts) {
    const instance = await renderDialog(<MessageBox {...opts} />);
    console.log(instance);
    return new Promise((resolve) => {
        window.addEventListener(DialogEvents.BeforeUnload, handler);

        function handler(e: DialogBeforeUnloadEvent) {
            if (e.detail.renderedDialog.renderTime !== instance.renderTime) return;

            const response: MessageBoxResponse =
                (e.detail.renderedDialog.instance as InstanceType<typeof MessageBox>).response;
            resolve(response);
        }
    });
}
