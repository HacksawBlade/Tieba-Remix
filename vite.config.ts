import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
import deepmerge from "deepmerge";
import { resolve } from "path";
import postcssPresetEnv from "postcss-preset-env";
import { UserConfig, defineConfig } from "vite";
import monkey, { MonkeyOption, cdn } from "vite-plugin-monkey";

const scriptOptions: MonkeyOption = {
    entry: "src/main.ts",
    userscript: {
        name: "Tieba Remix",
        namespace: "https://github.com/HacksawBlade/Tieba-Remix",
        version: "0.4.4-r1-beta",
        description: "贴吧网页端重塑",
        author: "锯条",
        license: "MIT",
        updateURL: "https://gitee.com/HacksawBlade/Tieba-Remix/raw/beta/build/tieba-remix.user.js",
        downloadURL: "https://gitee.com/HacksawBlade/Tieba-Remix/raw/beta/build/tieba-remix.user.js",
        icon: "https://gitee.com/HacksawBlade/Tieba-Remix/raw/master/assets/images/main/icon16.png",
        icon64: "https://gitee.com/HacksawBlade/Tieba-Remix/raw/master/assets/images/main/icon64.png",
        match: [
            "*://tieba.baidu.com/",
            "*://tieba.baidu.com/index.*",
            "*://tieba.baidu.com/?*",
            "*://tieba.baidu.com/p/*",
            "*://tieba.baidu.com/f?*",
            "*://jump.bdimg.com/safecheck/*",
            "*://jump2.bdimg.com/safecheck/*",
        ],
        "run-at": "document-start",
    },
    build: {
        externalGlobals: {
            "vue": cdn.jsdelivrFastly("Vue", "dist/vue.global.prod.js"),
            "marked": cdn.jsdelivrFastly("marked", "lib/marked.umd.min.js"),
            "lodash": cdn.jsdelivrFastly("_", "lodash.min.js"),
        },
    },
};

const commonConfig = defineConfig({
    build: {
        lib: {
            entry: "./src/main.ts",
            name: "TiebaRemix",
            formats: ["iife"],
            fileName: () => `tieba-remix.user.js`,
        },
        outDir: "build",
        reportCompressedSize: false,
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                globals: {
                    "vue": "Vue",
                    "marked": "marked",
                    "lodash": "_",
                },
            },
        },
    },
    css: {
        postcss: {
            plugins: [
                postcssPresetEnv(),
            ],
        },
    },
    plugins: [
        vue(),
        vueJSX({}),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: resolve(__dirname, "./src"),
            },
        ],
    },
    server: {
        proxy: {
            "/p": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
            "/f": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
            "/suggestion": {
                target: "https://tieba.baidu.com",
                changeOrigin: true,
            },
        },
    },
});

const devConfig = defineConfig({
    build: {
        minify: false,
        cssMinify: false,
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const forkConfig = defineConfig({
    build: {
        minify: false,
        cssMinify: false,
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const prodConfig = defineConfig({
    build: {
        minify: "terser",
        cssMinify: true,
        terserOptions: {
            sourceMap: false,
            toplevel: true,
            compress: {
                pure_funcs: [
                    "console.log",
                    "deb",
                ],
            },
        },
    },
    plugins: [
        monkey(scriptOptions),
    ],
});

const viteConfig = {
    build: {
        "development": () => deepmerge<UserConfig>(commonConfig, devConfig),
        "production": () => deepmerge<UserConfig>(commonConfig, prodConfig),
        "fork": () => deepmerge<UserConfig>(commonConfig, forkConfig),
    },
    serve: {
        "development": () => deepmerge<UserConfig>(commonConfig, devConfig),
    },
};

export default defineConfig(({ command, mode }) => {
    return viteConfig[command][mode]();
});
