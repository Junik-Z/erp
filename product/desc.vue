<script>
import { _deepCopy, _isEqual } from "@/utils";
import PiaoyiEditor from "./components/piaoyi-editor/piaoyi-editor.vue";
import { CONFIG } from "@/utils/config";

export default {
  name: "desc",
  components: {PiaoyiEditor},
  onLoad(option) {
    const EC = this.getOpenerEventChannel();
    EC?.on?.("on_good_desc_over", (obj) => {
      // #ifdef H5
      sessionStorage.setItem("GOOD_DESC_OVER", JSON.stringify(obj));
      // #endif

      // #ifdef MP
      this.info(obj);
      // #endif
    });

    // #ifdef H5
    setTimeout(() => {
      const data = sessionStorage.getItem("GOOD_DESC_OVER");
      if (!data) return false;
      try {
        const list = JSON.parse(data);
        this.info(list);
      } finally {
      }
    }, 200);
    // #endif
  },
  data() {
    return {
      values: "",
      readOnly: false, //是否只读
      photoUrl: CONFIG.BASE_URL, //服务器图片域名或者ip
      api: "/files/base64", //上传图片接口地址
      txt: "",
      name: "file",
      html: "",
      takeOverName: null,
    };
  },
  methods: {
    info(info) {
      const data = _deepCopy(info);
      console.log(data);

      this.readOnly = _isEqual("view", data.type);

      this.values = data.value;
      this.takeOverName = data.takeOverName;
    },

    saveContens({html}) {
      this.html = html;
    },

    onSubmit() {
      if (!this.readOnly) {
        const params = this.html || this.values;

        // #ifndef H5
        const EC = this.getOpenerEventChannel();
        EC?.emit?.("on_good_desc_over", params);
        // #endif

        // #ifdef H5
        uni.$emit(this.takeOverName, params);
        // #endif
      }

      uni.navigateBack({
        delta: 1,
        fail(err) {
          console.log(err);
        },
        success(err) {
          console.log(err);
        },
      });
    },
  },
};
</script>

<template>
  <view class="ko-desc">
    <view style="flex: 1; overflow: hidden;">
      <PiaoyiEditor
        :values="values"
        :read-only="readOnly"
        :maxlength="999999999999999"
        :photoUrl="photoUrl"
        :api="api"
        :name="name"
        @changes="saveContens"
      />
    </view>

    <view style="display: flex; align-items: center; justify-content: center">
      <button class="ko-basic-button__card" style="width: 120px" @click="onSubmit">
        {{ readOnly ? "返回" : "编辑完成" }}
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-desc {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;

}
</style>
