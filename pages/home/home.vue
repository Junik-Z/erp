<script>
import ZeroLoading from "@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue";
import { _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "Home",
  components: {ZeroLoading},
  mixins: [mixins],
  data() {
    return {
      option: {},
    };
  },
  async onLoad(option) {
    this.option = _isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option;

    uni.$__FIELD_LIST__ = []

    if (this.option?.scene) {
      // uni.setStorageSync("__APP_SCENE__", this.option?.scene);
      await this.onLogout(this.option, false, true);
    }
    console.log("home.vue", option, this.option);

    // #ifdef H5
    this.handleH5Func();
    // #endif

    // #ifdef MP
    await this.handleMPFunc();
    // #endif
  },
  methods: {
    // 系统已经准备好了
    beReady() {
      console.log("系统已经准好了");

      // #ifdef MP
      uni.$emit("$__init_web_socket__");
      // #endif

      uni.reLaunch({
        url: "/pages/index/index",
        /* success: () => {
          setTimeout(() => {
            uni.setStorageSync("__APP_QUERY__", {});
          }, 100);
        }, */
      });
    },

    // 处理 MP 的信息
    handleMPFunc() {
      // 处理重新登陆
      if (_isEqual(this.option?.PAGE_TYPE, "logout")) {
      }

      // 获取所有的用户信息
      uni.$emit("$__get_all_info__");
      // 获取成功后跳转到首页
      uni.$on("$__get_info_success__", this.beReady);
    },

    // 处理 H5 的信息
    handleH5Func() {
      uni.$emit("$__get_all_info__");
      uni.$on("$__get_info_success__", this.beReady);
    },
  },
};
</script>

<template>
  <view class="ko-qrcode">
    <ZeroLoading type="gear" show-text text="系统准备中..." />
  </view>
</template>

<style scoped lang="scss">
.ko-qrcode {
  height: 100vh;
}
</style>
