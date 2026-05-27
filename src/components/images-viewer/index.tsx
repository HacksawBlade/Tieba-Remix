import { renderDialog } from "@/lib/render";
import type { ImagesViewerOpts } from "./images-viewer.vue";
import ImagesViewer from "./images-viewer.vue";

export default ImagesViewer;
export * from "./images-viewer.vue";

export function imagesViewer(opts: ImagesViewerOpts) {
    renderDialog(<ImagesViewer {...opts} />);
}
