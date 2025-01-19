import { dom } from "@/lib/elemental";
import { TiebaForum } from "@/lib/tieba-components/forum";
import _ from "lodash";

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
    const postWrappers = dom<"div">(".l_post", []);
    const contents = dom<"div">(".d_post_content", []);
    const dAuthors = dom<"div">(".d_author", []);
    const avatars = dom<"a">(".p_author_face", []);
    const nameAnchors = dom<"a">(".p_author_name", []);
    const levels = dom<"div">(".d_badge_lv", []);
    const badgeTitles = dom<"div">(".d_badge_title", []);

    const replyButtons = dom<"a">(".lzl_link_unfold", []);

    const locations = _.map(dom<"span">(".post-tail-wrap span:first-child, .ip-location", []), el => el.innerText);
    const platforms = _.map(dom<"a">(".tail-info a, .p_tail_wap", []), el => el.innerText);
    const floors = _.map(dom<"span">(".j_jb_ele + .tail-info + .tail-info, .p_tail li:first-child span", []), el => el.innerText);
    const times = _.map(dom<"span">(".post-tail-wrap span:nth-last-child(2), .p_tail li:last-child span", []), el => el.innerText);

    const threadContents: ThreadContent[] = [];

    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.add("floor-content");
        avatars[i].classList.add("floor-avatar");
        nameAnchors[i].classList.add("floor-name");

        threadContents.push({
            post: contents[i],
            replyButton: replyButtons[i],
            dataField: _.defaults(postWrappers[i].getAttribute("data-field"), ""),
            isLouzhu: !!dom(".louzhubiaoshi_wrap", dAuthors[i]),

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
        displayWrapper: dom<"div">(".wrap2", [])[0],
        title: PageData.thread.title,
        reply: +(dom<"span">(".l_reply_num span:nth-child(1)")?.innerText ?? 0),
        pages: PageData.pager.total_page,
        lzOnlyButton: dom<"a">("#lzonly_cntn", [])[0],
        favorButton: dom<"a">(".j_favor", [])[0],

        cotents: threadContents,
        forum: {
            info: {
                name: PageData.forum.forum_name,
                // followersDisplay: DOMS(true, ".card_menNum", "span").innerText,
                // postsDisplay: DOMS(true, ".card_infoNum", "span").innerText,
            },

            components: {
                nameAnchor: dom<"a">(".card_title_fname", [])[0],
                iconContainer: dom<"a">(".card_head a, .plat_picbox", [])[0],
                followButton: dom<"a">(".card_head .focus_btn", [])[0],
                signButton: dom<"a">(".j_sign_box", [])[0],
            },
        },
        pager: {
            listPager: dom<"li">(".pb_list_pager", [])[0],
            jumper: {
                textbox: dom<"input">(".jump_input_bright", [])[0],
                submitButton: dom<"button">(".jump_btn_bright", [])[0],
            },
        },
    };

    return thread;
}
