<script>
// #ifdef H5
import UniCard from "@/uni_modules/uni-card/components/uni-card/uni-card.vue";
import { CONFIG } from "@/utils/config";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";
import { getScanQrCodeApi } from "@/api/user";
import dayjs from "@/utils/dayjs";

export default {
  name: "KoLogin",
  components: {
    UvLoadingIcon,
    // #ifdef H5
    UniCard,
    // #endif
  },
  data() {
    return {
      qrimage: "",
      id: "",

      esVm: null,

      isTimeout: false,
      loading: false,
    };
  },
  onLoad() {
    // #ifdef H5
    this.getScan();
    uni.$on("$__login_success__", this.onSuccess);
    uni.$on("$__success_code_images__", this.getCodeImage);
    document.title = `欢迎登录 —— ${CONFIG.TITLE}`;
    // #endif
  },
  methods: {
    getQrCode() {
      this.getScan();
    },

    getCodeImage(image) {
      this.qrimage = image;
      this.loading = false;
    },

    // 发起状态监听
    getScan() {
      this.loading = true;
      this.getEventSource();
    },

    // 接收到的消息
    onSuccess(res) {
      console.log("获取到的消息", res);

      uni.reLaunch({
        url: "/pages/home/home?type=login",
        fail(err) {
          console.log("跳转错误", err);
        },
      });
    },

    // 开启长链接
    getEventSource() {
      const ESVm = new EventSource(getScanQrCodeApi() + `?X_MiniApp_Env=${CONFIG.SystemVersion}&X_MiniApp_ID=${CONFIG.APP_ID}&T_VERSION=${CONFIG.T_VERSION}`);

      uni.$__EVENT_SOUECE_VM__ = ESVm;

      ESVm.onopen = (event) => {
        console.log(`EventSource 链接成功. ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`, event);
      };

      ESVm.onerror = (event) => {
        console.error("EventSource 链接错误:", event);
      };

      // 链接成功
      ESVm.addEventListener("connect", (res) => {
        console.log("EventSource 消息接收成功", res.data);
      }, false);

      // 表示登录成功
      ESVm.addEventListener("X-Tenant-ID", (res) => {
        const scene = res.data;
        uni.setStorageSync("__APP_SCENE__", scene);
        uni.$emit("$__login_success__", scene);
        uni.setStorageSync("Cookie", scene);

        ESVm?.close();
      }, false);

      // 表示登录成功
      ESVm.addEventListener("AccessToken", (res) => {
        const scene = res.data;
        uni.setStorageSync("AccessToken", scene);
      }, false);

      // 获取到的二维码图片
      ESVm.addEventListener("scanCode", (res) => {
        const codeImage = res.data;
        uni.$emit("$__success_code_images__", codeImage);
      }, false);
    },

  },
  onUnload() {
    // this.esVm && this.esVm.close();
  },
};

// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-login">
    <div class="ko-login__wrap">
      <image
        class="ko-login__logo"
        src="./login-logo.png"
        alt="login"
        mode="aspectFill"
      />

      <UniCard
        title="欢迎登录"
        sub-title="高效、便捷"
      >
        <view
          class="ko-login__qrcode"
          :class="{'is-timeout': isTimeout}"
        >
          <image :src="qrimage" mode="widthFix" />
          <view class="ko-login__qrcode--loading" v-if="loading">
            <UvLoadingIcon :size="40" />
          </view>
        </view>
        <template #actions v-if="isTimeout">
          <button
            class="ko-basic-button"
            @click="getQrCode"
            :loading="loading"
          >
            刷新二维码
          </button>
        </template>
      </UniCard>
    </div>
  </div>
  <!-- #endif -->
</template>

<style scoped lang="scss">
// #ifdef H5
.ko-login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  &__wrap {
    display: flex;
    align-items: center;
    height: 50vh;

    .ko-basic-button {
      margin-bottom: 20px;
    }

    ::v-deep .uni-card__header {
      padding-top: 30px;
    }
  }

  &__qrcode {
    width: 320px;
    height: 320px;
    position: relative;

    &.is-timeout {
      position: relative;

      &:before {
        content: "二维码已过期";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }
    }

    img {
      width: 300px;
      height: 300px;
    }

    &--loading {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 9;
    }
  }

  ::v-deep .uni-card {
    width: 500px;
    height: 500px;

    .uni-card__content {
      height: 360px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .uni-forms {
        width: 100%;

        .uni-forms-item {
          margin-bottom: 40px;

          .uni-forms-item__label {
            font-size: 18px;
          }
        }
      }
    }

    .uni-card__header .uni-card__header-content {
      text-align: center;
    }
  }

  ::v-deep .uni-card__actions {
    padding: 0 10px 16px;
  }


  &__logo {
    width: 500px;
    height: 100%;
    margin-right: 20px;
  }

  .ko-basic-button {
    margin: 0 80px;
  }
}

// #endif
</style>
