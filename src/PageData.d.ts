const PageData: {
    page: string;
    product: string;
    tbs: string;
    can_post: boolean;
    can_anonym_post: boolean;
    forum_type: number;
    follow_sign: string;
    forward_sign: string;
    is_thread_admin: number;
    is_posts_admin: number;
    staticDomain: string; /* url */
    charset: string;
    search_what: string;
    /** "1" */
    isPicBa: string;
    tbs_loaded: boolean;
    searchFixed: string;
    is_sign_in: number;
    is_star: number;
    memberTitle: string;
    memberNumber: string;
    is_activity_sign: boolean;
    annualMemberMode: boolean;
    pbVoiceLoaded: boolean;

    // 用户权利
    power: {
        can_add_celebrity: boolean;
        can_add_manager_team: boolean;
        can_bws_FDS: boolean;
        can_bws_bawu_center: boolean;
        can_bws_bawu_info: boolean;
        can_bws_bawu_log: boolean;
        can_bws_filter_ip_tbs: boolean;
        can_bws_limit_bawu_log: boolean;
        can_cancel_filter_id: boolean;
        can_cancel_mask_delete: boolean;
        can_cancel_mask_good: boolean;
        can_cancel_mask_top: boolean;
        can_chatroom_change_announce: boolean;
        can_chatroom_change_avatar: boolean;
        can_chatroom_change_name: boolean;
        can_chatroom_create: boolean;
        can_chatroom_delete: boolean;
        can_chatroom_exempt_mute_all: boolean;
        can_chatroom_manage_admin: boolean;
        can_chatroom_mute_all: boolean;
        can_chatroom_mute_normal: boolean;
        can_chatroom_recall_admin: boolean;
        can_chatroom_recall_normal: boolean;
        can_chatroom_set_send_level: boolean;
        can_chatroom_set_talk_type: boolean;
        can_chatroom_set_view_level: boolean;
        can_del_manager_team: boolean;
        can_edit_bakan: boolean;
        can_edit_daquan: boolean;
        can_edit_gconforum: boolean;
        can_filter_id: boolean;
        can_filter_ip: boolean;
        can_mask_delete: boolean;
        can_mask_good: boolean;
        can_mask_top: boolean;
        can_member_top: boolean;
        can_op_FDS: boolean;
        can_op_as_4thmgr: boolean;
        can_op_as_broadcast_admin: boolean;
        can_op_as_category_editor: boolean;
        can_op_as_editor: boolean;
        can_op_as_entertainment_manager: boolean;
        can_op_as_operator: boolean;
        can_op_as_profession_manager: boolean;
        can_op_as_vertical_operator: boolean;
        can_op_common_bawu: boolean;
        can_op_disk: boolean;
        can_op_frsbg: boolean;
        can_op_good_class: boolean;
        can_op_pic: boolean;
        can_op_topic: boolean;
        can_op_video: boolean;
        can_op_wise_group: boolean;
        can_paper_ignore_vcode: boolean;
        can_pass_media_limit: boolean;
        can_post: boolean;
        can_post_frs: boolean;
        can_post_pb: boolean;
        can_send_memo: boolean;
        can_super: boolean;
        can_tobe_assist: boolean;
        can_tobe_editor: boolean;
        can_tobe_manager: boolean;
        can_tobe_pri_content_assist: boolean;
        can_tobe_pri_manage_assist: boolean;
        can_toms_operator_alt_basic: boolean;
        can_toms_operator_basic: boolean;
        can_type1_audit_post: boolean;
        can_type2_audit_post: boolean;
        can_type3_audit_post: boolean;
        can_type4_audit_post: boolean;
        can_type5_audit_post: boolean;
        can_unknown: boolean;
        can_view_freq: boolean;
        can_vip_jubao: boolean;
        can_vote: boolean;
        forever_ban: boolean;
        lz_del: boolean;
        picasso: boolean;
        share_forum_perm: boolean;
        can_set_topic: boolean;
        reply_private_flag: boolean;
    };

    // 用户
    user: {
        id: number;
        user_id: number;
        name: string;
        user_name: string;
        user_nickname: string;
        show_nickname: string; /* 新版昵称 */
        name_url: string;
        no_un: number;
        is_login: number;
        portrait: string;

        pb_login_switch: boolean;
        is_videocreator: boolean;
        interaction_switch: boolean;
        login_day: number;
        open_switch: number;
        open_convert: number;
        yy_scores: number;
        is_business_agent: boolean;
        is_tiebaplus_agent: boolean;
        is_business_account: boolean;
        bg_id: number;
        cur_score: number;
        feedNumNew: string;
        free_flag: string;
        is_black: boolean;
        is_block: boolean;
        is_half_user: boolean;
        is_like: boolean;
        is_tenyear: boolean;
        itieba_id: number;
        level_id: number;
        level_name: string;
        meizhi_level: number;
        mobilephone: string; /* 带星号 */
        name_link: string;
        open_uid: number;
        score_left: number;
        use_sig: number;
        user_sex: number;
        user_status: number;
        user_type: number;
        userhide: number;
        joinEmoji: string;

        email?: string;
        mobile?: number;
        name_show?: string;
        name_weak?: string;
        score_card?: string;
        sid?: number;
        source_id?: number;
        start_time?: string;
        superboy?: boolean;
        tips?: string;
        urank?: number;
        forbidden?: boolean;
        vipInfo?: object;
        picasso?: object;
        rank?: object;
        tbguess_card?: object;
        is_uc_account?: object;
        business_account?: object;

        balv: object;

        Parr_props: {
            all_level?: object;
        };

        Parr_scores: {
            i_money: number;
            i_other: number;
            i_total: number;
            level: number;
            limit: number;
            scores_fetch: number;
            scores_money: number;
            scores_other: number;
            scores_total: number;
            update_time: number;
        };

        mParr_props: object;

        new_iconinfo: object;

        power: object;

        global: {
            tbmall_newprops: number;
        };

        // NEVER
        SingleIcons: object;
        myTieba: object;
        celebrity: object;
        icon_tip: object;
    };

    // 吧
    forum: {
        id: string;
        forum_id: string;
        /**
         * @deprecated
         * 有可能失效，应使用 `forum_name`
         */
        name: string;
        forum_name: string;
        name_url: string;
        name_encode: string;
        member_name_url: string;
        first_class: string;
        second_class: string;
        album_good_smallflow?: object;
        avatar: string; /* 吧图 url */
        forbid_flag: boolean;
        has_picture_frs: boolean;
        member_count: number;
        member_name: string;
        post_num: number;
        shield_post: number;

        sign_in_info: {
            user_info: {
                user_id: number;
                is_sign_in: boolean;
                user_sign_rank: number;
                sign_time: number;
                cont_sign_num: number;
                cout_total_sing_num: number;
                total_resign_num: number;
                hun_sign_num: number;
                is_org_disabled: boolean;
                c_sign_num: number;
                cm_sign_num: number;
            };

            forum_info: {
                is_on: boolean;
                is_filter: boolean;
                level_1_dir_name: string;
                level_2_dir_name: string;

                forum_info: inter_ForumInfo_Sub;
                current_rank_info: inter_RankeInfo;
                yesterday_rank_info: inter_RankeInfo;
                weekly_rank_info: inter_RankeInfo;
                monthly_rank_info: inter_RankeInfo;
            };
        };
    };

    thread: {
        author: string; /* 楼主 */
        thread_id: number;
        title: string; /* 贴子标题 */
        reply_num: number;
        thread_type: number;
        is_ad: boolean;
        video_url: string;

        topic: {
            is_topic: boolean;
            topic_type: boolean;
            is_live_post: boolean;
            is_lpost: boolean;
            lpost_type: number;
        };
    };

    post_perm: {
        img_num: number;
        video_num: number;
        smiley_num: number;
        white_list: Array<string>;
    };

    special: {
        has_sub_post: boolean;
        has_grade: boolean;
        has_lucky_lottery: boolean;
        has_basket_lottery: boolean;
        has_ssq_lottery: boolean;
        has_foot_lottery: boolean;
        is_match_news: boolean;
        lz_only: boolean;
        has_lz_only: boolean;
        is_from_spider: boolean;
    };

    pager: {
        cur_page: number;
        total_page: number;
        page_size?: number;
    };

    sign_forum_info: {
        is_on: boolean;
        is_filter: boolean;
        level_1_dir_name: string;
        level_2_dir_name: string;

        forum_info: inter_ForumInfo_Sub;
        current_rank_info: inter_RankeInfo;
        yesterday_rank_info: inter_RankeInfo;
        weekly_rank_info: inter_RankeInfo;
        monthly_rank_info: inter_RankeInfo;
    };

    lcs: {
        sbduss: string;
    };

    userBarExtraConfig: {
        switch: number;
        word: string;
        url: string;
    };
};

interface inter_ForumInfo_Sub {
    forum_id: number;
    level_1_dir_name: string;
}

interface inter_RankeInfo {
    sign_count: number;
    member_count: number;
    sign_rank: number;
    dir_rate: number;
}
