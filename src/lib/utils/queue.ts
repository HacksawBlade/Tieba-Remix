export class Queue<T> {
    constructor(items?: Array<T>) {
        if (items) {
            this.items = items;
        }
    }

    private items: T[] = [];

    /** 队首 */
    peek() {
        return this.items[0] ? this.items[0] : undefined;
    }

    /** 队列长度 */
    length() {
        return this.items.length;
    }

    /** 入队 */
    enqueue(...elements: T[]): void {
        this.items.push(...elements);
    }

    /** 出队 */
    dequeue(): T | undefined {
        return this.items.shift();
    }

    /** 队列是否为空 */
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /** 清空队列 */
    clear(): void {
        this.items = [];
    }
}
