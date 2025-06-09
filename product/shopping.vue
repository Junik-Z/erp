<script>
import VTabs from "./components/VTabs.vue";
import { _isEqual, _set, getRect } from "@/utils";
import CartList from "./components/CartList.vue";
import mixins from "@/mixins/mixins";
import { getSaleCheckShareIdApi, getSaleDetailApi } from "@/api/erp/sale";
import { PageEnums } from "@/utils/config";
import GoodsMixins from "../mixins/GoodsMixins";
import reLogin from "@/mixins/re-login";
import PickerStandard from "../components/PickerStandard.vue";

export default {
  name: "shopping",
  components: {PickerStandard, VTabs, CartList},
  data() {
    return {
      hHeight: 0,
      // 来之销售页面
      isSale: false,
      // 编辑
      isEdit: false,
      option: {},
      isShare: false,

      isShowSearch: false,

      // 预览
      isPreview: false,
      // 分享id
      shareId: null,

      // 显示产品列表
      showVTList: false,
    };
  },
  onLoad(option) {
    this.showVTList = false;
    this.option = option;
    this.isSale = _isEqual(option.PAGE_TYPE, "SALE");
    // 分享
    this.isShare = _isEqual(option.PAGE_TYPE, "SALE_SHARE");
    // 预览
    this.isPreview = _isEqual(option.isPreview, "true");

    this.isEdit = !!option.id;

    if (this.isEdit) {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.CLRef?.getInfo(option.id);
        });
      }, 200);

      // this.getInfo(option.id);
    }

    if (this.isShare) {
      this.shareId = decodeURIComponent(this.option.SHARE_ID);
      this.handlerShare();
    }

    setTimeout(() => {
      this.showVTList = true;

      if (option.p_name) {
        setTimeout(() => {
          this.$refs.VTRef.queryList.name = decodeURIComponent(option.p_name);
          this.$refs.VTRef.showSearch = true;
          this.$refs.VTRef.getList(true);
        }, 80);
      }

    }, 200);

    if (!this.isSale && !this.isPreview && !this.isShare) {
      setTimeout(() => {
        this.$refs.CLRef.getBindInfo();
      }, 200);
    }

    // 来自销售的订单
    if (this.isSale) {
      setTimeout(() => {
        this.$refs.CLRef.onUpdateForm({
          supplierId: option.supplierId,
          orderAddress: option.address,
        });
      }, 300);
    }

    // this.setOrderInfoByKey("isShare", this.isShare);
    // this.setOrderInfoByKey("isEdit", this.isEdit);
  },
  mixins: [mixins, GoodsMixins, reLogin],
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
        await getSaleCheckShareIdApi({id: this.shareId})
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

    getList() {
      this.$refs.VTRef && this.$refs.VTRef.reset();
    },

    // 获取订单详情
    getInfo(id) {
      getSaleDetailApi({id: id})
        .then(res => {
          const params = res.data;

          params.totalAmount = this.toYuan(params.totalAmount);
          params.otherSupplier = this.GET_FUNC(params, "customer.name");
          this.isAgain = ["WAIT_PAY"].includes(params.status);
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

    // 点击
    onOperate(item, index) {
      this.$refs.PSRef.open(item, index);
    },

    // 获取表单顶部高度
    getHeaderRect() {
      getRect(".ko-shopping__header", this)
        .then(res => {
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
    shopName() {
      return (this.GET_SHOP_NAME || "").substring(0, 2);
    },
  },
  onUnload() {
    this.reset();
  },
};
</script>

<template>
  <view
    class="ko-shopping glass no-border"
    :style="[{'--k-shopping-header-height': hHeight + 'px'}, menuButtonRectStyle]"
  >
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->

    <button class="ko-top-black" @click="onBlack">
      <uni-icons size="24" color="#000" type="left" />
    </button>

    <view class="ko-shopping__content" :class="{'no-height': isSale && !isPreview }">
      <view class="ko-shopping__header" :class="{' glass no-border': !isShowSearch}" v-if="!isSale">
        <view class="ko-shopping__swiper">
          <swiper
            class="ko-shopping__swiper--wrap"
            :class="{'not-bg-img': !sys.merchantBgImg}"
            autoplay="true"
            duration="1000"
            interval="3000"
          >
            <swiper-item class="ko-shopping__swiper--item">
              <image
                class="ko-shopping__swiper--image"
                :src="getImageUrl(sys.merchantBgImg || 'https://erp.kuaouyun.cn/api/files/down/static/store_pg.png')"
                mode="widthFix"
                lazy-load
              />
            </swiper-item>
          </swiper>

          <view
            class="ko-shopping__header--wrap"
            :class="{'no-bg': !sys.merchantBgImg, 'merchantProfile': sys.merchantProfile}"
          >
            <view class="ko-shopping__info">
              <view class="ko-shopping__info--image" :class="{'no-logo': !sys.logo}">
                <image
                  v-if="sys.logo"
                  class="image"
                  :src="getImageUrl(sys.logo)"
                  mode="aspectFill"
                  lazy-load
                />
                <text v-else class="ko-shopping__info--name">
                  {{ shopName }}
                </text>
              </view>
              <view style="padding-left: 10px;">
                <view class="ko-shopping__info--name">{{ GET_SHOP_NAME }}</view>
                <view style="display: flex; align-items: center; font-size: 12px; color: #000;">
                  <view
                    @click.stop="onCopyText(sys.merchantPhone)"
                    style="display: flex; align-items: center; margin-right: 10px"
                    v-if="sys.merchantPhone"
                  >
                    <uni-icons size="14" color="#000" type="phone-filled" />
                    <text>{{ sys.merchantPhone }}</text>
                  </view>
                  <view
                    @click.stop="onCopyText(sys.merchantAddress)"
                    style="display: flex; align-items: center"
                    v-if="sys.merchantAddress"
                  >
                    <uni-icons size="14" color="#000" type="location-filled" />
                    <text>{{ sys.merchantAddress }}</text>
                  </view>
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
          v-if="showVTList"
          @operate="onOperate"
          ref="VTRef"
          is-shopping
          @switch="onSwitch"
          :show-switch="isSale && !isEdit"
          :is-show-search.sync="isShowSearch"
          :share-id="shareId"
        />
      </view>
    </view>

    <CartList ref="CLRef" :is-share="isShare" :is-sale="isSale" />

    <!-- 选择规则 -->
    <PickerStandard ref="PSRef" />
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
  --swiper-height: 198px;
  --footer-left-right-size: 20px;
  --footer-bottom-size: 26px;

  background: rgba(255, 255, 255, 0.25);
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
    //padding-bottom: 10px;
    position: relative;

    &--wrap {
      height: var(--swiper-height);
      /* &.not-bg-img {
         height: calc(var(--m-top) + (var(--m-height) * 2) + 10px);
       }*/
    }

    &--item {
      border-radius: 0 0 10px 10px;
      overflow: hidden;
      background: #ECECEC;
    }

    &--image {
      width: 100vw;
    }
  }

  &__header {
    //background-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, .8));

    &--wrap {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      //padding-bottom: 16px;
      //z-index: 55;
      //position: absolute;
      //top: calc(var(--m-top) + var(--m-height) + 16px);
      //left: -2px;
      //right: -2px;

      margin-top: -60px;
      margin-left: -2px;

      &.merchantProfile {
        padding-bottom: 1px;
      }
    }
  }

  &__info {
    display: flex;
    align-items: flex-end;
    padding: 0 20px 10px;

    &--address {
      margin: 10px;
      font-size: 14px;
      color: rgba(75, 85, 99, 1);
      padding: 12px;
      border-radius: 6px;
      --tw-text-opacity: 1;
    }

    &--name {
      //background: linear-gradient(90deg, #ff6b6b, #ff8e53);
      //-webkit-background-clip: text;
      //-webkit-text-fill-color: transparent;
      color: #000;
      font-size: 18px;
      font-weight: bold;
    }

    &--image {
      margin-top: -20px;
      background-color: rgba(255, 255, 255, 1);
      width: var(--merchants-logo-size);
      height: var(--merchants-logo-size);
      border-radius: 10px;
      box-shadow: 0 0 #0000, 0 0 #0000, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

      .image {
        width: 100%;
        border-radius: 10px;
        height: 100%;
      }

      &.no-logo {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  &__goods-list {
    //padding-top: 10px;
    height: 100vh;
  }

}
</style>
