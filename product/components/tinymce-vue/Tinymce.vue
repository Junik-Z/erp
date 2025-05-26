<script>
import tinymce from "@/static/tinymce/tinymce.js";
import TinymceVue from "./js/index";

import "@/static/tinymce/icons/default/icons";
import "@/static/tinymce/themes/silver";
// 插件配置
import "@/static/tinymce/plugins/preview";
import "@/static/tinymce/plugins/image";
import "@/static/tinymce/plugins/lists";
import "@/static/tinymce/plugins/advlist";
// import "@/static/tinymce/plugins/code";
import "@/static/tinymce/plugins/link";
import "@/static/tinymce/plugins/hr";
import "@/static/tinymce/plugins/autolink";
import "@/static/tinymce/plugins/imagetools";
import "@/static/tinymce/plugins/autoresize";
import { uploadBase64Api } from "@/api/user";
import mixins from "@/mixins/mixins";

export default {
  name: "Tinymce",
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      init: {
        language_url: "/static/tinymce/langs/zh_CN.js", // 中文语言包路径
        language: "zh_CN",
        skin_url: "/static/tinymce/skins/ui/oxide",
        width: _this.width,
        min_height: _this.height,
        toolbar_mode: "wrap",
        menubar: false,
        // imagetools: 图片编辑功能。
        plugins: "preview autolink image link hr advlist lists autoresize",
        toolbar:
          "undo redo removeformat | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright outdent indent lineheight formatpainter | \
    formatselect fontsizeselect | bullist numlist | \
    image link hr | preview",

        // code 源代码
        fontsize_formats: "12px 14px 16px 18px 24px 36px",
        formats: {
          // Changes the default format for h1 to have a class of heading
          h1: {
            block: "h1",
            styles: {color: "#333333", fontSize: "18px", fontWeight: "bold"},
          },
          h3: {
            block: "h3",
            styles: {color: "#00A1FF", fontSize: "14px", fontWeight: "bold"},
          },
          p: {
            block: "p",
            styles: {color: "#333333", fontSize: "14px", fontWeight: "normal"},
          },
        },
        block_formats: "一级标题=h1;小标题=h3;正文=p;",
        branding: false,
        // 外部css  很重要的参数
        content_css: "/static/tinymce/content.css",
        //此处为图片上传处理函数，这个直接用了base64的图片形式上传图片，
        //如需ajax上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
        images_upload_handler: (blobInfo, success, failFun) => {
          const base64 = "data:image/jpeg;base64," + blobInfo.base64();
          uploadBase64Api({base64})
            .then(res => {
              success(this.getImageUrl(res.data));
            })
            .catch((reason) => {
              failFun(reason);
            });
        },
      },
    };
  },
  components: {TinymceVue},
  props: {
    value: {
      type: String,
      default: "",
    },
    width: {
      default: "750px",
    },
    height: {
      default: 930,
    },
    readonly: Boolean,
  },
  methods: {},
  mounted() {
    tinymce.init({});
  },
  computed: {
    content: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
};
</script>

<template>
  <div class="ko-tinymce">
    <TinymceVue v-model="content" :init="init" :disabled="readonly" />
  </div>
</template>

<style scoped lang="scss">
.ko-tinymce {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
