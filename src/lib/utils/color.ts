import { chunk, join, repeat, round, startsWith, trimStart } from "lodash-es";

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface HSLA {
    h: number;
    s: string;
    l: string;
    a: number;
}

export function colorToRGBA(color: string): Maybe<RGBA> {
    const elem = document.createElement("div");
    elem.style.color = color;
    document.body.appendChild(elem);
    const computedColor = window.getComputedStyle(elem).color;
    document.body.removeChild(elem);
    const rgbaMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1], 10),
            g: parseInt(rgbaMatch[2], 10),
            b: parseInt(rgbaMatch[3], 10),
            a: parseFloat(rgbaMatch[4] ?? "1"),
        };
    }
}

export function hexToRGBA(hex: string): RGBA {
    const hexValue = startsWith(hex, "#") ? trimStart(hex, "#") : hex;
    const tokenConverter = hexValue.length <= 4
        ? (chunk: string[]) => parseInt(repeat(chunk[0], 2), 16)
        : (chunk: string[]) => parseInt(join(chunk, ""), 16);
    const chunkSize = hexValue.length <= 4 ? 1 : 2;
    const chunks = chunk(hexValue, chunkSize);
    return {
        r: tokenConverter(chunks[0]),
        g: tokenConverter(chunks[1]),
        b: tokenConverter(chunks[2]),
        a: chunks.length === 4 ? tokenConverter(chunks[3]) : 1,
    };
}

export function rgbaToHSLA(rgba: RGBA): HSLA {
    // 将 RGB 值归一化到范围 [0, 1]
    const normalizedR = rgba.r / 255;
    const normalizedG = rgba.g / 255;
    const normalizedB = rgba.b / 255;

    const minValue = Math.min(normalizedR, normalizedG, normalizedB);
    const maxValue = Math.max(normalizedR, normalizedG, normalizedB);

    const lightness = (maxValue + minValue) / 2;

    let saturation;
    if (lightness <= 0.5) {
        saturation = (maxValue - minValue) / (maxValue + minValue);
    } else {
        saturation = (maxValue - minValue) / (2 - maxValue - minValue);
    }

    let hue;
    if (maxValue === minValue) {
        hue = 0;
    } else if (maxValue === normalizedR) {
        hue = (normalizedG - normalizedB) / (maxValue - minValue);
    } else if (maxValue === normalizedG) {
        hue = 2 + (normalizedB - normalizedR) / (maxValue - minValue);
    } else {
        hue = 4 + (normalizedR - normalizedG) / (maxValue - minValue);
    }

    hue *= 60;
    if (hue < 0) {
        hue += 360;
    }

    return {
        h: round(hue, 2),
        s: `${round(saturation * 100)}%`,
        l: `${round(lightness * 100)}%`,
        a: rgba.a,
    };
}
