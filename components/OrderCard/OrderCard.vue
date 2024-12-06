<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";

export default {
  name: "OrderCard",
  components: {UvAvatar, UniCol, BasicCard, UniRow},
  mixins: [mixins],
  props: {
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    operate: {
      type: Array,
      default() {
        return [];
      },
    },
    isHistory: Boolean,
    // 是否是销售
    isSales: Boolean,
    // 是否是采购单
    isPurchase: Boolean,
    // 是否是校验库存单
    isCheckStock: Boolean,
    // 是否是校验财务单
    isCheckFinance: Boolean,

    // 显示完成订单
    isFinished: Boolean,
  },
  methods: {
    onClickOperate(child, item) {
      this.$emit("operate", child.type, item);
    },
  },

  computed: {
    getCustomerName() {
      return (item) => {

        if (this.isSales) {
          return "客户";
        }

        if (this.isPurchase) {
          return "供应商";
        }

        return {
          PRODUCTION: "生产工单",
          SALE: "客户",
          SALE_RETURN: "客户",
          PURCHASE: "供应商",
          PURCHASE_RETURN: "供应商",
        }[item.orderType] || "-";
      };
    },

    isSalesPurchase() {
      return this.isPurchase || this.isSales;
    },
  },
};
</script>

<template>
  <BasicCard custom-class="ko-order-card" @click="$emit('click')">
    <view class="ko-order-card__wrap">
      <view v-if="isFinished && ['FINISHED'].includes(item.status)" class="ko-order-card__finished">
        <view class="ko-order-card__finished--text">
          已完成
        </view>
      </view>

      <UniRow :gutter="20">
        <UniCol :span="24">
          <label class="ko-basic-label">订单编号：</label>
          {{ item.orderCode || "-" }}
        </UniCol>

        <UniCol :span="24" v-if="!isCheckStock">
          <label class="ko-basic-label">订单总金额：</label>
          <text class="ko-basic-money">
            ¥ {{ toYuan(item.totalAmount) }}元
          </text>
        </UniCol>

        <UniCol :span="24" v-if="!isSalesPurchase">
          <label class="ko-basic-label">订单类型：</label>
          <text>
            {{ ORDER_TYPE_ENUMS(item.orderType) }}
          </text>
        </UniCol>

        <UniCol :span="24" v-if="isHistory">
          <label class="ko-basic-label">订单状态：</label>
          {{ ORDER_STATUS_ENUMS(item.status) }}
        </UniCol>

        <UniCol :span="24" v-if="false">
          <label class="ko-basic-label">总金额大写：</label>
          <text class="ko-basic-money">
            {{ toBigMoney(toYuan(item.totalAmount)) }}元
          </text>
        </UniCol>

        <UniCol :span="24" v-if="isCheckStock ? !['PRODUCTION'].includes(item.orderType) : true">
          <view class="ko-basic-label__images-wrap">
            <label class="ko-basic-label">{{ getCustomerName(item) }}：</label>
            <view style="margin-right: 10px;" v-if="GET_FUNC(item, 'customer.logo')">
              <UvAvatar :src="getImageUrl(GET_FUNC(item, 'customer.logo'))" random-bg-color />
            </view>
            <text>{{ GET_FUNC(item, "customer.name") || "-" }}</text>
          </view>
        </UniCol>

        <UniCol :span="24">
          <view class="ko-basic-label__images-wrap">
            <label class="ko-basic-label">{{ `${isSalesPurchase ? "提单" : "下单"}` }}用户：</label>
            <view style="margin-right: 10px;" v-if="GET_FUNC(item, 'user.avatar')">
              <UvAvatar
                :size="38"
                random-bg-color
                :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
              />
            </view>
            <text>{{ GET_FUNC(item, "user.nickName") || "-" }}</text>
          </view>
        </UniCol>

        <UniCol :span="24" v-if="isCheckStock">
          <view class="ko-order-card__details">
            <label class="ko-basic-label">产品详情：</label>
            <view class="ko-order-card__details--wrap">
              <BasicCard v-for="child of item.details">
                <view class="ko-order-card__details--cell">
                  <UvAvatar
                    v-if="GET_FUNC(child, 'images')"
                    :size="64"
                    :src="getImageUrl(GET_FUNC(child, 'images'))"
                    shape="square"
                    random-bg-color
                  />
                  <view style="margin-left: 10px; flex: 1;">
                    <UniRow :gutter="16">
                      <UniCol :span="24">
                        <label class="ko-basic-label">产品名称：</label>
                        <text>{{ child.name }}</text>
                      </UniCol>
                      <UniCol :span="24">
                        <label class="ko-basic-label">数量：</label>
                        <text>{{ child.productQuantity }}</text>
                      </UniCol>
                    </UniRow>
                  </view>
                </view>
              </BasicCard>
            </view>
          </view>
        </UniCol>

        <UniCol :span="24">
          <label class="ko-basic-label">时间：</label>
          {{ item.updateTime || "-" }}
        </UniCol>

        <UniCol :span="24">
          <label class="ko-basic-label">备注：</label>
          {{ item.remark || "-" }}
        </UniCol>
      </UniRow>
      <view class="ko-order-card__operate" v-if="$slots.operate">
        <slot name="operate" :node="item" />
      </view>
      <view class="ko-order-card__operate" v-if="operate.length > 0">
        <button
          class="ko-basic-button__card"
          v-for="(child, index) of operate"
          :key="index"
          @click.stop="onClickOperate(child, item)"
        >
          {{ child.label }}
        </button>
      </view>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-order-card {
  &__wrap {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;
  }

  &__details {
    display: flex;

    &--wrap {
      flex: 1;
    }

    &--cell {
      display: flex;
      align-items: center;
    }
  }

  &__operate {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    padding-top: 8px;

    .ko-basic-button__card {
      margin-left: 8px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  &__finished {
    position: absolute;
    right: 0;
    top: 0;
    color: #fff;
    width: 60px;
    height: 60px;
    overflow: hidden;
    border-radius: 0 6px 0 0;

    &--text {
      position: absolute;
      top: -17px;
      right: -40px;
      background: $ko-primary-color;
      transform: rotate(45deg);
      padding-top: 30px;
      padding-bottom: 5px;
      width: 100px;
      text-align: center;
      font-size: 12px;
    }
  }
}
</style>
