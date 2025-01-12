import MessageBox, { MessageBoxOpts, MessageBoxResponse } from "@/components/utils/message-box.vue";
import { renderDialog } from ".";

/**
 * 渲染标准消息对话框
 * @param opts 消息对话框的配置
 * @returns 用户操作的消息类型
 */
export async function messageBox(opts: MessageBoxOpts): Promise<MessageBoxResponse> {
    return new Promise(resolve => {
        renderDialog(MessageBox, opts, {
            beforeUnload(rendered) {
                const response = (rendered.instance as InstanceType<typeof MessageBox>).response;
                resolve(response);
            },
        });
    });
}
