import { onDOMReady } from "@/lib/common";
import { Owner, OwnerProfile } from "@/lib/user-values";
import { findParent } from "libelemental";

export default {
    namespace: "no-autoplay",
    title: "禁止自动播放",
    version: "1.0.0",
    contributors: [{ name: Owner, url: OwnerProfile }],
    brief: "拦截首页视频播放",
    description: "阻止首页视频的自动播放行为，缓解 RESULT_CODE_HUNG 崩溃。",
    scope: ["index"],
    runAt: "immediately",
    compatibility: "current",
    init,
    fini,
} satisfies UserModule;

const nativePlay = HTMLMediaElement.prototype.play;
let observer: Maybe<MutationObserver> = VOID;
const PROCESSED_CLASS = "blocked-video" as const;

function disableVideo(video: HTMLVideoElement) {
    if (!video.classList.contains(PROCESSED_CLASS)) {
        video.classList.add(PROCESSED_CLASS);
        video.autoplay = false;
        video.removeAttribute("autoplay");
        video.removeAttribute("playsinline");
        const playerUI = findParent(video, "art-video-player");
        playerUI?.addEventListener("click", (e) => {
            const threadAnchor = findParent(
                e.target as HTMLVideoElement,
                "thread-content-link",
            );
            threadAnchor?.click();
        });
    }
}

function init() {
    HTMLMediaElement.prototype.play = function () {
        if (this instanceof HTMLVideoElement) {
            disableVideo(this);
        }
        return Promise.resolve();
    };

    const setup = () => {
        document.querySelectorAll("video").forEach((v) => {
            disableVideo(v);
        });

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof HTMLVideoElement) {
                        disableVideo(node);
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    onDOMReady(setup);
}

function fini() {
    HTMLMediaElement.prototype.play = nativePlay;
    observer?.disconnect();
    observer = VOID;
}
