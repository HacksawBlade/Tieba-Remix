import { dom } from "@/lib/elemental";
import { requestBody, requestInstance } from "@/lib/utils";
import { defaultTo, forEach, join, split } from "lodash-es";

/** 贴吧 API */
export const tiebaAPI = {
    /** 首页推荐 */
    feedlist: () =>
        fetch(`/f/index/feedlist?${requestBody({
            "is_new": 1,
            "tag_id": "like",
        })}`),

    /** 用户头像 */
    URL_profile: (portrait: string) =>
        `https://gss0.baidu.com/7Ls0a8Sm2Q5IlBGlnYG/sys/portrait/item/${portrait}`,

    /** 当前登录用户信息 */
    userInfo: (serverTime?: number) =>
        fetch(`/f/user/json_userinfo?${requestBody({
            "_": serverTime,
        })}`),

    /** 用户主页 */
    URL_userHome: (portrait: string) =>
        `/home/main?id=${portrait}&fr=index`,

    /** 搜索建议 */
    suggestions: (query?: string, encoding = "UTF-8", serverTime?: number) =>
        fetch(`/suggestion?${requestBody({
            "query": query,
            "ie": encoding,
            "_": serverTime,
        })}`),

    /** 贴吧热议 */
    topicList: () =>
        fetch("/hottopic/browse/topicList"),

    /** 吧跳转 */
    URL_forum: (keywords: string, encoding = "utf-8") =>
        `/f?ie=${encoding}&kw=${keywords}`,

    /** 未读消息 */
    unreadMessages: (serverTime?: number) =>
        fetch(`/im/pcmsg/query/getAllUnread?${requestBody({
            "_": serverTime,
        })}`),

    /** 收藏更新 */
    favUpdateNum: () =>
        fetch("/sysmsg/userpost/queryStoreUpdateNum"),

    /** 获取 tbs */
    tbs: () =>
        fetch("/dc/common/tbs"),

    /** imgtbs */
    imgtbs: () =>
        fetch("/dc/common/imgtbs"),

    /** 获取已关注的吧 */
    followedForums: () =>
        fetch("/mo/q/newmoindex"),

    /** 更详细的用户信息 */
    userInfoAll: (un: string, encoding = "UTF-8") =>
        fetch(`/home/get/panel?${requestBody({
            "ie": encoding,
            "un": un,
        })}`),

    /** 关注吧 */
    followForum: (tbs: string, forumId: number, forumName: string) =>
        fetch(`/mo/q/favolike?${requestBody({
            "itb_tbs": tbs,
            "fid": forumId,
            "kw": forumName,
        })}`),

    /** 取消关注吧 */
    unfollowForum: (tbs: string, forumName: string) =>
        fetch(`/mo/q/delmylike?${requestBody({
            "itb_tbs": tbs,
            "forum_name": forumName,
        })}`),

    /** 通过 `uid` 查找用户 */
    getUserFromUID: (uid: string) =>
        fetch(`/im/pcmsg/query/getUserInfo?${requestBody({
            "chatUid": uid,
        })}`),

    /** 一键签到（Web 端） */
    oneKeySign: () =>
        fetch("/tbmall/onekeySignin1"),

    /** 热门动态 */
    hotFeeds: (un: string, pn: number, encoding = "utf-8", serverTime?: number) =>
        fetch(`/mo/q/newmoindex?${requestBody({
            "un": un,
            "pn": pn,
            "ie": encoding,
            "_": serverTime,
        })}`),

    /** 获取当前页所有楼中楼数据 */
    totalComments: (timeStamp: number, tid: number, fid: number, pn: number, lzOnly = false) =>
        fetch(`/p/totalComment?${requestBody({
            "t": timeStamp,
            "tid": tid,
            "fid": fid,
            "pn": pn,
            "see_lz": Number(lzOnly),
        })}`),

    /** 获取热门话题相关贴 */
    topicRelatedThreads: (topicName: string, page: number, lastId: number, topicId: number, sortType = 1) =>
        fetch(`/hottopic/browse/getTopicRelateThread?${requestBody({
            "topic_name": topicName,
            "page_no": page,
            "last_id": lastId,
            "topic_id": topicId,
            "sort_type": sortType,
        })}`),

    /** 将贴子添加到收藏 */
    addFavoritePost: (tbs: string, tid: number, fid: number, encoding = "utf-8") =>
        fetch("/i/submit/open_storethread", {
            method: "POST",
            body: JSON.stringify({ tbs, tid, fid, encoding }),
        }),

    forumSignInfo: (forumName: string, encoding = "utf-8") =>
        fetch(`/sign/info?${requestBody({
            "kw": forumName,
            "ie": encoding,
        })}`),

    forumLoadMonth: (forumName: string, encoding = "utf-8") =>
        fetch(`/sign/loadmonth?${requestBody({
            "kw": forumName,
            "ie": encoding,
        })}`),

    addFloor: (tbs: string, forum: string, forumId: number, threadId: number, content: string, floorNum: number, richText: boolean, ev = "comment", __type__ = "reply") =>
        fetch("/f/commit/post/add", {
            method: "POST",
            body: JSON.stringify({
                "ie": "utf-8",
                "kw": forum,
                "fid": forumId,
                "tid": threadId,
                "floor_num": floorNum,
                "rich_text": Number(richText),
                "tbs": tbs,
                "content": content,
                "basilisk": 1,
                "nick_name": PageData.user.user_nickname,
                "ev": ev,
                "biz[po]": PageData.user.portrait.split("?")[0],
                "__type__": __type__,
                "geetest_success": 0,
            }),
        }),
};

/** 贴吧请求收到的响应 */
export interface TiebaResponse1 {
    no: number
    error: string
}

/** 贴吧请求收到的响应 */
export interface TiebaResponse2 {
    errmsg: string
    errno: number
}

/** 推荐贴子请求收到的响应 */
export interface FeedListResponse extends TiebaResponse1 {
    data: {
        total: number
        has_more: number
        html: string
        last_tid: string
    };
}

/** 请求用户信息收到的响应 */
export interface UserInfoResponse extends TiebaResponse1 {
    data: {
        emial: string
        is_half_user: number
        is_login: boolean
        mobilephone: string
        no_un: number
        open_uid: number
        session_id: string
        show_nickname: string
        source_id: number
        user_is_verify: number
        user_itieba_id: string
        user_name_link: string
        user_name_show: string
        user_name_url: string
        user_name_weak: string
        user_open_space: number
        user_portrait: string
        weak_pwd: boolean
    }
}

export interface SearchData1 {
    content_num: number
    idx_num: number
    real_discuss_num: number
    sug_type: number
    topic_desc: string
    topic_id: string
    topic_name: string
    topic_pic: string
    topic_title: string
    topic_url: string
}

export interface SearchData2 {
    fname: string
    fpic: string
    member_num: number
    thread_num: number
    forum_desc: string
    sug_type: number
    fclass1: string
    fclass2: string
}

export interface SuggestionResponse {
    error: number
    query_match: {
        search_data: SearchData2[] | null
    }
    query_tag: {
        search_data: SearchData1[] | null
    },
    query_tips: {
        search_data: SearchData2[] | null
    },
    query_operate: {
        search_data: SearchData1[] | null
    },
    suggest_game: {
        search_data: SearchData1[] | null
    },
    hottopic_list: {
        search_data: SearchData1[] | null
    }
}

export interface TopicList {
    /** 概述 */
    abstract: string
    content_num: number
    create_time: number
    discuss_num: number
    idx_num: number
    /** "0" / "1" */
    is_video_topic: string
    tag: number
    /** 话题缩略图 */
    topic_avatar: string
    /** 缺省话题图 */
    topic_default_avatar: string
    topic_desc: string
    topic_id: number
    /** 话题简略标题 */
    topic_name: string
    /** 话题图（全尺寸） */
    topic_pic: string
    topic_url: string
}

interface Topic {
    module_title: string
    topic_list: TopicList[]
}

export interface TopicListResponse extends TiebaResponse2 {
    data: {
        bang_head_pic: string
        /** 热议话题 */
        bang_topic: Topic
        /** 热门趋势 */
        manual_topic: Topic
        /** 推荐话题 */
        sug_topic: Topic
        /** 常用话题 */
        user_his_topic: Topic
        timestamp: number
    }
}

export interface UserUnreadResponse extends TiebaResponse2 {
    /**
     * | id | name | type |
     * | :- | :- | :- |
     * | 1 | 系统通知 | `sys` |
     * | 2 | 吧主通知 | `barowner` |
     * | 3 | T豆通知 | `beans` |
     * | 4 | 活动通知 | `activity` |
     */
    data: {
        category_id: number
        category_name: string
        category_type: string
        unread_count: number
    }[]
}

export interface FavUpdateNumResponse extends TiebaResponse2 {
    num: number
}

export interface TBSResponse {
    tbs: string
    is_login: number
}

interface LikeForum {
    forum_name: string
    user_level: number
    user_exp: string
    forum_id: number
    is_like: boolean
    favo_type: number
    is_sign: number
}

export interface FollowedForumsResponse extends TiebaResponse1 {
    error: "success" | "not logined!"
    data: {
        uid: number
        tbs: string
        itb_tbs: string
        like_forum: LikeForum[]
        ubs_sample_ids: string
        ubs_abtest_config: Array<{ sid: string }>
    }
}

export interface OneKeySignResponse extends TiebaResponse1 {
    error: "success" | "there is no forum",
    data: {
        /** 已签到数量 */
        signedForumAmount: number
        /** 签到失败数量 */
        signedForumAmountFail: number
        /** 未签到数量 */
        unsignedForumAmount: number
        /** VIP 额外签到数量 */
        vipExtraSignedForumAmount: number
        /** 本次签到成功的吧 */
        forum_list: {
            cont_sign_num: number
            forum_id: number
            forum_name: string
            is_sign_in: number
            level_id: number
            loyalty_score: {
                high_score: number
                normal_score: number
            }
        }[]
        /** 本次签到增加的经验 */
        gradeNoVip: number
        /** VIP 本次签到增加的经验 */
        gradeVip: number
    }
}

/**
 * 将带有完整贴子信息的 HTML 元素解析为 `TiebaPost` 对象
 * @param elem 包含完整贴子信息的元素，一般是 `HTMLLIElement`
 * @returns `TiebaPost` 对象
 */
export function parsePostFromElement(elem: Element): TiebaPost {
    // console.log("🚀 ~ file: api/tieba.ts:19 ~ parsePostFromElement ~ elem:", elem);
    const titleTagWrapperAnch = dom<"a">(".title-tag-wraper a", elem);
    const threadNameWrapper = elem.getElementsByClassName("thread-name-wraper")[0];
    const threadNameWrapperAnch = threadNameWrapper.getElementsByTagName("a")[0];
    const listPostNum = dom(".list-post-num em", threadNameWrapper);
    const imgs = dom<"img">("img:not(.nicknameEmoji)", elem, []);
    const nReply = elem.getElementsByClassName("n_reply")[0];
    const nReplyAnch = nReply.getElementsByTagName("a")[0];

    // 图片
    const imgArray = <TiebaPost["images"]>[];
    if (imgs.length > 0) {
        forEach(imgs, (img) => {
            imgArray.push({
                thumb: img.src,
                original: defaultTo(img.getAttribute("original"), ""),
            });
        });
    }

    return {
        id: defaultTo(elem.getAttribute("data-thread-id"), ""),
        forum: {
            id: defaultTo(elem.getAttribute("data-forum-id"), ""),
            name: titleTagWrapperAnch?.title ?? "",
            href: titleTagWrapperAnch?.href ?? "",
        },
        author: {
            portrait: split(nReplyAnch.href, /(\?id=)|&/)[2],
            name: transEmojiFromDOMString(nReplyAnch.innerHTML),
            href: nReplyAnch.href,
        },
        time: defaultTo(elem.getElementsByClassName("time")[0].textContent, ""),
        title: threadNameWrapperAnch.title,
        content: defaultTo(elem.getElementsByClassName("n_txt")[0].textContent, ""),
        replies: defaultTo(listPostNum?.getAttribute("data-num"), 0),
        images: imgArray,
    };
}

export function parsePostsFromString(
    responseString: string,
    callbackfn?: ((thread: TiebaPost) => void)
) {
    const feedList: TiebaPost[] = [];
    const dom = new DOMParser().parseFromString(responseString, "text/html");
    const threads = dom.getElementsByClassName("j_feed_li");
    const undesired = "home-place-item";
    // console.log("🚀 ~ file: api/tieba.ts:57 ~ awaitresponse.json ~ threads:", threads);

    forEach(threads, (thread) => {
        if (thread.classList.contains(undesired)) return;
        const post = parsePostFromElement(thread);
        if (callbackfn) callbackfn(post);
        feedList.push(post);
    });

    return feedList;
}

/**
 * 请求一次当前用户贴吧推荐列表，一般能获取到 10 个
 * @param callbackfn 回调函数
 * ```
 * callbackfn(thread: TiebaPost)
 * ```
 * 会在每个贴子被解析为 `TiebaPost` 对象时执行一次，并携带该对象作为参数
 * @returns 本次请求获取到的所有推荐贴子
 */
export async function getFeedList(
    callbackfn?: ((thread: TiebaPost) => void)
): Promise<TiebaPost[]> {
    const feedList: TiebaPost[] = [];
    // const undesired = "home-place-item";
    const response = await tiebaAPI.feedlist();

    if (response.ok) {
        await response.json().then((value: FeedListResponse) => {
            // const dom = new DOMParser().parseFromString(value.data.html, "text/html");
            // const threads = dom.getElementsByClassName("j_feed_li");
            // // console.log("🚀 ~ file: api/tieba.ts:57 ~ awaitresponse.json ~ threads:", threads);

            // forEach(threads, (thread) => {
            //     if (thread.classList.contains(undesired)) return;
            //     const post = parsePostFromElement(thread);
            //     if (callbackfn) callbackfn(post);
            //     feedList.push(post);
            // });

            parsePostsFromString(value.data.html, (thread) => {
                if (callbackfn) callbackfn(thread);
                feedList.push(thread);
            });
        });
    }

    return feedList;
}

export function addFloorInstance(content: string) {
    return tiebaAPI.addFloor(PageData.tbs, PageData.forum.name, parseInt(PageData.forum.id), PageData.thread.thread_id, content, PageData.thread.reply_num + 1, true);
}

export async function addFavorInstance(tid: number, fid: number) {
    const tbs: string = await requestInstance(tiebaAPI.tbs());
    return await requestInstance(tiebaAPI.addFavoritePost(tbs, tid, fid));
}

/**
 * 将带有 `img` 标签的字符串还原为带 emoji 的字符串
 * @param str 带有 `img` 标签的字符串
 * @returns 被还原的字符串
 */
export function transEmojiFromDOMString(str: string) {
    // 从 a标签提取emoji index
    const indexRegex = /(?<=nickemoji\/).*?(?=.png)/gi;

    if (!str.match(indexRegex)) return str;

    // 原 emoji
    const emojis = [
        "º", "\u25CE", "\u25AB", "\u25C6", "\u2664", "\u2640",
        "\u2642", "\u10DA", "\u266C", "\u261E", "\u261C", "\u2706", "\u260E",
        "\u264B", "\u03A9", "\u2103", "\u2109", "\uD83D\uDE04", "\uD83D\uDE0D",
        "\uD83D\uDE18", "\uD83D\uDE1A", "\uD83D\uDE1C", "\uD83D\uDE33", "\uD83D\uDE01",
        "\uD83D\uDE1E", "\uD83D\uDE22", "\uD83D\uDE02", "\uD83D\uDE2B", "\uD83D\uDE28",
        "\uD83D\uDE31", "\uD83D\uDE21", "\uD83D\uDE37", "\uD83D\uDE32", "\uD83D\uDE08",
        "\uD83D\uDC37", "\uD83D\uDC36", "\uD83D\uDC11", "\uD83D\uDC35", "\uD83D\uDC28",
        "\uD83D\uDC34", "\uD83D\uDC3C", "\uD83D\uDC2F", "\uD83C\uDF6A", "\uD83C\uDF7A",
        "\uD83C\uDF66", "\uD83C\uDF6D", "\uD83C\uDF57", "\uD83C\uDF7C", "\uD83D\uDD2F",
        "\uD83C\uDF52", "\uD83D\uDC40", "\uD83D\uDC2D", "\uD83D\uDE07", "\uD83D\uDE3A",
        "\uD83D\uDE3B", "\uD83D\uDE40", "\uD83D\uDE3F", "\uD83D\uDE39", "\uD83D\uDE3E",
        "\uD83D\uDC79", "\uD83D\uDC7A", "\uD83C\uDF1E", "\uD83C\uDF1D", "\uD83C\uDF1A",
        "\uD83C\uDF1C", "\uD83C\uDF1B", "\uD83D\uDC66", "\uD83D\uDC67", "\uD83C\uDF8E",
        "\uD83C\uDF38", "\uD83C\uDF40", "\uD83C\uDF39", "\uD83C\uDF3B", "\uD83C\uDF3A",
        "\uD83C\uDF41", "\uD83C\uDF3F", "\uD83C\uDF44", "\uD83C\uDF35", "\uD83C\uDF34",
        "\uD83C\uDF33", "\uD83C\uDF30", "\uD83C\uDF31", "\uD83C\uDF3C", "\uD83C\uDF10",
        "\uD83C\uDF19", "\uD83C\uDF0B", "\uD83C\uDF0C", "\u26C5", "\u26A1", "\u2614",
        "\u26C4", "\uD83C\uDF00", "\uD83C\uDF08", "\uD83C\uDF0A", "\uD83D\uDD25", "\u2728",
        "\uD83C\uDF1F", "\uD83D\uDCA5", "\uD83D\uDCAB", "\uD83D\uDCA2", "\uD83D\uDCA6",
        "\uD83D\uDCA7", "\uD83D\uDCA4", "\uD83D\uDCA8", "\uD83C\uDF80", "\uD83C\uDF02",
        "\uD83D\uDC84", "\uD83D\uDC95", "\uD83D\uDC96", "\uD83D\uDC9E", "\uD83D\uDC98",
        "\uD83D\uDC8C", "\uD83D\uDC8B", "\uD83D\uDC9D", "\uD83C\uDF92", "\uD83C\uDF93",
        "\uD83C\uDF8F", "\uD83C\uDF83", "\uD83D\uDC7B", "\uD83C\uDF85", "\uD83C\uDF84",
        "\uD83C\uDF81", "\uD83D\uDE48", "\uD83D\uDC12", "\uD83D\uDCAF", "\uD83D\uDC6F",
        "\uD83D\uDC8D",
    ];

    // 被替换的 emoji
    const transformed = [
        "1-1.png", "1-2.png", "1-4.png", "1-5.png", "1-6.png", "1-7.png", "1-8.png",
        "1-9.png", "1-10.png", "1-11.png", "1-12.png", "1-13.png", "1-14.png", "1-15.png",
        "1-16.png", "1-17.png", "1-18.png", "1-19.png", "1-20.png", "1-21.png", "1-22.png",
        "1-23.png", "1-24.png", "1-25.png", "1-26.png", "1-27.png", "1-28.png", "1-29.png",
        "1-30.png", "1-31.png", "1-32.png", "1-33.png", "1-34.png", "1-35.png", "2-1.png",
        "2-2.png", "2-3.png", "2-4.png", "2-5.png", "2-6.png", "2-7.png", "2-8.png", "2-9.png",
        "2-10.png", "2-11.png", "2-12.png", "2-13.png", "2-14.png", "2-15.png", "2-16.png",
        "2-17.png", "2-18.png", "2-19.png", "2-20.png", "2-21.png", "2-22.png", "2-23.png",
        "2-24.png", "2-25.png", "2-26.png", "2-27.png", "2-28.png", "2-29.png", "2-30.png",
        "2-31.png", "2-32.png", "2-33.png", "2-34.png", "2-35.png", "3-1.png", "3-2.png",
        "3-3.png", "3-4.png", "3-5.png", "3-6.png", "3-7.png", "3-8.png", "3-9.png",
        "3-10.png", "3-11.png", "3-12.png", "3-13.png", "3-14.png", "3-15.png", "3-16.png",
        "3-17.png", "3-18.png", "3-19.png", "3-20.png", "3-21.png", "3-22.png", "3-23.png",
        "3-24.png", "3-25.png", "3-26.png", "3-27.png", "3-28.png", "3-29.png", "3-30.png",
        "3-31.png", "3-32.png", "3-33.png", "3-34.png", "3-35.png", "4-1.png", "4-2.png",
        "4-3.png", "4-4.png", "4-5.png", "4-6.png", "4-7.png", "4-8.png", "4-9.png", "4-10.png",
        "4-11.png", "4-12.png", "4-13.png", "4-14.png", "4-15.png", "4-16.png", "4-17.png",
        "4-18.png", "4-19.png", "4-20.png", "4-21.png", "4-22.png", "4-23.png",
    ];

    const arrIndex = str.match(indexRegex);
    arrIndex?.forEach(index => {
        const emoji = emojis[transformed.indexOf(`${index}.png`)];
        const arrInner = split(str, RegExp(
            `<img[^>]*?${index}.png` + `(?:[^>]*?)*>`, "g"
        ));
        str = join(arrInner, decodeURIComponent(emoji));
    });
    return str;
}

export function levelToClass(level: number) {
    if (level < 0) return;
    if (level >= 1 && level <= 3) return "green";
    if (level >= 4 && level <= 9) return "blue";
    if (level >= 9 && level <= 15) return "yellow";
    if (level >= 16) return "orange";
}
