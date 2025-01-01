import { SubSettingKey } from "./components/settings.vue";

/** 用户模块（扩展） */
interface UserModuleEx extends UserModule {
    settings?: SubSettingKey["content"]
}
