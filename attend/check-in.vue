<script>
import AyQrcode from "./components/ay-qrcode/ay-qrcode.vue";
import { showQRCodeApi } from "@/api/erp/attend";
import CryptoJS from "./crypto-js/crypto-js";
import Dayjs from "@/utils/dayjs";
import mixins from "@/mixins/mixins";

export default {
  name: "check-in",
  data() {
    return {
      //二维码相关参数
      modal_qr: false,
      url: "", // 要生成的二维码值

      AesKey: {},

      timeVM: "",

      time: "",
    };
  },
  components: {AyQrcode},
  onLoad() {
    const aes = uni.getStorageSync("__AES_KEY__");
    this.time = Dayjs().format("YYYY-MM-DD HH:mm");
    let flag = false;
    if (aes?.updateTime) {
      this.AesKey = aes;
      flag = Dayjs(aes?.updateTime).isSame(Dayjs(), "d");
    }
    if (flag) {
      this.getEncryptAes();
    } else {
      this.getAesKey();
    }
  },
  mixins: [mixins],
  methods: {
    getAesKey() {
      showQRCodeApi()
        .then(res => {
          const data = res.data;
          const deviation = +new Date() - (Dayjs(data.updateTime).valueOf() || 0);
          data.deviation = deviation;
          uni.setStorageSync("__AES_KEY__", {...res.data, deviation});

          this.AesKey = data;
          this.getEncryptAes();
        });
    },

    // 处理加密
    encryptAES(message) {
      const key = CryptoJS.enc.Utf8.parse(this.AesKey.aesKey); // 32 字节
      const iv = CryptoJS.enc.Utf8.parse(this.AesKey.aesIv); // 16 字节
      const config = {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      };
      return CryptoJS.AES.encrypt(message, key, config).toString();
    },

    // 展示二维码
    showQrcode() {
      let _this = this;
      this.modal_qr = true;
      setTimeout(function () {
        _this.$refs.qrcode.crtQrCode();
      }, 50);
    },

    //传入组件的方法
    hideQrcode() {
      this.modal_qr = false;
    },

    getEncryptAes() {
      const scene = uni.getStorageSync("__APP_SCENE__") || "";
      const url = `${scene}&${+new Date() - (this.AesKey?.deviation || 0)}`;
      this.url = this.encryptAES(url);

      this.showQrcode();

      this.timeVM = setTimeout(() => {
        this.getEncryptAes();
        this.time = Dayjs().format("YYYY-MM-DD HH:mm");
      }, 60 * 1000);
    },
  },

  onUnload() {
    clearTimeout(this.timeVM);
  },
};
</script>

<template>
  <view class="ko-check">
    <view class="ko-check__title">考勤二维码</view>
    <view class="ko-check__shop">{{ GET_SHOP_NAME }}</view>
    <view class="ko-check__time">{{ time }}</view>

    <view class="ko-check__content">
      <view class="ko-check__wrap">
        <AyQrcode
          ref="qrcode"
          :modal="modal_qr"
          :url="url"
          :height="300"
          :width="300"
          @hideQrcode="hideQrcode"
        />
      </view>
      <view class="ko-check__wrap--line"></view>
    </view>
  </view>
</template>

<style scoped lang="scss">
$borderRadius: 30rpx;

@keyframes ClipPath {
  0%,
  100% {
    clip-path: inset(0 0 98% 0);
  }
  25% {
    clip-path: inset(0 98% 0 0);
  }
  50% {
    clip-path: inset(98% 0 0 0);
  }
  75% {
    clip-path: inset(0 0 0 98%);
  }
}

.ko-check {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 10vh;

  &__title {
    font-size: 24px;
  }

  &__shop {
    margin-top: 20px;
    font-size: 16px;
  }

  &__time {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    flex-direction: row;
    aspect-ratio: 1;
    opacity: 1;
    border-radius: $borderRadius;
    background: white;
    box-shadow: 0 0 20rpx #00000022;
    position: relative;
    padding: 50rpx;
  }

  &__wrap {
    width: 300px;
    height: 300px;
    overflow: hidden;

    &--line {
      position: absolute;
      text-align: center;
      font-size: 24px;
      border-radius: 15px;
      transition: all .3s;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 2px solid rgb(90, 90, 90);
        transition: all .5s;
        border-radius: $borderRadius;
        animation: ClipPath 3s infinite linear;
      }

      &::after {
        animation: ClipPath 3s infinite -1.5s linear;
      }
    }
  }
}
</style>
