<script>
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import { PageEnums } from "@/utils/config";
import mixins from "@/mixins/mixins";

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
    };
  },
  mounted() {
    // this.$refs.PRef.open();
  },
  components: {
    BasicPopup,
  },
  methods: {
    open() {
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

  computed: {
    getCncAD() {
      return [
        "/files/down/static/cnc1.png",
        "/files/down/static/cnc2.png",
        "/files/down/static/cnc3.png",
        "/files/down/static/cnc4.png",
        "/files/down/static/cnc5.png",
      ];
    },
  },
};
</script>

<template>
  <view class="ko-billing" :class="[`ko-billing__${type}`]">
    <uv-popup
      mode="center"
      ref="PRef"
      @change="onChange"
      :close-on-click-overlay="false"
      :safe-area-inset-bottom="false"
      :round="10"
      bg-color="transparent"
      :adjustPosition="false"
    >
      <view class="ko-billing__content">
        <view class="ko-billing__top">
          <button
            class="ko-billing__top--close"
            @click="onClose"
          >
            <i class="iconfont icon-guanbi" />
          </button>
        </view>
        <swiper class="ko-billing__swiper" autoplay interval="5000" :style="[{height: swiperHeight + 'px'}]">
          <swiper-item v-for="item of getCncAD" :key="item">
            <view class="ko-billing__swiper--item">
              <image
                class="ko-billing__swiper--item--image"
                :src="getImageUrl(item)"
                mode="widthFix"
                @load="onImageLoad"
              />
            </view>
          </swiper-item>
        </swiper>


        <view class="ko-billing__footer">
          <view style="color:#e9e9eb; font-size: 12px; text-align: center;">
            尊敬的用户，您尚未开通板材加工功能。如需使用，请联系商务进行开通，感谢您的支持！
          </view>
          <!-- #ifdef MP -->
          <!--<button style="margin-top: 20px;" class="ko-basic-button__card" @click="onJumpRenewal">自助开通</button>-->
          <!-- #endif -->
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
    background: rgba(0, 0, 0, .9);
    border-radius: 10px;
    padding: 10px;

    margin-bottom: 10vh;
  }

  &__content {
    width: 98vw;
    padding: 10px;
  }

  // #ifdef MP
  &__swiper {

    &--item {
      //width: 100%;
      //height: 100%;

      &--image {
        //height: 100%;
        width: 100%;
        border-radius: 10px;
      }
    }
  }

  // #endif

  // #ifdef H5
  &__swiper {
    width: 1072.57px;
    height: 600px;

    &--item {
      width: 100%;
      height: 100%;

      &--image {
        height: 100%;
        width: 100%;
        border-radius: 10px;
      }
    }
  }

  // #endif
}
</style>
