import { dom } from "@/lib/elemental";
import { TiebaForum } from "@/lib/tieba-components/forum";
import { defaults, map } from "lodash-es";

export interface ThreadContent {
    post: HTMLDivElement;
    replyButton: HTMLAnchorElement;
    dataField: string;
    isLouzhu: boolean;

    profile: {
        avatar: HTMLAnchorElement;
        nameAnchor: HTMLAnchorElement;
        level: number;
        badgeTitle: string;
    }

    tail: {
        location: string;
        platform: string;
        floor: string;
        time: string;
    }
}

export interface TiebaThread {
    title: string;
    reply: number;
    pages: number;

    displayWrapper: HTMLDivElement;
    lzOnlyButton: HTMLAnchorElement;
    favorButton: HTMLAnchorElement;

    forum: TiebaForum;
    cotents: ThreadContent[];

    pager: {
        listPager: HTMLLIElement;
        jumper: {
            textbox: HTMLInputElement;
            submitButton: HTMLButtonElement;
        }
    }
}

export interface PostDataField {
    author: {
        portrait: string;
        props: unknown;
        user_id: number;
        user_name: string;
        user_nickname: string;
    }

    content: {
        builderId: number;
        /** 评论数量 */
        comment_num: number;
        /** 待解析的 HTML */
        content: string;
        forum_id: number;
        isPlus: number;
        is_anonym: number;
        is_fold: number;
        pb_tpoint: unknown;
        post_id: number;
        /** 当前楼层在当前页的实际位置 */
        post_index: number;
        /** 一般意义上的楼层数 */
        post_no: number;
        props: unknown;
        thread_id: number;
        type: "0"
    }
}

export function threadParser(): TiebaThread {
    const postWrappers = dom(".l_post", "div");
    const contents = dom(".d_post_content", "div");
    const dAuthors = dom(".d_author", "div");
    const avatars = dom(".p_author_face", "a");
    const nameAnchors = dom(".p_author_name", "a");
    const levels = dom(".d_badge_lv", "div");
    const badgeTitles = dom(".d_badge_title", "div");

    const replyButtons = dom(".lzl_link_unfold", "a");

    const locations = map(dom(".post-tail-wrap span:first-child, .ip-location", "span"), el => el.innerText);
    const platforms = map(dom(".tail-info a, .p_tail_wap", "a"), el => el.innerText);
    const floors = map(dom(".j_jb_ele + .tail-info + .tail-info, .p_tail li:first-child span", "span"), el => el.innerText);
    const times = map(dom(".post-tail-wrap span:nth-last-child(2), .p_tail li:last-child span", "span"), el => el.innerText);

    const threadContents: ThreadContent[] = [];

    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.add("floor-content");
        avatars[i].classList.add("floor-avatar");
        nameAnchors[i].classList.add("floor-name");

        threadContents.push({
            post: contents[i],
            replyButton: replyButtons[i],
            dataField: defaults(postWrappers[i].getAttribute("data-field"), ""),
            isLouzhu: dom(".louzhubiaoshi_wrap", dAuthors[i]).length > 0,

            profile: {
                avatar: avatars[i],
                nameAnchor: nameAnchors[i],
                level: parseInt(levels[i].innerText),
                badgeTitle: badgeTitles[i].innerText,
            },
            tail: {
                location: locations[i],
                platform: platforms[i],
                floor: floors[i],
                time: times[i],
            },
        });
    }

    const thread: TiebaThread = {
        displayWrapper: dom(true, ".wrap2", "div"),
        title: PageData.thread.title,
        reply: parseInt(dom(true, ".l_reply_num span:nth-child(1)", "span").innerText),
        pages: PageData.pager.total_page,
        lzOnlyButton: dom(true, "#lzonly_cntn", "a"),
        favorButton: dom(true, ".j_favor", "a"),

        cotents: threadContents,
        forum: {
            info: {
                name: PageData.forum.forum_name,
                // followersDisplay: DOMS(true, ".card_menNum", "span").innerText,
                // postsDisplay: DOMS(true, ".card_infoNum", "span").innerText,
            },

            components: {
                nameAnchor: dom(true, ".card_title_fname", "a"),
                iconContainer: dom(true, ".card_head a, .plat_picbox", "a"),
                followButton: dom(true, ".card_head .focus_btn", "a"),
                signButton: dom(true, ".j_sign_box", "a"),
            },
        },
        pager: {
            listPager: dom(true, ".pb_list_pager", "li"),
            jumper: {
                textbox: dom(true, ".jump_input_bright", "input"),
                submitButton: dom(true, ".jump_btn_bright", "button"),
            },
        },
    };

    return thread;
}
