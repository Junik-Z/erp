<script>
import AyQrcode from "./components/ay-qrcode/ay-qrcode.vue";
import { showQRCodeApi } from "@/api/erp/attend";
import CryptoJS from "./crypto-js/crypto-js";
import Dayjs from "@/utils/dayjs";

export default {
  name: "check-in",
  data() {
    return {
      //二维码相关参数
      modal_qr: false,
      url: "https://pixabay.com/images/search/?order=ec", // 要生成的二维码值

      AesKey: {},

      timeVM: "",
    };
  },
  components: {AyQrcode},
  onLoad() {
    const aes = uni.getStorageSync("__AES_KEY__");
    const time = aes?.TIME;
    let flag = false;
    if (time) {
      flag = Dayjs(time).isSame(Dayjs(), "d");
    }
    if (flag) {
      this.getEncryptAes();
    } else {
      this.getAesKey();
    }
  },
  methods: {
    getAesKey() {
      showQRCodeApi()
        .then(res => {
          this.AesKey = res.data;
          uni.setStorageSync("__AES_KEY__", {...res.data, TIME: +new Date()});
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
      const url = `${scene}&${+new Date()}`;
      this.url = this.encryptAES(url);

      this.showQrcode();

      console.log(this.url);

      this.timeVM = setTimeout(() => {
        this.getEncryptAes();
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
    <AyQrcode
      ref="qrcode"
      :modal="modal_qr"
      :url="url"
      :height="300"
      :width="300"
      @hideQrcode="hideQrcode"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-check {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 10vh;
}
</style>
