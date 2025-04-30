<script>
import VTabs from "@/product/components/VTabs.vue";
import { getRect } from "@/utils";

export default {
  name: "shopping",
  components: {VTabs},
  data() {
    return {
      hHeight: 180,
    };
  },
  onLoad() {
  },
  methods: {
    onClickItem() {
    },

    getHeaderRect() {
      getRect(".ko-shopping__header", this)
        .then(res => {
          console.log(res);
          this.hHeight = res.height || 180;
        });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getHeaderRect();
    });
  },
};
</script>

<template>
  <view class="ko-shopping" :style="[{'--k-shopping-header-height': hHeight + 'px'}]">
    <view class="ko-shopping__header">
      <view class="ko-shopping__swiper">
        <swiper class="ko-shopping__swiper--wrap" autoplay="true" duration="1000" interval="3000">
          <swiper-item class="ko-shopping__swiper--item">
            <image
              class="ko-shopping__swiper--image"
              src="https://fastly.picsum.photos/id/820/800/600.jpg?hmac=Af_5Es6V0RAWhRjJTasmBe55kzkkPTbgm3ilU4iyTUY"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>

        <view class="ko-shopping__header--wrap">
          <view class="ko-shopping__info">
            <image
              class="ko-shopping__info--image"
              src="https://fastly.picsum.photos/id/820/800/600.jpg?hmac=Af_5Es6V0RAWhRjJTasmBe55kzkkPTbgm3ilU4iyTUY"
              mode="aspectFill"
            />
            <view class="ko-shopping__info--name">食遇记·私房菜</view>
          </view>
          <view class="ko-shopping__info--address">
            拒绝烹制菜，现切现配现炒家常菜，只想好好一份餐品！口味可调可以...
          </view>
        </view>
      </view>
    </view>

    <view class="ko-shopping__wrap">
      <VTabs
        @click-item="onClickItem"
        ref="VTRef"
        is-shopping
      />
    </view>

    <view class="ko-shopping__footer"></view>
  </view>
</template>

<style scoped lang="scss">
.ko-shopping {
  --merchants-logo-size: 70px;
  --swiper-height: 100px;

  display: flex;
  flex-direction: column;
  height: calc(100vh + var(--k-shopping-header-height));

  &__swiper {
    padding-bottom: 10px;

    &--wrap {
      height: var(--swiper-height);
    }

    &--item {
      border-radius: 0 0 10px 10px;
      overflow: hidden;
    }

    &--image {
      width: 100vw;
    }
  }

  &__header {
    &--wrap {
      margin-top: -20px;
      position: relative;
      z-index: 30;
      padding: 0 20px;
      backdrop-filter: blur(6px);
      background-color: rgba(255, 255, 255, 0.02);
    }
  }

  &__info {
    display: flex;
    align-items: flex-end;

    &--address {
      margin-top: 10px;
      font-size: 12px;
      color: #8f939c;
    }

    &--name {
      padding-left: 10px;
      background: linear-gradient(90deg, #ff6b6b, #ff8e53);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 18px;
      font-weight: bold;
    }

    &--image {
      margin-top: -20px;

      width: var(--merchants-logo-size);
      height: var(--merchants-logo-size);
      border-radius: 10px;
      box-shadow: 0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  &__wrap {
    padding-top: 10px;
    flex: 1;
    overflow: hidden;
  }
}
</style>
