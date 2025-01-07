import { Component } from "vue";
import { JSX } from "vue/jsx-runtime";
import { SubSettingKey } from "./components/settings.vue";

/** 用户模块（扩展） */
interface UserModuleEx extends UserModule {
    settings?: SubSettingKey["content"]
}

/** 支持的组件类型 */
type SupportedComponent = Component | JSX.Element;
