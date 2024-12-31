import { scrollbarWidth } from "@/lib/render";

export type FloatMode = "baseline" | "middle";

export function getFloatCoord(
    el: HTMLElement,
    coord: Coord,
    mode: FloatMode
): Coord;
export function getFloatCoord(
    width: number,
    height: number,
    coord: Coord,
    mode: FloatMode
): Coord;

export function getFloatCoord(...args: any[]): Coord {
    if (args[0] instanceof HTMLElement)
        return getFloatCoord1(args[0], args[1], args[2]);
    if (typeof args[0] === "number" && typeof args[1] === "number")
        return getFloatCoord2(args[0], args[1], args[2], args[3]);
    return { x: 0, y: 0 };
}

function getFloatCoord1(
    el: HTMLElement,
    coord: Coord,
    mode: FloatMode
): Coord {
    const clientRect = el.getBoundingClientRect();
    return getFloatCoord2(clientRect.width, clientRect.height, coord, mode);
}

function getFloatCoord2(
    width: number,
    height: number,
    coord: Coord,
    mode: FloatMode
): Coord {
    const offsetX = (() => {
        switch (mode) {
            case "baseline": return 0;
            case "middle": return width / 2;
        }
    })();
    const x = Math.min(
        coord.x - offsetX,
        window.innerWidth - scrollbarWidth()
        - Math.ceil(width) // 修正误差
    );
    const y =
        Math.ceil(coord.y + height) > window.innerHeight
            ? coord.y - height
            : coord.y;

    return { x, y };
}
