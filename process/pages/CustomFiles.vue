<script>
import FilePreview from "./FilePreview.vue";
import { CONFIG } from "@/utils/config";
import { _deepCopy, _isEmpty, CustomToast, isExcelType, isImageType, isPdfType, isWordType } from "@/utils";
import { downFileApi } from "@/request";
import { getFileUrl } from "@/api/user";

const ImageList = {
  image: "data:image/png;base64,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",
  pdf: "data:image/png;base64,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",
  doc: "data:image/png;base64,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",
  xls: "data:image/png;base64,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",
};

let ICON_SIZE = 120;

// #ifdef MP
ICON_SIZE = 64;
// #endif

export default {
  name: "CustomTable",
  components: {FilePreview},
  props: {
    value: {
      type: String,
      default: "",
    },
    readonly: Boolean,
  },
  watch: {
    value: {
      handler() {
        this.value && this.getList();
      },
      immediate: true,
    },
  },
  data() {
    // /files/down/xlsx20250324/e123c2f5885c40b196523c2cfe332241.xlsx
    // /files/down/pdf20250324/302d7a3d8f1041eda7c2ec28f63ffa5d.pdf
    // /files/down/docx20250324/2a14b0f215884ff7ae97cf906e74f84b.docx
    return {
      objList: {
        list: [
          /* {
            name: "xlsx20250324",
            id: "/files/down/xlsx20250324/e123c2f5885c40b196523c2cfe332241.xlsx",
            extname: "xlsx",
          },
          {
            name: "pdf20250324",
            id: "/files/down/pdf20250324/302d7a3d8f1041eda7c2ec28f63ffa5d.pdf",
            extname: "pdf",
          },
          {
            name: "docx20250324",
            id: "/files/down/docx20250324/2a14b0f215884ff7ae97cf906e74f84b.docx",
            extname: "docx",
          },
          {
            name: "png20250324.png",
            id: "/files/down/png20250324/79f37151ea4a44c1b872823f4af0a399.png",
            extname: "png",
          }, */
        ],
        version: CONFIG.T_VERSION,
      },
    };
  },
  methods: {
    // 文件上传成功时触发
    onSuccessFiles(files) {
      console.log("上传成功的文件", files);
      const file = files[0] || {};
      if (!_isEmpty(file)) {
        const obj = {
          name: file._file_.name,
          id: file.data,
          extname: file._file_.extname,
          size: file._file_.size,
        };

        this.objList.list.push(obj);
        this.onEmit();
      }
    },

    // 获取文件列表数据
    getList() {
      try {
        const obj = JSON.parse(this.value) || {};
        if (obj?.version) this.objList = obj;
        console.log(obj);
      } catch (e) {
        console.error("【CustomFile.vue】: 数据解析失败。", e);
        this.objList = _deepCopy(this.$options.data().objList);
      }
    },

    // 向外部发送数据
    onEmit() {
      this.$emit("input", JSON.stringify(this.objList));
    },

    // 预览文件
    onPreview(item) {
      this.$refs.FPRef.open(item);
    },

    // 移除文件
    onRemove(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除该文件吗？`,
        success: (res) => {
          if (res.confirm) {
            this.objList.list.splice(index, 1);
            this.onEmit();
          }
        },
      });
    },

    // 下载文件
    onDownload(item) {
      // #ifdef MP
      downFileApi(item.id)
        .then(res => {
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (cRes) => {
              const savedFilePath = cRes.savedFilePath;  // 永久存储路径
              console.log("文件已保存:", savedFilePath);
              CustomToast({title: `文件已保存至：${savedFilePath}`, icon: "none"});
            },
            fail: (err) => {
              CustomToast({title: "文件下载失败", icon: "none"});
            },
          });
        })
        .catch(() => {
          CustomToast({title: "文件下载失败", icon: "none"});
        });
      // #endif

      // #ifdef H5
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = getFileUrl(item.id);
      const name = item.name?.indexOf(".") > -1;

      link.download = item.name + (name ? "" : `.${item.extname}`);

      document.body.appendChild(link);

      link.click();

      setTimeout(() => {
        // 立即移除元素（可能不兼容所有浏览器）
        document.body.removeChild(link);
      }, 10);
      // #endif
    },
  },
  computed: {
    getTableStyle() {
      let col = "50px auto auto 160px";
      // #ifdef MP
      col = "50px auto auto auto";
      // #endif

      return {"grid-template-columns": col};
    },

    // 获取文件类型图片
    getImageAvatar() {
      return item => {
        if (isWordType(item.extname)) return ImageList.doc;
        if (isPdfType(item.extname)) return ImageList.pdf;
        if (isImageType(item.extname)) return ImageList.image;
        if (isExcelType(item.extname)) return ImageList.xls;
        return "";
      };
    },

    iconSize() {
      return ICON_SIZE;
    },
  },
};
</script>

<template>
  <view class="ko-custom-files">
    <view class="ko-custom-files__wrap">
      <block v-for="(item, index) of objList.list" :key="index">
        <view class="ko-custom-files__item">
          <BasicCard @click.stop="onPreview(item)">
            <view class="ko-custom-files__item--wrap">
              <uv-avatar
                not-view
                :src="getImageAvatar(item)"
                shape="square"
                :size="iconSize"
              />
              <view class="ko-custom-files__item--name">
                <text class="ko-custom-files__item--name--text">
                  {{ item.name }}
                </text>
              </view>
              <view class="ko-custom-files__item--btns">
                <!-- #ifdef H5 -->
                <button class="ko-basic-button__card" @click.stop="onDownload(item)">下载</button>
                <!-- #endif -->
                <button class="ko-basic-button__card" @click.stop="onRemove(item, index)" v-if="!readonly">删除</button>
              </view>
            </view>
          </BasicCard>
        </view>
      </block>
    </view>

    <block v-if="!objList.list.length">
      <view class="ko-custom-files__no-file">您还未上传文件</view>
    </block>

    <view class="ko-custom-files__update" v-if="!readonly">
      <FilePicker
        mode="list"
        file-mediatype="all"
        file-extname="png,jpg,jpeg,pdf,xls,xlsx,doc,docx"
        @files="onSuccessFiles"
      >
        <button class="ko-basic-button__card">
          <view style="display: flex; align-items: center;">
            <uni-icons type="cloud-upload-filled" color="#fff" />
            <text style="margin-left: 8px;">文件上传</text>
          </view>
        </button>
      </FilePicker>
    </view>

    <FilePreview ref="FPRef" />
  </view>
</template>

<style scoped lang="scss">
.ko-custom-files {
  width: 100%;

  &__update {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;

    ::v-deep .files-button {
      white-space: nowrap;
    }

    .ko-basic-button__card {
      padding: 4px 12px;
    }
  }

  &__no-file {
    padding: 30px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #c7c9ce;
    //border: 1px solid #e9e9eb;
    //border-top: none;
    font-size: 12px;
  }

  &__wrap {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    margin: 5px;
    // #ifdef MP
    width: calc(50% - 10px);
    // #endif

    &--wrap {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &--name {
      // #ifdef MP
      font-size: 12px;
      padding: 10px;

      &--text {
        @include basic-text-ellipsis(1);
      }

      // #endif

    }

    &--btns {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }

  // #ifdef H5
  &__item {
    cursor: pointer;
    width: calc(30% - 10px);

    &--name {
      font-size: 16px;
      padding: 10px;
      height: calc(16px * 2 + 20px);

      &--text {
        @include basic-text-ellipsis(2);
      }
    }
  }

  // #endif


}
</style>
