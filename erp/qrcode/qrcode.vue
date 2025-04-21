<script>
import { getMonitorJumpApi, getScanCallbackApi } from "@/api/user";
import { _deepCopy, _isEmpty, _omit, CustomToast } from "@/utils";
import MerchantsHeader from "@/components/MerchantsHeader/MerchantsHeader.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "QrCode",
  components: {MerchantsHeader},
  data: () => ({
    option: {},
    // 是否是数据大屏登录
    isMonitor: false,
    pathList: {},

    visible: false,

    monitorJump: null,
  }),
  mixins: [mixins],
  onLoad(option) {
    let query = _deepCopy(_isEmpty(option) ? uni.getStorageSync("__APP_QUERY__") : option);
    query.login_code = decodeURIComponent(query.login_code || query.scene);
    query = _omit(query, ["scene"]);

    const arr = query.login_code?.split("&") || [];

    this.option = query;

    this.onLogInAgain({scene: arr[0] || ""}, true)
      .then(() => {
        arr[1] && getMonitorJumpApi({id: arr[1]})
          .then(res => {
            const data = res.data;
            this.isMonitor = !_isEmpty(data);
            this.pathList = data;

            if (this.isMonitor) {
              this.visible = true;
            }
          });
      });
  },

  methods: {
    getSuccess() {
      if (this.isMonitor && !this.visible) {
        this.visible = true;
        return;
      }

      const arr = this.option.login_code?.split("&") || [];
      console.log(arr, this.option);
      getScanCallbackApi({id: arr[1], ...(this.monitorJump ? {monitorJump: this.monitorJump} : {})})
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
        })
        .finally(() => {
          this.visible = false;
        });
    },

    onChangeRadio(event) {
      this.monitorJump = event.detail.value;
    },
  },
};
</script>

<template>
  <view class="ko-qrcode">
    <MerchantsHeader is-qr-code />

    <view class="ko-qrcode__icon">
      <i class="iconfont icon-menhu-diannaoduandenglu"></i>
      <view class="ko-qrcode__icon--text">登录{{ isMonitor ? "数据大屏" : "管理" }}系统</view>
    </view>

    <button class="ko-basic-button" @click="getSuccess">{{ isMonitor ? "选择大屏" : "授权登录" }}</button>

    <BasicPopup :visible.sync="visible" title="选择大屏">
      <view class="ko-qrcode__popup">
        <radio-group @change="onChangeRadio">
          <view class="ko-qrcode__popup--item" v-for="(path, key) of pathList" :key="key">
            <radio color="rgb(42,121,255)" :checked="monitorJump === key" :value="key">
              {{ path }}
            </radio>
          </view>
        </radio-group>
      </view>

      <template #footer>
        <view style="display: flex; justify-content: center; align-items: center;">
          <button class="ko-basic-button__card" style="width: 120px;" @click="getSuccess">授权登录</button>
        </view>
      </template>
    </BasicPopup>
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

  &__popup {
    width: 80vw;
    padding: 10px 20px 0;

    &--item {
      margin-bottom: 16px;
    }
  }
}
</style>
