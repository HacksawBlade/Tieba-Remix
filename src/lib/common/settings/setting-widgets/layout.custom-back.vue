<template>
    <div class="layout-custom-back">
        <img v-show="imageData" class="custom-image" :src="imageData ?? ''" title="自定义背景" alt="自定义背景"
            :style="`opacity: ${+alphaValue / 100}`">
        <div class="custom-back-buttons">
            <UserButton @click="clearImage">清除</UserButton>
            <UserButton @click="selectImageFile">上传图片</UserButton>
        </div>
        <!-- <div v-show="imageData" class="adjust-controls">
            <div class="control-set">
                <label for="image-alpha">背景不透明度</label>
                <UserTextbox ref="imageAlphaInput" id="image-alpha" class="editor" v-model="alphaValue" type="number"
                    min="0" max="100" @update:model-value="">
                </UserTextbox>
            </div>
        </div> -->
    </div>
</template>

<script lang="ts" setup>
import UserButton from "@/components/utils/user-button.vue";
import UserTextbox from "@/components/utils/user-textbox.vue";
import { customBackground } from "@/lib/user-values";
import { selectLocalFile } from "@/lib/utils";
import { onMounted, ref, watch } from "vue";

const imageData = ref<Maybe<string>>(customBackground.get());
const alphaValue = ref("100");
const imageAlphaInput = ref<InstanceType<typeof UserTextbox>>();

watch(imageData, newValue => {
    customBackground.set(newValue);
});

watch(alphaValue, newValue => {
    const inputElement = imageAlphaInput.value?.$el as HTMLInputElement;
    if (newValue === "" || +newValue < 0) alphaValue.value = "0", inputElement.value = "0";
    if (+newValue > 100) alphaValue.value = "100", inputElement.value = "100";
});

onMounted(async function () {
    imageData.value = customBackground.get();
});

async function clearImage() {
    imageData.value = undefined;
}

async function selectImageFile() {
    imageData.value = await selectLocalFile("base64") as Maybe<string>;
}
</script>

<style lang="scss" scoped>
.layout-custom-back {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 8px;

    .custom-image {
        max-width: 100%;
        max-height: 320px;
        border-radius: 8px;
        margin: 0 auto;
    }

    .custom-back-buttons {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
    }

    .adjust-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .control-set {
            display: flex;
            align-items: baseline;
            gap: 6px;

            .editor {
                width: auto;
                font-family: var(--code-zh);
            }
        }
    }
}
</style>
