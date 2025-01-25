import { renderDialog } from "@/lib/render";
import ImagesViewer, { ImagesViewerOpts } from "./images-viewer.vue";

export default ImagesViewer;
export * from "./images-viewer.vue";

export function imagesViewer(opts: ImagesViewerOpts) {
    renderDialog(<ImagesViewer {...opts} />);
}
