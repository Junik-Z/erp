<script>
import UniFilePicker from "@/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue";
import { _isEmpty, _merge, getFileExtension, isImageType } from "@/utils";
import getCacheFile from "@/utils/fileCache";
import { uploadBase64Api } from "@/api/user";
import { requestUploadFileApi } from "@/request";

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
    fileMediatype: {
      type: String,
      default: "image",
    },
    fileExtname: {
      type: String,
      default: "png,jpg,jpeg,gif,heif,heic,raw,webp,bmp",
    },
    mode: {
      type: String,
      default: "grid",
    },
    disabled: Boolean,
    readonly: Boolean,
    showUpdateList: Boolean,

    // 是否使用外部上传
    isExternalUpload: Boolean,
  },
  data: () => ({
    imageValue: [],
    mImageStyles: {
      width: 100,
      height: 100,
      border: {
        width: 1,
        style: "dashed",
        radius: "6px",
        color: "#8f939c",
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
      const tempFiles = e.tempFiles;

      const image = [];
      const files = [];

      for (let i = 0; i < tempFiles.length; i++) {
        const tempFile = tempFiles[i];
        const d = tempFile.extname;

        if (isImageType(d)) {
          image.push(tempFile);
        } else {
          files.push(tempFile);
        }
      }

      if (image.length) {
        this.onCropImage(image);
      }

      if (files.length) {
        this.onCropFile(files);
      }
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
      return uploadBase64Api({base64});
    },
    // 文件上传接口
    async onUploadFile(item) {
      return requestUploadFileApi(item);
    },
    onCropImage(images) {
      const that = this;

      uni.showLoading({
        title: "上传中...",
        mask: true,
      });

      // #ifdef MP
      const fs = uni.getFileSystemManager();
      // #endif

      const up = [];
      for (let i in images) {
        const item = images[i];

        const base64 = new Promise((resolve, reject) => {

          // #ifdef APP
          plus.io.resolveLocalFileSystemURL(
            item.url,
            function (entry) {
              entry?.file(function (file) {
                const reader = new plus.io.FileReader();
                reader.onloadend = function (e) {
                  const base = e.target.result;
                  //保存文件
                  const uploadBase64 =
                    new Promise((resolve2, reject) => {
                      that.onUploadBase64(base).then(e => resolve2({...e, _file_: item}));
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
            src: item.url,
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
                          .then(e => resolve2({...e, _file_: item}));
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
            filePath: item.url,
            encoding: "base64",
            success: (e) => {
              //保存文件
              const uploadBase64 = new Promise((resolve2) => {
                that.onUploadBase64("data:image/png;base64," + e.data)
                  .then(e => resolve2({...e, _file_: item}));
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

      Promise.all(up)
        .then(e => {
          const data = e.filter((v) => !!v);
          if (data.length > 0) {
            const value = data.map(v => v.data);
            if (that.limit === 1) {
              that.$emit("input", value[0]);
            } else {
              that.$emit("input", value);
            }

            this.$emit("files", data);
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    onRemove(item) {
      if (this.limit === 1) {
        this.$emit("input", "");
      } else {
        // this.$emit("remove", item);
      }
    },

    // 上传文件
    onCropFile(list) {

      if (this.isExternalUpload) {
        this.$emit("upload", list);
        return false;
      }

      uni.showLoading({
        title: "上传中...",
        mask: true,
      });

      const fn = [];

      // #ifdef MP
      const fs = uni.getFileSystemManager();
      // #endif

      for (const index in list) {
        const item = list[index];
        const base64 = new Promise((resolve, reject) => {
          // #ifdef H5 | MP
          this.onUploadFile(item).then(res => {
            resolve({
              ...res,
              _file_: item,
            });
          }).catch(reject);
          // #endif

          // #ifdef MP
          /*  fs.readFile({
             filePath: item.url,
             encoding: "base64",
             success: (e) => {
               //保存文件
               this.onUploadBase64("data:image/png;base64," + e.data)
                 .then(res => {
                   resolve({...res, _file_: item});
                 })
                 .catch(reject);
             },
             fail: (e) => {
               console.error(e);
               reject("文件保存失败");
             },
           }); */
          // #endif
        });

        fn.push(base64);
      }

      Promise.all(fn)
        .then(res => {
          const data = res.filter((v) => !!v);
          if (data.length > 0) {
            const value = data.map(v => v.data);
            if (this.limit === 1) {
              this.$emit("input", value[0]);
            } else {
              this.$emit("input", value);
            }

            this.$emit("files", data);
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
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
      :file-mediatype="fileMediatype"
      :file-extname="fileExtname"
      :auto-upload="false"
      :disabled="disabled"
      :readonly="readonly"
      :show-update-list="showUpdateList"
    >
      <slot></slot>
    </UniFilePicker>
  </view>
</template>

<style scoped lang="scss">
.ko-file-picker {
  min-width: 50px;
  min-height: 30px;

  ::v-deep .uni-file-picker {
    height: calc(100% - 0.5px);
    width: calc(100% - 0.5px);
  }
}
</style>
