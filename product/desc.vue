<script>
// #ifdef MP
import PiaoyiEditor from "./components/piaoyi-editor/piaoyi-editor.vue";
// #endif
// #ifndef MP
import Tinymce from "./components/tinymce-vue/Tinymce.vue";
// #endif
import { _deepCopy, _isEqual, _isHttpOrHttps } from "@/utils";
import { CONFIG } from "@/utils/config";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import mixins from "@/mixins/mixins";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import Standard from "./components/Standard.vue";

export default {
  name: "SetDesc",
  components: {
    Standard,
    // #ifdef MP
    PiaoyiEditor,
    // #endif

    // #ifndef MP
    Tinymce,
    // #endif
    UniSection,
    FilePicker,
  },
  mixins: [mixins],
  onLoad(option) {
    const EC = this.getOpenerEventChannel();
    EC?.on?.("on_good_desc_over", (obj) => {
      // #ifdef H5
      sessionStorage.setItem("GOOD_DESC_OVER", JSON.stringify(obj));
      // #endif

      // #ifdef MP
      this.info(obj);
      // #endif
    });

    // #ifdef H5
    setTimeout(() => {
      const data = sessionStorage.getItem("GOOD_DESC_OVER");
      if (!data) return false;
      try {
        const list = JSON.parse(data);
        this.info(list);
      } finally {
      }
    }, 200);
    // #endif
  },
  data() {
    return {
      values: "",
      readOnly: false, //是否只读
      photoUrl: CONFIG.BASE_URL, //服务器图片域名或者ip
      api: "/files/base64", //上传图片接口地址
      name: "file",
      html: "",
      takeOverName: null,

      carousel: [],
      // 子产品
      subClasses: [],

      sIVId: null,
    };
  },
  methods: {
    info(info) {
      const data = _deepCopy(info);
      this.readOnly = _isEqual("view", data.type);
      this.values = (data.value || "")
        ?.replace?.(/<img([^>]*)src="(.*?)"([^>]*)>/gi, (match, p1, p2, p3) => {

          if (_isHttpOrHttps(p2)) {
            return `<img${p1}src="${p2}"${p3}>`;
          }

          return `<img${p1}src="${CONFIG.BASE_URL + p2}"${p3}>`;
        });

      this.takeOverName = data.takeOverName;
      this.carousel = data.carousel;
      this.subClasses = data.subClasses;
    },

    saveContens({html}) {
      this.html = html;
    },

    onSubmit() {
      if (!this.readOnly) {
        const html = (this.html || this.values)
          ?.replace?.(/<img([^>]*)src="(.*?)"([^>]*)>/gi, (match, p1, p2, p3) => {
            let p = p2?.replace(/^.*?(?=\/files)/, "");
            return `<img${p1}src="${p}"${p3}>`;
          });
        const carousel = this.carousel;
        const subClasses = this.subClasses;

        // #ifndef H5
        const EC = this.getOpenerEventChannel();
        EC?.emit?.("on_good_desc_over", {html, carousel, subClasses});
        // #endif

        // #ifdef H5
        uni.$emit(this.takeOverName, {html, carousel, subClasses});
        // #endif
      }

      uni.navigateBack({
        delta: 1,
        fail(err) {
          console.log(err);
        },
        success(err) {
          console.log(err);
        },
      });
    },

    // 上传成功
    onSuccessFiles(files) {
      console.log("上传成功的文件", files);
    },

    // 初始化
    onInitEditor() {
      this.sIVId = null;
      setTimeout(() => {
        this.sIVId = "BannerId";
      }, 10);
    },
  },
};
</script>

<template>
  <scroll-view scroll-y class="ko-desc" :scroll-into-view="sIVId">
    <view id="BannerId" style="height: 0;overflow: hidden" />

    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->

    <UniSection title="Banner: " type="line">
      <view style="padding: 0 10px 16px;">
        <view class="ko-desc__swiper" v-if="readOnly">
          <swiper
            class="ko-desc__swiper--wrap"
            autoplay
            :duration="500"
            :interval="3000"
            indicator-dots
          >
            <swiper-item
              class="ko-desc__swiper--item"
              v-for="item of carousel"
              :key="item"
            >
              <image
                class="ko-desc__swiper--image"
                :src="getImageUrl(item)"
                mode="widthFix"
                lazy-load
              />
            </swiper-item>
          </swiper>
        </view>

        <view class="ko-desc__swiper--button" v-else>
          <FilePicker
            v-model="carousel"
            :limit="9"
            file-extname="png,jpg,jpeg,gif"
            show-update-list
            return-type="array"
            :image-styles="{width: '100px',height: '100px'}"
            :readonly="readOnly"
            @files="onSuccessFiles"
          >
            <!-- <button class="ko-basic-button__card" style="width: 120px;">
               <view style="display: flex; align-items: center; justify-content: center;">
                 <uni-icons type="cloud-upload-filled" color="#fff" />
                 <text style="margin-left: 8px;">图片上传</text>
               </view>
             </button>-->
          </FilePicker>

          <view style="font-size: 12px; color: #c7c9ce; margin-top: 6px;">推荐图片尺寸：16:9</view>
        </view>
      </view>
    </UniSection>

    <UniSection title="产品规格: " type="line" v-if="(readOnly && subClasses.length) || !readOnly">
      <view class="ko-desc__swiper">
        <Standard v-model="subClasses" :readonly="readOnly" />
      </view>
    </UniSection>

    <UniSection title="产品描述: " type="line">
      <view style="height: 100vh;">
        <!-- #ifndef MP -->
        <Tinymce v-model="values" :readonly="readOnly" />
        <!-- #endif -->

        <!-- #ifdef MP -->
        <PiaoyiEditor
          :values="values"
          :read-only="readOnly"
          :maxlength="999999999999999"
          :photoUrl="photoUrl"
          :api="api"
          :name="name"
          @changes="saveContens"
          @init="onInitEditor"
        />
        <!-- #endif -->
      </view>
    </UniSection>

    <view class="ko-desc__footer">
      <button class="ko-basic-button__card" style="width: 120px" @click="onSubmit">
        {{ readOnly ? "返回" : "编辑完成" }}
      </button>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.ko-desc {
  height: 100vh;
  padding-bottom: 30px;

  // #ifdef H5
  &__swiper {
    width: 750px;
    margin: 0 auto;

    uni-swiper {
      height: 328px;
    }

    &--wrap {
      height: 328px;
    }

    &--image {
      width: 100%;
    }

    &--button {
      width: 750px;
      margin: 20px auto 0;
    }
  }

  // #endif

  // #ifdef MP
  &__swiper {
    width: 100%;

    &--wrap {
      height: 308px;
    }

    &--image {
      width: calc(100vw - 20px);
    }

    &--button {
      margin-top: 10px;
      //display: flex;
      //align-items: center;
      //justify-content: flex-end;
    }
  }

  // #endif

  &__footer {
    position: fixed;
    bottom: 32px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
