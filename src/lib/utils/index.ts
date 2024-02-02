import { GM_info } from "$";
import { toast } from "@/lib/render/toast";
import { find, forEach, forOwn } from "lodash-es";
import { hexToRGBA } from "./color";

export function cookies(): LiteralObject;
export function cookies(key: string): string | undefined;

export function cookies(key?: string) {
    const cookieArray = document.cookie.split(";");

    if (key) {
        return find(cookieArray, (cookie) => cookie.trim().startsWith(`${key}=`));
    } else {
        const result: LiteralObject = {};

        forEach(cookieArray, (cookie) => {
            const [key, value] = cookie.split("=");
            result[key.trim()] = value.trim();
        });

        return result;
    }
}

/**
 * 接口调用实现的共公有模板
 * @param api 需要调用的接口，理论上所有的 `Promise<Response>` 都是被接受的
 * @returns 该请求返回的 json
 */
export async function requestInstance(api: Promise<Response>): Promise<any> {
    try {
        const response = await api;
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        toast({
            message: errorMessage(error as Error),
            type: "error",
            duration: 6000,
        });
    }
}

const modules: UserModule[] = [];

export function AllModules() {
    return modules;
}

/**
 * 整合统一的错误信息
 * @param error 错误对象
 * @returns 整合后的错误信息
 */
export function errorMessage(error: Error) {
    const errBody = error.stack ? error.stack : error.message;
    return `${GM_info.script.name} ${GM_info.script.version}\n${errBody}`;
}

/**
 * 检测两数组是否有重合的部分
 * @param arr1 数组1
 * @param arr2 数组2
 * @returns 是否有重合
 */
export function checkDuplicate<T>(arr1: Array<T>, arr2: Array<T>) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    for (const el of set2) {
        if (set1.has(el))
            return true;
    }
    return false;
}

/**
 * 依据相对于当前的时间偏移量生成时间戳
 * @param year 
 * @param month 
 * @param day 
 * @param hours 
 * @param minutes 
 * @param seconds 
 * @returns 时间戳
 */
export function spawnOffsetTS(
    year = 0, month = 0, day = 0,
    hours = 0, minutes = 0, seconds = 0) {
    const now = new Date();
    const offset = new Date(now.getFullYear() + year, now.getMonth() + month, now.getDate() + day,
        now.getHours() + hours, now.getMinutes() + minutes, now.getSeconds() + seconds, 0);
    return offset.getTime();
}

/**
 * 根据对象生成适用于 `GET` 请求的请求体
 * @param body 请求体
 * @returns 适用于 `GET` 请求的请求体
 */
export function requestBody(body: LiteralObject) {
    let reqBody = "";
    forOwn(body, (value, key) => {
        if (!value) value = "";
        reqBody += `${key}=${value}&`;
    });
    return reqBody.slice(0, -1);
}

/**
 * 等待条件函数为真时再执行操作
 * @param condition 条件函数
 * @param timeout 超时时限
 * @param interval 检测频率
 * @returns 
 */
export function waitUtil(condition: (() => boolean), timeout = 10000, interval = 100) {
    return new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const intervalId = setInterval(() => {
            if (condition()) {
                clearInterval(intervalId);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(intervalId);
                reject(new Error("Timeout"));
                console.warn("[waitUtil] 等待超时，该函数未在指定时间内得到期望值：", condition);
                console.trace("发生错误的调用者：");
            }
        }, interval);
    });
}

export function isRealObject(obj: any): boolean {
    return obj && typeof obj === "object" && !Array.isArray(obj);
}

export function outputFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export async function selectLocalFile<T extends string | ArrayBuffer | null>(
    mode: "text" | "base64" = "text"
): Promise<T> {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";

        input.addEventListener("change", function () {
            if (!input.files) return;
            const file = input.files[0];
            const reader = new FileReader();

            reader.addEventListener("loadend", function () {
                const base64String = reader.result;
                resolve(base64String as T);
            });

            reader.addEventListener("error", function () {
                reject(new Error());
            });

            switch (mode) {
                case "text": {
                    reader.readAsText(file);
                    break;
                }

                case "base64": {
                    reader.readAsDataURL(file);
                    break;
                }
            }
        });

        input.click();
    });
}
