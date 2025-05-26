<script>
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

// #ifdef MP
const fn = uni.getFileSystemManager();
// #endif

export default {
  name: "Draw",
  components: {UvLoadingIcon},
  props: {
    code: String,
    avatar: String,
  },
  data: () => ({
    VM: null,
    image: "",
  }),
  watch: {},
  methods: {
    // 将图片存储到本地
    base64Save(base64File) { //base64File 需要加前缀
      let extName = base64File.match(/data\:\S+\/(\S+);/);

      if (extName) {
        //获取文件后缀
        extName = extName[1];
      }

      let fileName = Date.now() + "." + (extName || "png");

      return new Promise((resolve, reject) => {

        //写入文件的路径
        let filePath = uni.env.USER_DATA_PATH + "/" + fileName;

        fn.writeFile({
          filePath,
          data: base64File.replace(/^data:\S+\/\S+;base64,/, ""), //替换前缀为空
          encoding: "base64",
          success: () => {
            resolve(filePath);
          },
          fail() {
            reject("写入失败");
          },
        });
      });
    },

    // 加载图片
    onLoadImage(url) {
      return new Promise(resolve => {
        // #ifdef MP
        if (url.startsWith("http://") || url.startsWith("https://")) {
          uni.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                this.base64Save("data:image/png;base64," + fn.readFileSync(res.tempFilePath, "base64")).then(resolve);
              }
            },
            fail(error) {
              console.log("下载图片错误", error);
            },
          });
        } else {
          this.base64Save(url).then(resolve);
        }
        // #endif

        // #ifdef H5
        resolve(url);
        // #endif
      });
    },

    // 生产图片
    async drawQRCode() {
      if (!this.code || this.image) return false;
      uni.$__DRAW_TIME_VM__ && clearTimeout(uni.$__DRAW_TIME_VM__);

      uni.$__DRAW_TIME_VM__ = setTimeout(async () => {
        this.image = "";
        const vm = uni.createCanvasContext("qr_code", this);

        const qrSize = 300;
        const size = 136;
        const loc = qrSize / 2 - size / 2;

        // 清除画布
        vm.clearRect(0, 0, qrSize, qrSize);

        const code = await this.onLoadImage(this.code);
        vm.drawImage(code, 0, 0, qrSize, qrSize);

        if (this.avatar) {
          vm.beginPath();
          vm.arc(loc + size / 2, loc + size / 2, size / 2, 0, 2 * Math.PI);
          vm.closePath();
          vm.clip();

          vm.setFillStyle("#ffffff"); // 背景颜色，可自定义（如 #f5f5f5）
          vm.fill();

          const avatar = await this.onLoadImage(this.avatar);
          vm.drawImage(avatar, loc, loc, size, size);
        }

        vm.draw(false, (res) => {
          if (res.errMsg === "drawCanvas:ok") {
            console.log("绘制成功");
            setTimeout(() => {
              this.onToBasic64();
            }, 0);
          } else {
            console.error("绘制错误", res.errMsg);
          }
        });
      }, 50);
    },

    onToBasic64() {
      uni.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 300,
        height: 300,
        destWidth: 600,
        destHeight: 600,
        fileType: "png",
        canvasId: "qr_code",
        quality: 1,
        success: (res) => {
          if (res.tempFilePath) {
            // #ifdef MP
            this.image = "data:image/png;base64," + fn.readFileSync(res.tempFilePath, "base64");
            // #endif

            // #ifdef H5
            this.image = res.tempFilePath;
            // #endif
          }
        },
        fail: function (error) {
          console.error("导出画布失败：", error);
        },
      }, this);
    },
  },

  computed: {
    computedList() {
      return [this.code, this.avatar];
    },
  },
};
</script>

<template>
  <view class="ko-qr-code-draw">
    <canvas
      v-show="!image"
      canvas-id="qr_code"
      style="width: 300px; height: 300px; position: absolute; z-index: -1;"
    />
    <image
      v-show="image"
      :src="image"
      mode="aspectFill"
      show-menu-by-longpress="true"
      class="ko-qr-code-draw__image"
    />
    <view class="ko-qr-code-draw__loading" v-if="!image">
      <uv-loading-icon :size="60" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-qr-code-draw {
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &__loading {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // #ifdef MP
  &__image {
    width: 80vw;
    height: 80vw;
    border-radius: 30rpx;
    z-index: 99;
  }

  // #endif

  // #ifdef H5
  &__image {
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    z-index: 99;
  }

  // #endif
}
</style>
