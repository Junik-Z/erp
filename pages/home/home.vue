<script>
import ZeroLoading from "@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue";
import { _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PageEnums } from "@/utils/config";

export default {
  name: "Home",
  components: {ZeroLoading},
  mixins: [mixins],
  data() {
    return {
      option: {},
      VM_TIME: null,
    };
  },
  async onLoad(option) {
    uni.$__FORM_QRCODE__ = false;

    this.option = _isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option;
    uni.$__FIELD_LIST__ = [];

    if (this.option?.scene) {
      const params = this.option;
      params.scene = decodeURIComponent(params.scene).split("&")[0];
      uni.$__FORM_QRCODE__ = true;
      // uni.setStorageSync("__APP_SCENE__", this.option?.scene);
      await this.onLogout(params, false, true);
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
      this.VM_TIME && clearTimeout(this.VM_TIME);

      // #ifdef MP | H5
      // uni.$emit("$__init_web_socket__");
      // #endif

      this.VM_TIME = setTimeout(() => {
        console.log(this.sPath);

        uni.reLaunch({
          url: (_isEqual(this.sPath, PageEnums.home) || !this.sPath) ? PageEnums.Index : this.sPath,
          /* success: () => {
            setTimeout(() => {
              uni.setStorageSync("__APP_QUERY__", {});
            }, 100);
          }, */
        });
      }, 100);
    },

    // 处理 MP 的信息
    handleMPFunc() {
      // 处理重新登录
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
  computed: {
    sPath() {
      return this.$store.getters.sPath;
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
