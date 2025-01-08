<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import node from "@/uni_modules/uview-ui/components/u-parse/node/node.vue";

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
    // 是否是财务模块
    isFinance: Boolean,
    // 是否是配送模块
    isLogistics: Boolean,

    spacing: Number,
  },
  methods: {
    onClickOperate(child, item) {
      this.$emit("operate", child.type, item);
    },
  },

  computed: {
    node() {
      return node;
    },
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
  <BasicCard :spacing="spacing" custom-class="ko-order-card" @click="$emit('click')">
    <view class="ko-order-card__wrap">
      <view class="ko-order-card__finished">
        <view class="ko-order-card__finished--text" v-if="!isFinance">
          {{ ORDER_STATUS_ENUMS(item.status) }}
        </view>
        <view class="ko-order-card__finished--text" v-else>
          {{ FINANCE_ORDER_STATUS_ENUMS(item.status) }}
        </view>
      </view>
      <UniRow :gutter="10">
        <UniCol :span="24">
          <label class="ko-basic-label">订单编号：</label>
          {{ item.orderCode || "-" }}
        </UniCol>

        <UniCol :span="24" v-if="!isCheckStock && !isLogistics && (item.totalAmount && item.totalAmount !== 0)">
          <label class="ko-basic-label">订单总金额：</label>
          <text class="ko-basic-money">
            {{ toYuan(item.totalAmount) }}元
          </text>
        </UniCol>

        <UniCol :span="24" v-if="!isSalesPurchase">
          <label class="ko-basic-label">订单类型：</label>
          <text class="ko-order-card__order-type" :class="[item.orderType]">
            {{ ORDER_TYPE_ENUMS(item.orderType) }}
          </text>
        </UniCol>

        <UniCol :span="24" v-if="false">
          <label class="ko-basic-label">总金额大写：</label>
          <text class="ko-basic-money">
            {{ toBigMoney(toYuan(item.totalAmount)) }}元
          </text>
        </UniCol>

        <block v-if="!isLogistics">
          <UniCol
            :span="24"
            v-if="item.customer && (isCheckStock ? !['PRODUCTION', 'CHECK_IN'].includes(item.orderType) : !['CHECK_IN'].includes(item.orderType))"
          >
            <view class="ko-basic-label__images-wrap">
              <label class="ko-basic-label">{{ getCustomerName(item) }}：</label>
              <view style="margin-right: 10px;" @click.stop>
                <UvAvatar
                  :size="38"
                  :text="GET_FUNC(item, 'customer.name') || ''"
                  :src="getImageUrl(GET_FUNC(item, 'customer.logo'))"
                  random-bg-color
                />
              </view>
              <text>{{ GET_FUNC(item, "customer.name") || "-" }}</text>
            </view>
          </UniCol>

          <UniCol :span="24">
            <view class="ko-basic-label__images-wrap">
              <label class="ko-basic-label">{{ `${isSalesPurchase ? "提单" : "下单"}` }}用户：</label>
              <view style="margin-right: 10px;"  @click.stop>
                <UvAvatar
                  :size="38"
                  random-bg-color
                  :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
                  :text="GET_FUNC(item, 'user.nickName') || ''"
                />
              </view>
              <text>{{ GET_FUNC(item, "user.nickName") || "-" }}</text>
            </view>
          </UniCol>

          <UniCol :span="24" v-if="isCheckStock">
            <view class="ko-order-card__details">
              <label class="ko-basic-label">产品详情：</label>
              <view class="ko-order-card__details--wrap">
                <BasicCard v-for="child of item.details" :key="child.id">
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
        </block>

        <block v-if="isLogistics">
          <UniCol :span="24">
            <view class="ko-basic-label__images-wrap">
              <label class="ko-basic-label">物流商：</label>
              <view style="margin-right: 10px;">
                <UvAvatar
                  :size="38"
                  :text="GET_FUNC(item, 'logistics.name') || ''"
                  :src="getImageUrl(GET_FUNC(item, 'logistics.logo'))"
                  random-bg-color
                />
              </view>
              <text>{{ GET_FUNC(item, "logistics.name") || "-" }}</text>
            </view>
          </UniCol>

          <UniCol :span="24">
            <label class="ko-basic-label">物流单号：</label>
            <text>
              {{ item.logisticsNo || "-" }}
            </text>
          </UniCol>
          <UniCol :span="24">
            <label class="ko-basic-label">联系电话：</label>
            <text>
              {{ item.orderPhone || "-" }}
            </text>
          </UniCol>
          <UniCol :span="24">
            <label class="ko-basic-label">配送地址：</label>
            <text>
              {{ item.orderAddress || "-" }}
            </text>
          </UniCol>
        </block>

        <UniCol :span="24">
          <label class="ko-basic-label">时间：</label>
          {{ item.updateTime || "-" }}
        </UniCol>

        <UniCol :span="24">
          <label class="ko-basic-label">备注：</label>
          {{ item.remark || "-" }}
        </UniCol>

        <!-- 财务核销 -->
        <block v-if="isCheckFinance && item.proofs && item.proofs.length && false">
          <UniCol :span="24">
            <view style="display: flex; align-items: flex-start;">
              <view style="flex: 1; padding-left: 4px;">
                <UniRow :gutter="4">
                  <UniCol :span="24" v-for="child of item.proofs" :key="child.id">
                    <text class="ko-basic-money">
                      {{ toYuan(child.totalAmount) }}元
                    </text>
                    <text style="padding-left: 10px;">{{ child.updateTime || "-" }}</text>
                  </UniCol>
                </UniRow>
              </view>
            </view>
          </UniCol>
        </block>
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

  &__order-type {
    &.SALE {
      color: #007BFF;
    }

    &.PURCHASE {
      color: #28A745;
    }

    &.SALE_RETURN {
      color: #FFA500;
    }

    &.PURCHASE_RETURN {
      color: #DC3545;
    }

    &.PRODUCTION {
      color: #FFC107;
    }

    &.CHECK_IN {
      color: #800080;
    }
  }
}
</style>
