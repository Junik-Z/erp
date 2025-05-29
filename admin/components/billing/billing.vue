<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { PageEnums } from "@/utils/config";
import mixins from "@/mixins/mixins";
import UvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue";

export default {
  name: "Billing",
  props: {
    // 广告模式，popup: 弹窗；dom: 元素
    type: {
      type: String,
      default: "popup",
    },
  },
  mixins: [mixins],
  data() {
    return {
      visible: true,
      swiperHeight: 210,

      images: [],
      tis: "",
    };
  },
  mounted() {
    // this.$refs.PRef.open();
  },
  components: {
    UvPopup,
    BasicPopup,
  },
  methods: {
    open(node) {
      this.images = node?.images || [];
      this.tis = node?.tis || "";
      this.$refs.PRef.open();
    },

    // 关闭
    onClose() {
      this.$refs.PRef.close();
    },

    // 跳转到自助开通CNC服务
    onJumpRenewal() {
      uni.navigateTo({
        url: PageEnums.adminRenewal + `?type=CUSTOM_CNC`,
      });
    },

    onImageLoad(e) {
      const winWidth = uni.getSystemInfoSync().windowWidth;
      const imgWidth = e.detail.width;
      const imgHeight = e.detail.height;
      this.swiperHeight = winWidth * imgHeight / imgWidth;
    },
  },

  computed: {},
};
</script>

<template>
  <view class="ko-billing" :class="[`ko-billing__${type}`]">
    <uv-popup
      mode="center"
      ref="PRef"
      :overlay-style="{background: 'rgba(0, 0, 0, .2)'}"
      :close-on-click-overlay="false"
      :safe-area-inset-bottom="false"
      :round="10"
      bg-color="transparent"
      :adjustPosition="false"
    >
      <view class="ko-billing__content ko-basic-box-shadow">
        <view class="ko-billing__top">
          <button
            class="ko-billing__top--close"
            @click="onClose"
          >
            <i class="iconfont icon-guanbi" />
          </button>
        </view>

        <view class="ko-billing__content--wrap">
          <swiper class="ko-billing__swiper" autoplay interval="4000" :style="[{height: swiperHeight + 'px'}]">
            <swiper-item v-for="item of images" :key="item">
              <view class="ko-billing__swiper--item">
                <image
                  class="ko-billing__swiper--item--image"
                  :src="getImageUrl(item)"
                  mode="widthFix"
                  @load="onImageLoad"
                  lazy-load
                />
              </view>
            </swiper-item>
          </swiper>


          <view class="ko-billing__footer" v-if="tis">
            <view class="ko-billing__footer--desc">
              {{ tis }}
            </view>
            <!-- #ifdef MP -->
            <!--<button style="margin-top: 20px;" class="ko-basic-button__card" @click="onJumpRenewal">自助开通</button>-->
            <!-- #endif -->
          </view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<style lang="scss">
.ko-billing {
  &__popup {
    height: 0;
  }

  &__top {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;

    padding-bottom: 10px;

    &--close .iconfont {
      font-size: 26px;
      height: 28px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 20px;
    //background: rgba(0, 0, 0, .9);
    border-radius: 10px;
    padding: 10px;

    //margin-bottom: 10vh;

    &--desc {
      //color: #e9e9eb;
      color: #333;
      font-size: 12px;
      text-align: center;
    }
  }

  // #ifdef MP
  &__content {
    width: 100vw;
    height: 70vh;
    background: #fff;
    padding: 10px;
    display: flex;
    flex-direction: column;

    &--wrap {
      flex: 1;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

  &__swiper {
    width: 100%;

    &--item {
      &--image {
        width: 100%;
        border-radius: 10px;
      }
    }
  }

  // #endif

  // #ifdef H5
  &__content {
    //height: 600px;
  }

  .ko-billing__footer--desc {
    background: #fff;
    padding: 4px 12px;
    border-radius: 6px;
  }

  &__swiper {
    width: 1072.57px;
    height: 600px !important;

    &--item {
      width: 100%;
      height: 600px;

      &--image {
        height: 600px;
        width: 100%;
        border-radius: 10px;
      }
    }
  }

  // #endif
}
</style>
