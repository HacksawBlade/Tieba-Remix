import { forEach } from "lodash-es";
import { dom } from "./elemental";

export class TbObserver {
    constructor(selector: string, options?: MutationObserverInit, initEvent?: keyof WindowEventMap) {
        this.selector = selector;
        this.options = options;
        this.initEvent = initEvent;
    }

    private readonly selector: string;
    private readonly options: MutationObserverInit | undefined;
    private readonly initEvent: keyof WindowEventMap | undefined;

    readonly events: (() => void)[] = [];

    public observe() {
        const eventFuncs = () => {
            this.events.forEach(func => {
                func();
            });
        };

        if (typeof this.initEvent === "undefined") {
            eventFuncs();
        } else {
            window.addEventListener(this.initEvent, eventFuncs);
        }

        const observer = new MutationObserver(eventFuncs);
        const obsElem = dom(this.selector);
        if (obsElem) observer.observe(obsElem, this.options);
    }

    public addEvent(...events: (() => void)[]) {
        forEach(events, event => {
            if (this.events.includes(event)) return;
            if (typeof this.initEvent === "undefined") {
                event();
            } else {
                window.addEventListener(this.initEvent, event);
            }
            this.events.push(event);
        });
    }
}

/** 贴吧监控 */
// export const remixedObservers = Object.freeze({
//     /** 楼层监控 */
//     postsObserver: new TbObserver("#j_p_postlist", { childList: true }),
//     /** 楼中楼监控 */
//     commentsObserver: new TbObserver("#j_p_postlist", { childList: true, subtree: true }),
//     /** 首页动态监控 */
//     newListObserver: new TbObserver("#new_list", { childList: true }),
//     /** 进吧页面贴子监控 */
//     threadListObserver: new TbObserver("#pagelet_frs-list\\/pagelet\\/thread", { attributes: true }, "load"),
// });

/** 帖子页面 楼层监控 */
export const threadFloorsObserver = new TbObserver("#j_p_postlist", { childList: true });
/** 帖子页面 楼中楼监控 */
export const threadCommentsObserver = new TbObserver("#j_p_postlist", { childList: true, subtree: true });
/** 旧版主页 推送监控 */
export const legacyIndexFeedsObserver = new TbObserver("#new_list", { childList: true });
/** 进吧页面 贴子监控 */
export const forumThreadsObserver = new TbObserver("#pagelet_frs-list\\/pagelet\\/thread", { attributes: true }, "load");
