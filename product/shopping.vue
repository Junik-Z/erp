<script>
import VTabs from "@/product/components/VTabs.vue";
import { _isEqual, getRect } from "@/utils";
import CartList from "./components/CartList.vue";
import mixins from "@/mixins/mixins";
import { getSaleCheckShareIdApi } from "@/api/erp/sale";
import { PageEnums } from "@/utils/config";

export default {
  name: "shopping",
  components: {VTabs, CartList},
  data() {
    return {
      hHeight: 0,
      // 来之销售页面
      isSale: false,
      // 编辑
      isEdit: false,
      option: {},
      isShare: false,

      isClient: false,
    };
  },
  onLoad(option) {
    this.option = option;
    this.isSale = _isEqual(option.PAGE_TYPE, "SALE");
    // 分享
    this.isShare = _isEqual(option.PAGE_TYPE, "ADDED_SALE");

    this.isEdit = !!option.id;

    if (this.isEdit) {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.CLRef?.getInfo(option.id);
        });
      }, 200);
    }

    if (this.isShare) this.handlerShare();
  },
  mixins: [mixins],
  methods: {
    async handlerShare() {
      await this.onLogInAgain(this.option)
        .finally(() => {
          setTimeout(() => {
            if (this.$refs.CLRef) {
              this.$refs.CLRef.getBindInfo();
              this.$refs.CLRef.updateFees();
            }
            this.$refs.VTRef && this.$refs.VTRef.reset();
          }, 10);
        });

      if (this.option.SHARE_ID) {
        await getSaleCheckShareIdApi({id: decodeURIComponent(this.option.SHARE_ID)})
          .then(res => {
            this.$refs.CLRef.form.id = decodeURIComponent(this.option.SHARE_ID);

            if (res.data) {
              uni.redirectTo({
                url: PageEnums.saleClientAddedBack,
                fail() {
                  uni.navigateBack();
                },
              });
            }
          });
      }
    },

    onClickItem() {
    },

    getHeaderRect() {
      getRect(".ko-shopping__header", this)
        .then(res => {
          console.log(res);
          this.hHeight = res?.height || 0;
        });
    },

    onSwitch(url) {
      uni.redirectTo({
        url: url + `?id=${this.option.id || ""}&FORM=${this.option.PAGE_TYPE}`,
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getHeaderRect();
    });
  },

  computed: {
    sys() {
      return this.GET_CONFIG_INFO || {};
    },
  },
};
</script>

<template>
  <view class="ko-shopping" :style="[{'--k-shopping-header-height': hHeight + 'px'}]">
    <view class="ko-shopping__header" v-if="!isSale">
      <view class="ko-shopping__swiper">
        <swiper class="ko-shopping__swiper--wrap" autoplay="true" duration="1000" interval="3000">
          <swiper-item class="ko-shopping__swiper--item">
            <image
              class="ko-shopping__swiper--image"
              :src="getImageUrl(sys.merchantBgImg)"
              mode="aspectFill"
            />
          </swiper-item>
        </swiper>

        <view class="ko-shopping__header--wrap">
          <view class="ko-shopping__info">
            <image
              class="ko-shopping__info--image"
              :src="getImageUrl(sys.logo)"
              mode="aspectFill"
            />
            <view style="padding-left: 10px;">
              <view class="ko-shopping__info--name">{{ GET_SHOP_NAME }}</view>
              <view style="display: flex; align-items: center; font-size: 10px; color: #8f939c;">
                <view style="display: flex; align-items: center; margin-right: 10px" v-if="sys.merchantPhone">
                  <uni-icons size="12" color="#8f939c" type="phone-filled" />
                  <text>{{ sys.merchantPhone }}</text>
                </view>
                <view style="display: flex; align-items: center" v-if="sys.merchantAddress">
                  <uni-icons size="12" color="#8f939c" type="location-filled" />
                  <text>{{ sys.merchantAddress }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="ko-shopping__info--address" v-if="sys.merchantProfile">
            {{ sys.merchantProfile || '' }}
          </view>
        </view>
      </view>
    </view>

    <view class="ko-shopping__wrap">
      <VTabs
        @click-item="onClickItem"
        ref="VTRef"
        is-shopping
        @switch="onSwitch"
        :show-switch="!(isEdit || isShare)"
      />
    </view>

    <view class="ko-shopping__footer">
      <CartList ref="CLRef" :is-share="isShare" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-shopping {
  --merchants-logo-size: 70px;
  --swiper-height: 100px;
  --footer-left-right-size: 20px;
  --footer-bottom-size: 26px;

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

  &__footer {
    position: fixed;
    z-index: 99;
    bottom: var(--footer-bottom-size);
    left: var(--footer-left-right-size);
    right: var(--footer-left-right-size);
  }
}
</style>
