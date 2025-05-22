<script>
import mixins from "@/mixins/mixins";
import reLogin from "@/mixins/re-login";
import ZeroLoading from "@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue";
import { applyCustomerCodeApi, applySupplierCodeApi } from "@/api/user";
import Result from "@/client/components/Result.vue";

export default {
  name: "binding",
  mixins: [mixins, reLogin],
  components: {Result, ZeroLoading},
  data() {
    return {
      loading: false,
      opt: {},
      isSuccess: true,
      msg: "",
      logoutLoading: false,
    };
  },
  onLoad(opt) {
    this.opt = opt;
  },
  methods: {
    /* getList() {
      applySupplierCodeApi({supplierId: ""});
    }, */
    getList() {
      if (this.Q_ID) {
        this.loading = true;
        applySupplierCodeApi({supplierId: this.Q_ID})
          .then(() => {
            this.isSuccess = true;
          })
          .catch((res) => {
            this.isSuccess = false;
            this.msg = res.msg;
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.isSuccess = false;
      }
    },

    // 前往首页
    toHome() {
      this.logoutLoading = true;
      this.onLogout({})
        .finally(() => (this.logoutLoading = false));
    },
  },
};
</script>

<template>
  <view class="ko-binding">
    <ZeroLoading
      type="gear"
      show-text
      :text="login_loading || loading ? '系统准备中...' : '供应商绑定中，请稍后...'"
      v-if="login_loading || loading"
    />

    <Result v-else :is-success="isSuccess" @to-home="toHome" :msg="msg" />
  </view>
</template>

<style scoped lang="scss">
.ko-binding {
  height: 100vh;
  padding-bottom: 80px;
}
</style>
