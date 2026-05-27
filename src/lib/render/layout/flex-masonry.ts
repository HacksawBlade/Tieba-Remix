/**
 * Flex Masonry
 * @author @0x0b1ade
 * @version 1.1
 * @license MIT
 */

export class FlexMasonry {
    private container: HTMLElement;
    private items: MasonryElement[];
    private columnContainers: HTMLDivElement[] = [];
    private columnWidth: number;
    private gap: [number, number];
    private options: MasonryOptions;

    private containerSelector: string | undefined;
    private itemsSelector: string | undefined;
    private columnSelector = ".masonry-column";
    private columnsHeight: number[] = [];
    private fragment: DocumentFragment | undefined;

    /** 当前布局的列数 */
    private _columns: number;

    constructor(options: MasonryOptions) {
        options = parseOptions(options);

        this.container = (() => {
            if (typeof options.container === "string") {
                this.containerSelector = options.container;

                const _container = document.querySelector(options.container);
                if (_container) {
                    return _container;
                } else {
                    throw new Error("Can't find container element.");
                }
            } else {
                return options.container;
            }
        })() as HTMLElement;

        if (options.items) {
            this.items = (() => {
                if (typeof options.items === "string") {
                    this.itemsSelector = options.items;

                    const _items = document.querySelectorAll(options.items);
                    if (_items) {
                        return Array.from(_items);
                    } else {
                        return [];
                    }
                } else {
                    return options.items;
                }
            })().map((el) => {
                (el as HTMLElement).style.visibility = "hidden";
                return {
                    element: el as HTMLElement,
                    cachedHeight: el.clientHeight,
                } as MasonryElement;
            });
        } else {
            this.items = [];
        }

        this.columnWidth = options.columnWidth;

        if (options.gap) {
            if (Array.isArray(options.gap)) {
                this.gap = options.gap;
            } else {
                this.gap = [options.gap, options.gap];
            }
        } else {
            this.gap = [0, 0];
        }

        this._columns = 0;

        this.options = options;

        this.initStyle();

        if (options.autoExec) {
            this.exec();
        }
    }

    private initStyle() {
        this.container.style.display = "flex";
        this.container.style.alignItems = "flex-start";
        this.container.style.justifyContent = "center";
        this.container.style.gap = `${this.gap[0]}px`;
    }

    public get columns() {
        return this._columns;
    }

    /** 执行布局 */
    public exec() {
        this.calcColumns();
        const originalPosition = window.scrollY; /* || window.pageYOffset */

        this.calc();
        this.layout();

        if (this.options.fixScrollOffset) {
            window.scrollTo(0, originalPosition);
        }
    }

    adjustWidth() {
        const elColumns = this.container.querySelectorAll(this.columnSelector);
        const width =
            (this.container.clientWidth - this.gap[0] * (this._columns - 1)) /
            this._columns;
        elColumns.forEach((el) => {
            (el as HTMLElement).style.width = `${width}px`;
        });
    }

    /** 仅计算布局 */
    calc() {
        this.columnsHeight = Array(this.calcColumns()).fill(0);

        const fragment = document.createDocumentFragment();

        const _col = this.container.querySelectorAll(this.columnSelector);
        _col.forEach((col) => {
            col.remove();
        });

        this.columnContainers.length = 0;
        for (let i = 0; i < this._columns; i++) {
            this.columnContainers.push(
                fragment.appendChild(
                    createNewElement("div", {
                        class: this.columnSelector.substring(1),
                        style: `width: ${(this.container.clientWidth - this.gap[0] * (this._columns - 1)) / this._columns}px;`,
                    }),
                ),
            );
        }

        this.columnContainers.forEach((ccontainer) => {
            ccontainer.style.display = "flex";
            ccontainer.style.flexDirection = "column";
            ccontainer.style.gap = `${this.gap[1]}px`;
        });

        this.items.forEach((el) => {
            this._appendElement(el);
        });

        this.fragment = fragment;
    }

    /**
     * 仅应用布局
     *
     * 调用该函数前需要已经至少计算过一次布局
     */
    public layout() {
        if (this.fragment) {
            this.container.appendChild(this.fragment);
            // this.removeUnusedColumns();
        } else {
            throw Error(
                "Never conducted layout calculations before. You should use exec() or calc() first.",
            );
        }
    }

    private removeUnusedColumns() {
        const _col = this.container.querySelectorAll(this.columnSelector);
        _col.forEach((col) => {
            if (col.children.length === 0) {
                col.remove();
            }
        });
    }

    /**
     * 清空布局中的所有 `items`
     *
     * 该操作并不会将元素从文档中移除
     */
    clear() {
        this.items.length = 0;
        this.columnsHeight = Array(this.calcColumns()).fill(0);
    }

    /** 仅计算当前需要的列数 */
    public calcColumns() {
        this._columns = Math.ceil(
            (this.container.clientWidth - this.columnWidth) /
            (this.columnWidth + this.gap[0]),
        );
        return this._columns;
    }

    /**
     * 向布局中加入元素
     * @param el 要添加的元素
     */
    public appendElement(...elems: Element[]) {
        const masonryElements = elems.map((el) => {
            return {
                element: el,
                cachedHeight: el.clientHeight,
            } as MasonryElement;
        });

        this._appendElement(...masonryElements);
        this.items.push(...masonryElements);
    }

    private _appendElement(...elems: MasonryElement[]) {
        elems.forEach((el) => {
            const minIndex = this.columnsHeight.indexOf(Math.min(...this.columnsHeight));
            this.columnsHeight[minIndex] += el.cachedHeight;
            this.columnContainers[minIndex].appendChild(el.element);
            el.element.style.visibility = "visible";

            const clientHeight = this.columnContainers[minIndex].clientHeight;
            if (clientHeight !== 0) {
                this.columnsHeight[minIndex] =
                    this.columnContainers[minIndex].clientHeight;
            }
        });
    }

    /**
     * 在原有子项的基础上追加子项
     * @param newItems 要添加的新元素，接受 CSS选择器
     * @param interval 插入每个元素间的时间间隔
     */
    public append(newItems?: Element[] | string, interval?: number) {
        const appended = (() => {
            if (newItems) {
                if (typeof newItems === "string") {
                    const _items = document.querySelectorAll(newItems);
                    return Array.from(_items) as HTMLElement[];
                } else {
                    return newItems as HTMLElement[];
                }
            } else {
                if (this.itemsSelector) {
                    const _items = Array.from(
                        document.querySelectorAll(this.itemsSelector),
                    );

                    const appendCount = _items.length - this.items.length;

                    if (appendCount > 0) {
                        const _appended = _items.slice(-appendCount);
                        return _appended;
                    }
                }
            }
        })();

        if (appended) {
            if (!interval || interval <= 0) {
                appended.forEach((el) => {
                    this.appendElement(el);
                });
            } else {
                appended.forEach((el, index) => {
                    setTimeout(() => {
                        this.appendElement(el);
                    }, interval * index);
                });
            }
        }
    }

    refreshContainer() {
        if (this.containerSelector) {
            const newContainer = document.querySelector(this.containerSelector);
            if (newContainer) {
                this.container = newContainer as HTMLElement;
            }
        }
    }
}

export interface MasonryOptions {
    /**
     * 容器
     *
     * 接受 `Element` 或 `CSS Selector`
     */
    container: Element | string;

    /**
     * 元素
     *
     * 接受 `Element` 或 `CSS Selector`
     */
    items?: Element[] | string;

    /** 列宽 */
    columnWidth: number;

    /**
     * 间距
     *
     * - 传入 `number` 时会将行间距和列间距设置为相同值
     * - 若想分别设置行间距与列间距，需传入 `[列间距, 行间距]`
     *
     * 默认值为 `0`
     */
    gap?: number | [number, number];

    /**
     * 是否在初始化时自动执行布局
     *
     * 默认值为 `true`
     */
    autoExec?: boolean;

    /**
     * 是否在执行 `exec()` 时修正视图偏移
     *
     * 默认值为 `true`
     */
    fixScrollOffset?: boolean;
}

interface LiteralObject {
    [props: string]: unknown;
}

interface MasonryElement<T extends HTMLElement = HTMLElement> {
    element: T;
    cachedHeight: number;
}

function parseOptions(options: MasonryOptions) {
    options.gap = options.gap ?? 0;
    options.autoExec = options.autoExec === undefined ? true : options.autoExec;
    options.fixScrollOffset =
        options.fixScrollOffset === undefined ? false : options.fixScrollOffset;

    return options;
}

function createNewElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    attrs?: LiteralObject,
): HTMLElementTagNameMap[T] {
    const el = document.createElement(tag);

    for (const key in attrs) {
        el.setAttribute(key, attrs[key] as string);
    }

    return el;
}
