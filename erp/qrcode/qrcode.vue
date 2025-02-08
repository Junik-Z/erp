<script>
import { getScanCallbackApi } from "@/api/user";
import { _deepCopy, _isEmpty, _omit, CustomToast } from "@/utils";
import MerchantsHeader from "@/components/MerchantsHeader/MerchantsHeader.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "QrCode",
  components: {MerchantsHeader},
  data: () => ({
    option: {},
  }),
  mixins: [mixins],
  onLoad(option) {
    let query = _deepCopy(_isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option);
    query.login_code = decodeURIComponent(query.login_code || query.scene);
    query = _omit(query, ["scene"]);

    const arr = query.login_code?.split("&") || [];

    this.option = query;
    this.onLogInAgain({scene: arr[0]}, true)
      .then(() => {
        console.log(query, uni.getStorageSync("__USER_INFO__"));
      });
  },

  methods: {
    getSuccess() {
      console.log(this.option, uni.getStorageSync("__USER_INFO__"));
      const arr = this.option.login_code?.split("&") || [];
      getScanCallbackApi({id: arr[1]})
        .then(res => {
          console.log(res);
          CustomToast({
            title: "授权成功",
            success() {
              console.log("授权成功");
              uni.reLaunch({
                url: "/pages/index/index",
              });
            },
          });
        });
    },
  },
};
</script>

<template>
  <view class="ko-qrcode">
    <MerchantsHeader is-qr-code />

    <view class="ko-qrcode__icon">
      <i class="iconfont icon-menhu-diannaoduandenglu"></i>
      <view class="ko-qrcode__icon--text">登录 PC 系统</view>
    </view>

    <button class="ko-basic-button" @click="getSuccess">授权登录</button>
  </view>
</template>

<style scoped lang="scss">
.ko-qrcode {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__icon {
    .iconfont {
      font-size: 120px;
    }

    &--text {
      margin-top: 10px;
      font-size: 20px;
    }
  }

  .ko-basic-button {
    margin-top: 100px;
    padding: 0 60px;
    margin-bottom: 120px;
  }
}
</style>
