import { dom } from "@/lib/elemental";
import { forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver } from "@/lib/observers";
import _ from "lodash";

export default {
    id: "notrans-emojis",
    name: "别动我的 emoji😠",
    author: "锯条",
    version: "1.0",
    brief: "拒绝替换我的 emoji",
    description: "原版贴吧会将部分emoji表情替换为旧版，该模块会让这些emoji重新跟随系统样式",
    scope: true,
    runAt: "afterHead",
    entry: main,
} as UserModule;

function main() {
    // 隐藏旧的 emoji
    // injectCSSRule(".nicknameEmoji", {
    //     display: "none"
    // });

    // 从 a标签提取emoji index
    const indexRegExp = /(?<=nickemoji\/).*?(?=.png)/gi;

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

    // 看贴页面
    threadCommentsObserver.addEvent(() => {
        try {
            _.forEach(dom(`
                .p_author_name:has(.nicknameEmoji),
                .at:has(.nicknameEmoji),
                .lzl_content_main:has(.nicknameEmoji)
            `, []), (el) => {
                updateEmojis(el);
            });
        } catch (error) {
            _.forEach(dom(".p_author_name, .at, .lzl_content_main", []), (el) => {
                if (_.includes(el.classList, "nicknameEmoji")) {
                    updateEmojis(el);
                }
            });
        }
    });

    // 首页
    legacyIndexFeedsObserver.addEvent(() => {
        try {
            _.forEach(dom(`
                .new_list .post_author:has(.nicknameEmoji),
                .userinfo_username:has(.nicknameEmoji)
            `, []), (el) => {
                updateEmojis(el);
            });
        } catch (error) {
            _.forEach(dom(".newlist .post_author, .userinfo_username", []), (el) => {
                if (_.includes(el.classList, "nicknameEmoji")) {
                    updateEmojis(el);
                }
            });
        }
    });

    // 进吧页面
    forumThreadsObserver.addEvent(() => {
        try {
            _.forEach(dom(".threadlist_author a:has(.nicknameEmoji)", []), (el) => {
                updateEmojis(el);
            });
        } catch (error) {
            _.forEach(dom(".threadlist_author a", []), (el) => {
                if (_.includes(el.classList, "nicknameEmoji")) {
                    updateEmojis(el);
                }
            });
        }
    });

    function updateEmojis(elem: Element) {
        const arrIndex = elem.innerHTML.match(indexRegExp);
        arrIndex?.forEach(index => {
            const emoji = emojis[transformed.indexOf(`${index}.png`)];
            const arrInner = elem.innerHTML.split(RegExp(
                `<img[^>]*?${index}.png` + `(?:[^>]*?)*>`, "g"
            ));
            elem.innerHTML = arrInner.join(decodeURIComponent(emoji));
        });
    }
}
