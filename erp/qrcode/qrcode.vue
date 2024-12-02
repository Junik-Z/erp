<script>
import { getScanCallbackApi } from "@/api/user";
import { showToast } from "@/utils";

export default {
  name: "QrCode",
  data: () => ({
    option: {},
  }),
  onLoad(option) {
    this.option = option;
    console.log(option, uni.getStorageSync("__USER_INFO__"));
  },

  methods: {
    getSuccess() {
      console.log(this.option, uni.getStorageSync("__USER_INFO__"));

      getScanCallbackApi({id: this.option.scene})
        .then(res => {
          console.log(res);
          showToast({
            title: "授权成功",
            success() {
              console.log("授权成功");
              uni.reLaunch({
                url: "/pages/home/home",
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

    <view class="ko-qrcode__icon">
      <i class="iconfont icon-menhu-diannaoduandenglu"></i>
      <view class="ko-qrcode__icon--text">登陆 PC 系统</view>
    </view>

    <button class="ko-basic-button" @click="getSuccess">授权登陆</button>
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
  }
}
</style>
