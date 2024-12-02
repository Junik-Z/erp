<script>

import ZeroLoading from "@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue";
import { _isEmpty } from "@/utils";
import { isLogin } from "@/api/user";

export default {
  name: "Home",
  components: {ZeroLoading},
  data: () => ({
    option: {},
    vm: null,
  }),
  onLoad(option) {
    this.option = option;

    switch (option.PAGE_TYPE) {
      case "logout":
        uni.$emit("$__get_all_info__");
        break;
    }

    // #ifdef H5
    this.handleH5Func();
    // #endif

    // #ifndef H5
    this.handleMPFunc();
    // #endif
  },
  methods: {
    // 系统已经准备好了
    beReady() {
      uni.$__home_set_timeout_vm__ && clearTimeout(uni.$__home_set_timeout_vm__);
      console.log("系统已经准好了");
      uni.reLaunch({
        url: "/pages/index/index",
      });
    },

    // 处理 MP 的信息
    handleMPFunc() {
      uni.$on("$__get_info_success__", this.beReady);

      uni.$on("$__login_success__",
        () => {
          uni.$__home_set_timeout_vm__ && clearTimeout(uni.$__home_set_timeout_vm__);
        });

      console.log("是否登陆成功", isLogin());

      if (isLogin()) {
        uni.$__home_set_timeout_vm__ = setTimeout(() => {
          if (!_isEmpty(uni.getStorageSync("__USER_INFO__"))) {
            this.beReady();
          }
          uni.$__home_set_timeout_vm__ && clearTimeout(uni.$__home_set_timeout_vm__);
        }, 1000);
      }
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
