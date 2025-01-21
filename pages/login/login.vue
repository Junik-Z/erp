<script>
// #ifdef H5
import UniCard from "@/uni_modules/uni-card/components/uni-card/uni-card.vue";
// #endif
import { CONFIG } from "@/utils/config";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

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
    document.title = `欢迎登陆 —— ${CONFIG.TITLE}`;
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
      uni.$emit("$__init_event_source__");
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
  },
  onUnload() {
    // this.esVm && this.esVm.close();
  },
};

</script>

<template>
  <div class="ko-login">
    <!-- #ifdef H5 -->
    <div class="ko-login__wrap">
      <image
        class="ko-login__logo"
        src="./login-logo.png"
        alt="login"
        mode="aspectFill"
      />

      <UniCard
        title="欢迎登陆"
        sub-title="高效、便捷"
      >
        <view
          class="ko-login__qrcode"
          :class="{'is-timeout': isTimeout}"
        >
          <image :src="qrimage" mode="widthFix" />
          <!-- #ifdef H5 -->
          <view class="ko-login__qrcode--loading" v-if="loading">
            <UvLoadingIcon :size="40" />
          </view>
          <!-- #endif -->
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
    <!-- #endif -->
  </div>
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

  /deep/ .uni-card {
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

  /deep/ .uni-card__actions {
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
