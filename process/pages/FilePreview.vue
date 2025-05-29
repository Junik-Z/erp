<script>
// #ifdef H5
import VPdfVm from "./libs/js-preview-lib/pdf.umd";
import VWordVm from "./libs/js-preview-lib/docx.umd";
import "./libs/js-preview-lib/excel.css";
import "./libs/js-preview-lib/docx.css";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
// #endif
import { CustomToast, isCDAType, isExcelType, isImageType, isPdfType, isWordType } from "@/utils";
import { getFileUrl } from "@/api/user";
import { downFileApi } from "@/request";
import mixins from "@/mixins/mixins";

// 预览地址

// /files/down/xlsx20250324/e123c2f5885c40b196523c2cfe332241.xlsx
// /files/down/pdf20250324/302d7a3d8f1041eda7c2ec28f63ffa5d.pdf
// /files/down/docx20250324/2a14b0f215884ff7ae97cf906e74f84b.docx

export default {
  name: "FilePreview",
  mixins: [mixins],
  data() {
    return {
      visible: false,
      dom: null,
    };
  },
  components: {
    // #ifdef H5
    BasicPopup,
    // #endif
  },
  methods: {
    open(item) {
      if (isImageType(item.extname)) {
        uni.previewImage({
          urls: [this.getImageUrl(item.id)],
        });
      } else {
        // #ifdef H5
        this.onPreview(item);
        // #endif

        // #ifdef MP
        downFileApi(item.id)
          .then(res => {
            const filePath = res.tempFilePath;
            uni.openDocument({
              filePath: filePath,
              showMenu: false,
              fileType: item.extname,
              success: function (res) {
                console.log("打开文档成功");
              },
              fail(err) {
                console.error("【文档打开失败】：", err);
                CustomToast({
                  title: "文档打开失败",
                  icon: "none",
                });
              },
            });
          });
        // #endif
      }
    },


    // 处理文件查看
    // #ifdef H5
    onPreview(item) {
      this.$refs.PRef.open("center");

      setTimeout(() => {
        this.$nextTick(() => {
          const {extname, id} = item || {};
          if (isPdfType(extname)) {
            const PdfVm = VPdfVm.init(this.$refs.RRef);
            PdfVm.preview(getFileUrl(id));
          } else if (isWordType(extname)) {

            if (["DOC"].includes(extname.toUpperCase())) {
              const DOM = document.createElement("iframe");
              DOM.style.height = "calc(100% + 154px)";
              DOM.style.width = "100%";
              DOM.style.marginTop = "-154px";

              let url = getFileUrl(id);
              if (!(/^https?:\/\//.test(url))) {
                url = `https://erp.kuaouyun.cn${url}`;
              }

              DOM.src = `https://view.officeapps.live.com/op/view.aspx?src=${url}&&embed=true`;
              this.dom = DOM;
              this.$refs.RRef.appendChild(DOM);
            } else {
              const VWVm = VWordVm.init(this.$refs.RRef);
              VWVm.preview(getFileUrl(id));
            }

          } else if (isExcelType(extname)) {
            const DOM = document.createElement("iframe");
            DOM.style.height = "calc(100% + 154px)";
            DOM.style.width = "100%";
            DOM.style.marginTop = "-154px";

            let url = getFileUrl(id);
            if (!(/^https?:\/\//.test(url))) {
              url = `https://erp.kuaouyun.cn${url}`;
            }

            DOM.src = `https://view.officeapps.live.com/op/view.aspx?src=${url}&&embed=true`;
            this.dom = DOM;
            this.$refs.RRef.appendChild(DOM);

            /* if (["XLS"].includes(extname.toUpperCase())) {
              const DOM = document.createElement("iframe");
              DOM.style.height = "calc(100% + 154px)";
              DOM.style.width = "100%";
              DOM.style.marginTop = "-154px";

              let url = getFileUrl(id);
              if (!(/^https?:\/\//.test(url))) {
                url = `https://erp.kuaouyun.cn${url}`;
              }

              DOM.src = `https://view.officeapps.live.com/op/view.aspx?src=${url}&&embed=true`;
              this.dom = DOM;
              this.$refs.RRef.appendChild(DOM);
            } else {
              const EVM = ExcelVm.init(this.$refs.RRef);
              EVM.preview(getFileUrl(id));
            } */
          } else if (isCDAType(id)) {
            uni.showModal({
              title: "温馨提示",
              content: "抱歉，当前不支持预览CDA相关文件！",
              showCancel: false,
            });
          }
        });
      }, 100);
    },

    onClose() {
      if (this.dom) this.$refs.RRef?.removeChild(this.dom);

      this.$refs.PRef.close();
      this.$emit("close");
    },
    // #endif
  },
};
</script>

<template>
  <!-- #ifdef H5 -->
  <uv-popup
    ref="PRef"
    mode="center"
    round="10"
    :close-on-click-overlay="false"
    :adjustPosition="false"
    z-index="9999"
  >
    <div class="ko-file-preview">
      <button
        class="ko-file-preview__close ko-basic-button__card ko-basic-box-shadow"
        @click="onClose"
      >
        <i class="iconfont icon-cha"></i>
      </button>

      <div ref="RRef" class="ko-file-preview__wrap"></div>
    </div>
  </uv-popup>
  <!-- #endif -->
</template>

<style scoped lang="scss">
// #ifdef H5
.ko-file-preview {
  position: relative;

  &__wrap {
    width: 80vw;
    height: 96vh;
    background: gray;
  }

  &__close {
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 9999;
    border-radius: 50%;
    padding: 10px;
    width: 40px;
    height: 40px;
    font-size: 32px;
  }
}

// #endif
</style>
