import { forEach } from "lodash-es";

/** 原生事件的代理，用于方便地注册和销毁事件。 */
export class EventProxy {
    private records: EventRecord[] = [];

    /**
     * 注册事件
     * @param target 事件目标
     * @param type 事件类型
     * @param callback 事件回调函数
     * @param options 选项
     */
    public on<E extends Event>(
        target: EventTarget,
        type: string,
        callback: ((e: E) => void) | EventListenerObject,
        options?: AddEventListenerOptions | boolean,
    ) {
        target.addEventListener(type, callback as EventListener, options);
        this.records.push({ target, type, callback, options });
    }

    /** 销毁通过该代理注册的所有事件 */
    public release() {
        forEach(this.records, ({ target, type, callback, options }) => {
            target.removeEventListener(type, callback, options);
        });
        this.records = [];
    }
}
