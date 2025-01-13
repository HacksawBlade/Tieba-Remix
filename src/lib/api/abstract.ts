import { dom } from "@/lib/elemental";

export interface TiebaAbstract {
    el: HTMLElement;
}

export class TiebaComponent<T extends keyof HTMLElementTagNameMap> {
    private selector: string;
    private parent?: Element;

    constructor(selector: string, parent?: Element) {
        this.selector = selector;
        this.parent = parent;
    }

    public get() {
        if (!this.parent) {
            return dom<T>(this.selector, [])[0];
        }
        return dom<T>(this.selector, this.parent, [])[0];
    }
}
