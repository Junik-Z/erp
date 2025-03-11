<script>
import UniFilePicker from "@/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue";
import { _isEmpty, _merge, getFileExtension } from "@/utils";
import getCacheFile from "@/utils/fileCache";
import { uploadBase64Api } from "@/api/user";

export default {
  name: "FilePicker",
  components: {UniFilePicker},
  props: {
    value: [String, Array],
    limit: {
      type: Number,
      default: 1,
    },
    imageStyles: {
      type: Object,
      default() {
        return {};
      },
    },
    returnType: {
      type: String,
      default: "object",
    },
    fileExtname: {
      type: String,
      default: "image",
    },
    mode: {
      type: String,
      default: "grid",
    },
    disabled: Boolean,
    readonly: Boolean,
  },
  data: () => ({
    imageValue: [],
    mImageStyles: {
      width: 100,
      height: 100,
      border: {
        width: 0.5,
        style: "dashed",
        radius: "6px",
      },
    },
  }),
  watch: {
    value: {
      handler() {
        this.imageValue = this.getModelValue();
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    getModelValue() {
      if (_isEmpty(this.value) || !this.value) return {};
      if (this.limit === 1) {
        return this.getValueObj(this.value);
      } else {
        return this.value.map(this.getValueObj);
      }
    },
    getValueObj(name) {
      return {
        name,
        extname: getFileExtension(name),
        url: getCacheFile(name),
      };
    },

    // 获取上传状态
    select(e) {
      this.onCrop(e.tempFilePaths);
    },
    // 获取上传进度
    progress(e) {
      console.log("上传进度：", e);
    },
    // 上传成功
    success(e) {
      console.log("上传成功", e);
    },
    // 上传失败
    fail(e) {
      console.log("上传失败：", e);
    },
    async onUploadBase64(base64) {
      uni.showLoading({
        title: "图片上传中",
        mask: true,
      });
      return uploadBase64Api({base64}).finally(() => uni.hideLoading());
    },

    onCrop(images) {
      const that = this;
      uni.showLoading({
        title: "图片处理中",
        mask: true,
      });

      // #ifdef MP
      const fs = uni.getFileSystemManager();
      // #endif

      const up = [];
      for (let i in images) {
        const base64 = new Promise((resolve, reject) => {

          // #ifdef APP
          plus.io.resolveLocalFileSystemURL(
            images[i],
            function (entry) {
              entry?.file(function (file) {
                const reader = new plus.io.FileReader();
                reader.onloadend = function (e) {
                  const base = e.target.result;
                  //保存文件
                  const uploadBase64 =
                    new Promise((resolve2, reject) => {
                      that.onUploadBase64(base).then(e => resolve2(e));
                    });
                  resolve(uploadBase64);
                };
                reader.onerror = function (e) {
                  console.error(e);
                };
                reader.readAsDataURL(file);
              });
            },
          );
          // #endif

          // #ifdef H5
          uni.getImageInfo({
            src: images[i],
            success: res => {
              let w, h;
              if (res.width > res.height) {
                w = res.width > 1024 ? 1024 : res.width;
                h = w / res.width * res.height;
              } else {
                h = res.height > 1024 ? 1024 : res.height;
                w = h / res.height * res.width;
              }
              const canvas = new OffscreenCanvas(w, h);
              const ctx = canvas.getContext("2d");
              const image = new Image();
              image.src = res.path;
              image.onload = function (e) {
                ctx.drawImage(image, 0, 0, w, h);
                canvas.convertToBlob().then((blob) => {
                  const fr = new FileReader();
                  fr.onload = function (e) {
                    const base = e.target.result;
                    //保存文件
                    const uploadBase64 =
                      new Promise((resolve2, reject) => {
                        that.onUploadBase64(base)
                          .then(e => resolve2(e));
                      });
                    resolve(uploadBase64);
                  };
                  fr.readAsDataURL(blob, {
                    type: "image/png",
                  });
                });

              };
              image.onerror = function (e) {
                console.error(e);
                reject("图片保存失败");
              };

            },
            fail: (err) => {
              console.log(err);
              reject("图片保存失败");
            },
          });
          // #endif

          // #ifdef MP
          fs.readFile({
            filePath: images[i],
            encoding: "base64",
            success: (e) => {
              //保存文件
              const uploadBase64 = new Promise((resolve2) => {
                that.onUploadBase64("data:image/png;base64," + e.data)
                  .then(
                    e => resolve2(e));
              });
              resolve(uploadBase64);
            },
            fail: (e) => {
              console.error(e);
              reject("图片保存失败");
            },
          });
          // #endif

        });
        up.push(base64);

      }

      Promise.all(up).then(e => {
        const data = e.filter((v, i) => {
          if (v) {
            return v;
          }
        });
        if (data.length > 0) {
          uni.hideLoading();
          const value = data.map(v => v.data);
          if (that.limit === 1) {
            that.$emit("input", value[0]);
          } else {
            that.$emit("input", value);
          }
        }
      });
    },

    onRemove(item) {
      if (this.limit === 1) {
        this.$emit("input", "");
      } else {
        // this.$emit("remove", item);
      }
    },
  },
  computed: {
    getImageStyle() {
      return _merge(this.mImageStyles, this.imageStyles);
    },
  },
};
</script>

<template>
  <view class="ko-file-picker">
    <UniFilePicker
      v-model="imageValue"
      :mode="mode"
      @select="select"
      @progress="progress"
      @success="success"
      @fail="fail"
      @delete="onRemove"
      :limit="limit"
      :image-styles="getImageStyle"
      :return-type="returnType"
      :file-mediatype="fileExtname"
      :auto-upload="false"
      :disabled="disabled"
      :readonly="readonly"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-file-picker {
  min-width: 50px;
  min-height: 50px;

  ::v-deep .uni-file-picker {
    height: calc(100% - 0.5px);
    width: calc(100% - 0.5px);
  }
}
</style>
