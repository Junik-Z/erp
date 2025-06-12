<script>
import mixins from "@/mixins/mixins";
import GoodsMixins from "../../mixins/GoodsMixins";
import GoodsCard from "../../components/GoodsCard.vue";
import OrderInfo from "./OrderInfo.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _deepCopy, _get, _set, _toFinite, CustomToast } from "@/utils";
import { addedSaleApi, getSaleDetailApi, reOrderSaleApi, updateSaleApi } from "@/api/erp/sale";
import { PageEnums } from "@/utils/config";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import SendMsg from "@/components/SendMsg.vue";
import { getPaySettingApi } from "@/api/admin";

export default {
  name: "CartList",
  mixins: [mixins, GoodsMixins],
  props: {
    // 分享
    isShare: Boolean,
    // 销售
    isSale: Boolean,

    // 是否显示返回
    isShowBack: Boolean,
    // 来自供应链
    formHypermarket: Boolean,
    // 来自供应链的商户
    fScene: String,
  },
  data() {
    return {
      visible: false,
      goods: {},
      form: {
        "orderCode": "",
        "supplierId": "",
        "purchaserId": "",
        "otherSupplier": "",
        "otherSupplierPhone": "",
        "totalAmount": 0,
        "remark": "",
        "orderAddress": "",
        "orderPhone": "",
        "details": [],
        fees: {},
      },

      loading: false,
      isEdit: false,
      isAgain: false,

      iVisible: false,

      // 支付枚举
      paySetting: "",
    };
  },
  components: {SendMsg, UniIcons, BasicPopup, OrderInfo, GoodsCard, UniSection},
  created() {
  },
  watch: {
    sTotalPrice: {
      handler() {
        this.getTotalAmount();
      },
      immediate: true,
    },
  },
  methods: {
    getInfo(id) {
      getSaleDetailApi({id: id})
        .then(res => {
          this.isEdit = true;
          const params = res.data;
          params.totalAmount = this.toYuan(params.totalAmount);
          params.otherSupplier = this.GET_FUNC(params, "customer.name");
          this.isAgain = ["WAIT_PAY"].includes(params.status);

          const obj = {};
          params.details?.forEach(item => {
            _set(obj, item.productId, item);
          });
          this.setGoodsObjAsync(obj);

          this.form = params;
        });
    },

    // 更新表单数据
    onUpdateForm(form) {
      this.form = {...this.form, ...form};
    },

    // 获取总金额
    getTotalAmount() {
      this.form.totalAmount = this.toYuan(this.sTotalPrice || 0);
      this.setOrderForm({totalAmount: this.toYuan(this.sTotalPrice || 0)});
    },

    // 提交订单
    onSubmit() {
      if (!this.visible && !this.iVisible) {
        this.iVisible = false;
        this.visible = true;
        return false;
      }

      if (!this.iVisible) {
        this.visible = false;
        this.iVisible = true;

        setTimeout(() => {
          this.$refs.FormRef.form = _deepCopy(this.form);
          if (!this.isSale) this.$refs.FormRef.getBindInfo();

          // 来自供应链页面
          if (this.formHypermarket) {
            this.onLogInAgain({scene: this.fScene}, true)
              .then(res => {
                this.getPayStatus();
              });
          }
        }, 100);
        return false;
      }

      this.$refs.FormRef.validate()
        .then(async (valid) => {
          if (!valid) {
            const params = _deepCopy(this.form);
            params.purchaserId = params.purchaserId || this.GET_USER_INFO?.userId;
            params.details = this.goodsList;

            await this.isTxFillPrices();
            params.totalAmount = this.toFen(params.totalAmount);

            this.loading = true;

            const Func = this.isAgain ? reOrderSaleApi : (this.isEdit ? updateSaleApi : addedSaleApi);

            Func(params)
              .then((res) => {
                this.resetGoods();
                this.visible = false;

                CustomToast({
                  title: `${this.isEdit ? "修改" : "新增"}成功`,
                  success: async () => {

                    if (!this.isShowBack) {
                      this.visible = false;
                      this.iVisible = false;
                      return false;
                    }

                    if (this.isSale && this.isPerm("SEND_INTERNAL_MESSAGE")) {
                      await this.$refs.SMRef.open();
                    }

                    if (this.isShare) {
                      uni.$emit("$__get_all_info__");
                      uni.redirectTo({
                        url: PageEnums.saleClientAddedBack,
                        fail() {
                          uni.navigateBack();
                        },
                      });
                    } else {
                      uni.navigateBack({
                        fail() {
                          uni.redirectTo({
                            url: PageEnums.saleClientAddedBack,
                            fail() {
                              uni.redirectTo({url: PageEnums.home});
                            },
                          });
                        },
                      });
                    }
                  },
                });

                uni.setStorageSync("TENP_ORDER_INFO", res.data);
              })
              .finally(() => {
                this.loading = false;
              });
          } else {
            uni.showToast({
              title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
              icon: "none",
            });
          }
        });
    },

    // 获取绑定的客户列表
    getBindInfo() {
      this.$refs.FormRef.getBindInfo();
    },

    // 总金额
    onChange(event) {
      const val = _toFinite(event.detail.value);

      let value = 0;
      if (isNaN(val)) value = 0;
      else value = val;

      this.setOrderForm({totalAmount: value});

      this.form.totalAmount = value;
    },

    // 更新其它费用
    updateFees() {
      this.$refs.FormRef.updateFees();
    },

    // 验证手机号码
    getrealtimephonenumber(event) {
      console.log(event.detail);
      this.form.code = event.detail.code;
      
      this.onSubmit();
    },

    // 获取店铺支付状态
    getPayStatus() {
      getPaySettingApi()
        .then(res => {
          this.paySetting = res.data;
        });
    },
  },
  mounted() {
    this.form.purchaserId = this.GET_USER_INFO?.userId;
  },
  computed: {
    tAmount() {
      return _get(this.getOrderInfo, "form.totalAmount") || 0;
    },
  },
};
</script>

<template>
  <view class="ko-cart-list">
    <view class="ko-cart-list__wrap glass">
      <view class="ko-cart-list__cart">
        <button class="ko-basic-button__card" @click.stop="visible = true; iVisible = false;">
          <uni-icons type="cart-filled" size="32" color="#fff" />
        </button>
        <text class="ko-basic-button__badge" v-if="goodsList.length">
          {{ goodsList.length }}
        </text>
      </view>

      <view class="ko-cart-list__amount">
        <text style="font-size: 14px;">¥</text>
        <input @click.stop type="digit" :value="tAmount || 0" @input="onChange" :disabled="isShare" />
      </view>

      <view class="ko-cart-list__settlement">
        <button
          class="ko-basic-button__card"
          @click.stop="onSubmit"
          :disabled="loading || !goodsList.length"
          v-if="!visible && !iVisible"
        >
          购物车
        </button>

        <button
          class="ko-basic-button__card"
          @click.stop="onSubmit"
          :disabled="loading || !goodsList.length"
          v-else-if="!iVisible"
        >
          去结算
        </button>

        <block v-else>
          <button
            class="ko-basic-button__card"
            @click.stop="onSubmit"
            :loading="loading"
            :disabled="loading || !goodsList.length"
            v-if="isEqual(paySetting, 'NONE') || !paySetting"
          >
            立即下单
          </button>

          <button
            class="ko-basic-button__card"
            v-else-if="isEqual(paySetting, 'PHONE')"
            open-type="getRealtimePhoneNumber"
            @getrealtimephonenumber="getrealtimephonenumber"
          >
            立即下单
          </button>
        </block>
      </view>
    </view>

    <BasicPopup :visible.sync="visible" title="购物车" type="bottom" no-safe-bottom no-footer-padding>
      <scroll-view scroll-y="true" class="ko-cart-list__popup">
        <view class="ko-cart-list__content">
          <UniSection title="商品信息" type="line">
            <view class="ko-cart-list__item" v-for="(item, key) of sGoods" :key="key">
              <GoodsCard :node="item" type="goods" />
            </view>
            <view class="ko-cart-list__item--tis" v-if="!goodsList.length">
              您还未选择商品
            </view>
          </UniSection>
        </view>
      </scroll-view>
    </BasicPopup>

    <BasicPopup :visible.sync="iVisible" title="配送信息" type="bottom" no-safe-bottom no-footer-padding>
      <view class="ko-cart-list__popup">
        <view class="ko-cart-list__order">
          <OrderInfo
            ref="FormRef"
            @change="onUpdateForm"
            :is-edit="isEdit"
            :is-share="isShare"
            :value="form"
            :is-sale="isSale"
          />
        </view>
      </view>
    </BasicPopup>

    <SendMsg ref="SMRef" :z-index="9999999" />
  </view>
</template>

<style scoped lang="scss">
.ko-cart-list {
  width: 100%;

  --s-height: 84px;

  &__wrap {
    position: fixed;
    z-index: 999999;
    height: var(--s-height);
    width: 100%;
    bottom: 0;
    left: 0;
    right: 0;
    //border-radius: 100px;
    //box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
    //backdrop-filter: blur(15px);
    //background-color: rgba(0, 0, 0, 0.7);
    //color: #fff;
    padding: 10px 20px 24px;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__cart {
    position: relative;

    .ko-basic-button__card {
      height: 48px;
      width: 48px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ko-basic-button__badge {
      position: absolute;
      top: -6px;
      right: -6px;
      border-radius: 99px;
      font-size: 12px;
      color: #fff;
      background: #F56C6C;
      line-height: 14px;
      padding: 3px;
      min-width: 20px;
      text-align: center;
    }
  }

  &__amount {
    padding-left: 10px;
    display: flex;
    align-items: flex-end;

    input {
      width: 30%;
      font-size: 18px;
    }
  }

  &__settlement {
    display: flex;
    align-items: center;

    .ko-basic-button__card {
      width: 100px;
      //height: 100%;
      //border-radius: 0 100px 100px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      //padding-right: 16px;
      height: 40px;
    }

    wx-button[disabled]:not([type]),
    wx-button[disabled][type=default] {
      background-color: rgba(41, 121, 255, 0.6);
      color: rgba(255, 255, 255, .9);
    }
  }

  &__item {
    margin-bottom: 20px;

    &--tis {
      text-align: center;
      font-size: 12px;
      color: #c7c9ce;
    }
  }

  &__popup {
    height: 80vh;
    width: 100vw;
  }

  &__order {
    padding-right: 10px;
  }

  &__content {
    padding: 10px 10px 120px;
  }
}
</style>
