<script>
import mixins from "@/mixins/mixins";
import GoodsMixins from "./GoodsMixins";
import GoodsCard from "./GoodsCard.vue";
import OrderInfo from "./OrderInfo.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { _deepCopy, _get, _set, _toFinite, CustomToast } from "@/utils";
import { addedSaleApi, getSaleDetailApi, reOrderSaleApi, updateSaleApi } from "@/api/erp/sale";
import { PageEnums } from "@/utils/config";

export default {
  name: "CartList",
  mixins: [mixins, GoodsMixins],
  props: {
    isShare: Boolean,
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
    };
  },
  components: {OrderInfo, GoodsCard, UniSection},
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
          this.isAgain = ["FINISHED"].includes(params.status);

          const obj = {};

          params.details?.forEach(item => {
            _set(obj, item.productId, item);
          });

          this.setGoodsObjAsync(obj);

          this.$refs.FormRef.form = params;

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
    },

    onSubmit() {
      if (!this.visible) {
        this.visible = true;
        return false
      }

      this.$refs.FormRef.validate().then(async (valid) => {
        if (!valid) {
          this.getTotalAmount();

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
                success: () => {
                  if (this.isClient && !this.isNormal) {
                    uni.$emit("$__get_all_info__");

                    uni.redirectTo({
                      url: PageEnums.saleClientAddedBack,
                      fail() {
                        uni.navigateBack();
                      },
                    });
                  } else {
                    uni.navigateBack();
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

    getBindInfo() {
      this.$refs.FormRef.getBindInfo();
    },

    // 总金额
    onChange(event) {
      const val = _toFinite(event.detail.value);

      if (isNaN(val)) this.form.totalAmount = 0;
      else this.form.totalAmount = val;
    },

    // 更新其它费用
    updateFees() {
      this.$refs.FormRef.updateFees()
    }
  },
  mounted() {
    this.form.purchaserId = this.GET_USER_INFO?.userId;
  },
  computed: {},
};
</script>

<template>
  <view class="ko-cart-list">
    <view class="ko-cart-list__wrap">
      <view class="ko-cart-list__amount">
        <text>¥</text>
        <input @click.stop type="digit" :value="form.totalAmount || 0" @input="onChange" :disabled="isShare" />
      </view>

      <view class="ko-cart-list__settlement">
        <button
          class="ko-basic-button__card"
          @click.stop="onSubmit"
          :loading="loading"
          :disabled="loading"
        >
          {{ visible ? "开单" : "结算" }}
        </button>
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

          <view class="ko-cart-list__order">
            <OrderInfo ref="FormRef" @change="onUpdateForm" :is-edit="isEdit" :is-share="isShare" />
          </view>
        </view>
      </scroll-view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-cart-list {
  width: 100%;

  --s-height: 44px;

  &__wrap {
    position: relative;
    z-index: 999999;
    height: var(--s-height);
    width: 100%;
    border-radius: 100px;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(15px);
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__amount {
    padding-left: 16px;
    display: flex;
    align-items: center;
    height: var(--s-height);

    input {
      height: var(--s-height);
      width: 40%;
    }
  }

  &__settlement {
    width: 100px;
    height: 100%;

    .ko-basic-button__card {
      height: 100%;
      border-radius: 0 100px 100px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      padding-right: 16px;
    }
  }

  &__item {
    margin-bottom: 10px;

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

  &__content {
    padding: 10px 10px 120px;
  }
}
</style>
