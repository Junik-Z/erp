<script>
import VTabs from "@/product/components/VTabs.vue";
import { _isEqual, _set, getRect } from "@/utils";
import CartList from "./components/CartList.vue";
import mixins from "@/mixins/mixins";
import { getSaleCheckShareIdApi, getSaleDetailApi } from "@/api/erp/sale";
import { PageEnums } from "@/utils/config";
import GoodsMixins from "./components/GoodsMixins";

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

      // this.getInfo(option.id);
    }

    if (this.isShare) this.handlerShare();

    // this.setOrderInfoByKey("isShare", this.isShare);
    // this.setOrderInfoByKey("isEdit", this.isEdit);
  },
  mixins: [mixins, GoodsMixins],
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
        const id = decodeURIComponent(this.option.SHARE_ID);

        await getSaleCheckShareIdApi({id})
          .then(res => {
            this.setOrderForm({id});

            this.$refs.CLRef.form.id = id;

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

    // 获取订单详情
    getInfo(id) {
      getSaleDetailApi({id: id})
        .then(res => {
          const params = res.data;

          params.totalAmount = this.toYuan(params.totalAmount);
          params.otherSupplier = this.GET_FUNC(params, "customer.name");
          this.isAgain = ["FINISHED"].includes(params.status);
          const obj = {};
          params.details?.forEach(item => {
            _set(obj, item.productId, item);
          });

          this.setGoodsObjAsync(obj);

          if (this.$refs.CLRef) {
            setTimeout(() => {
              this.$refs.CLRef.form = params;
            }, 120);
          }

          this.setOrderForm(params);
          this.setOrderInfoByKey("isAgain", this.isAgain);
        });
    },

    onClickItem() {
    },

    // 获取表单顶部高度
    getHeaderRect() {
      getRect(".ko-shopping__header", this)
        .then(res => {
          console.log(res);
          this.hHeight = res?.height || 0;
        });
    },

    // 切换模式
    onSwitch(url) {
      uni.redirectTo({
        url: url + `?id=${this.option.id || ""}&FORM=${this.option.PAGE_TYPE || ""}`,
      });
    },

    // 返回上一级
    onBlack() {
      uni.navigateBack({
        fail() {
          uni.reLaunch({
            url: PageEnums.home,
          });
        },
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
  onUnload() {
    this.reset();
  },
};
</script>

<template>
  <view class="ko-shopping glass" :style="[{'--k-shopping-header-height': hHeight + 'px'}, menuButtonRectStyle]">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    
    <button class="ko-top-black" @click="onBlack">
      <uni-icons size="24" color="#000" type="left" />
    </button>

    <view class="ko-shopping__content" :class="{'no-height': !isShare}">
      <view class="ko-shopping__header" v-if="!isSale">
        <view class="ko-shopping__swiper">
          <swiper class="ko-shopping__swiper--wrap" autoplay="true" duration="1000" interval="3000">
            <swiper-item class="ko-shopping__swiper--item">
              <image
                class="ko-shopping__swiper--image"
                :src="getImageUrl(sys.merchantBgImg)"
                mode="aspectFill"
                lazy-load
              />
            </swiper-item>
          </swiper>

          <view class="ko-shopping__header--wrap">
            <view class="ko-shopping__info">
              <image
                class="ko-shopping__info--image"
                :src="getImageUrl(sys.logo)"
                mode="aspectFill"
                lazy-load
              />
              <view style="padding-left: 10px;">
                <view class="ko-shopping__info--name">{{ GET_SHOP_NAME }}</view>
                <view style="display: flex; align-items: center; font-size: 12px; color: rgba(75, 85, 99, 1);">
                  <view
                    @click.stop="onCopyText(sys.merchantPhone)"
                    style="display: flex; align-items: center; margin-right: 10px"
                    v-if="sys.merchantPhone"
                  >
                    <uni-icons size="14" color="rgba(75, 85, 99, 1)" type="phone-filled" />
                    <text>{{ sys.merchantPhone }}</text>
                  </view>
                  <view
                    @click.stop="onCopyText(sys.merchantAddress)"
                    style="display: flex; align-items: center"
                    v-if="sys.merchantAddress"
                  >
                    <uni-icons size="14" color="rgba(75, 85, 99, 1)" type="location-filled" />
                    <text>{{ sys.merchantAddress }}</text>
                  </view
                  >
                </view>
              </view>
            </view>
            <view class="ko-shopping__info--address glass" v-if="sys.merchantProfile">
              {{ sys.merchantProfile || "" }}
            </view>
          </view>
        </view>
      </view>

      <view class="ko-shopping__goods-list">
        <VTabs
          @click-item="onClickItem"
          ref="VTRef"
          is-shopping
          @switch="onSwitch"
          :show-switch="!(isEdit || isShare)"
        />
      </view>
    </view>

    <CartList ref="CLRef" :is-share="isShare" />
  </view>
</template>

<style scoped lang="scss">
.ko-top-black {
  position: fixed;
  top: var(--m-top);
  height: var(--m-height);
  left: 10px;
  z-index: 999;
  padding: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.ko-shopping {
  --merchants-logo-size: 70px;
  --swiper-height: 160px;
  --footer-left-right-size: 20px;
  --footer-bottom-size: 26px;

  height: 100vh;
  overflow-y: hidden;


  &__content {
    height: 100vh;
    overflow-y: auto;

    &.no-height {
      padding-top: calc(var(--m-height) + var(--m-top) + 10px);
    }

    //&.no-height {
    //  padding-top: 100px;
    //}
  }

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
      //padding: 0 20px;
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.7);
    }
  }

  &__info {
    display: flex;
    align-items: flex-end;
    padding: 0 20px;

    &--address {
      margin-top: 10px;
      font-size: 14px;
      color: rgba(75, 85, 99, 1);
      padding: 12px;
      border-radius: 6px;
      margin-left: 10px;
      margin-right: 10px;
      --tw-text-opacity: 1;
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

  &__goods-list {
    //padding-top: 10px;
    height: 100vh;
  }

}
</style>
