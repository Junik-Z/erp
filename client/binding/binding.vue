<script>
import { _isEmpty, showToast } from "@/utils";
import ZeroLoading from "@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue";
import { bindCustomerApi } from "@/api/erp/sale";
import mixins from "@/mixins/mixins";
import { bindSupplierApi } from "@/api/erp/purchase";

export default {
  name: "binding",
  components: {ZeroLoading},
  data() {
    return {
      option: {},
    };
  },
  mixins: [mixins],
  onLoad(option) {
    this.option = _isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option;

    this.onLogInAgain(this.option).finally(() => {
      setTimeout(() => {
        this.beReady();
      }, 100);
    });

  },
  methods: {
    toIndex() {
      uni.reLaunch({
        url: "/pages/index/index",
      });
    },
    async beReady() {
      const opt = this.option;

      // 没有任何参数时直接进入首页
      if (_isEmpty(opt)) {
        this.toIndex();
      } else {
        switch (opt.PAGE_TYPE) {
          case "BINDING_CLIENT_BY_SALE":
            bindCustomerApi({
              userId: this.GET_USER_INFO.userId,
              customerId: opt.CLIENT_LIST_ID,
            })
              .then((res) => {
                showToast({
                  title: res.msg,
                });
              })
              .finally(() => {
                setTimeout(() => {
                  this.toIndex();
                }, 1500);
              });
            break;
          case "BINDING_CLIENT_BY_PURCHASE":
            bindSupplierApi({
              userId: this.GET_USER_INFO.userId,
              supplierId: opt.CLIENT_LIST_ID,
            })
              .then((res) => {
                showToast({title: res.msg});
              })
              .finally(() => {
                setTimeout(() => {
                  this.toIndex();
                }, 1500);
              });
            break;
        }

      }
    },
  },
};
</script>

<template>
  <view class="ko-binding">
    <ZeroLoading type="gear" show-text text="自动关联中，请稍后..." />
  </view>
</template>

<style scoped lang="scss">
.ko-binding {
  height: 100vh;
  padding-bottom: 80px;
}
</style>
