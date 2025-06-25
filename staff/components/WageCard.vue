<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { PRICING_METHOD, WAGE_TYPE_ENUMS } from "@/utils/config";
import { _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "WageCard",
  components: {BasicCard},
  mixins: [mixins],
  props: {
    node: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  computed: {
    // 获取计价方式
    getPricingMethod() {
      return key => PRICING_METHOD[key];
    },

    // 获取时间
    getCreateTime() {
      return time => time && time.split(" ")[0] || "";
    },

    getPrice() {
      return ["commission", "priceCommission"].includes(this.node.pricingMethod) ? this.node.price / 10000 : this.toYuan(this.node.price);
    },

    // 获取数量
    getQuantity() {
      return _isEqual("priceCommission", this.node.pricingMethod) ? this.toYuan(this.node.quantity) : this.node.quantity;
    },

    getTypeEnum() {
      return WAGE_TYPE_ENUMS[this.node.type];
    },

    getPricingPrice() {

      const {pricingMethod, amount} = this.node || {};
      if (pricingMethod) {
        if (_isEqual(pricingMethod, "none")) return amount ? `${this.toYuan(Math.abs(amount || 0))}` : "";

        if (_isEqual(pricingMethod, "commission")) return `× ${this.getPrice}`;

        return `${this.getPrice} × ${this.getQuantity}`;
      }

      return "";
    },

    getAmount() {
      const {amount} = this.node || {};
      return amount ? `${this.toYuan(Math.abs(amount || 0))}` : "";
    },
  },
};
</script>

<template>
  <BasicCard :spacing="10">
    <view class="ko-wage-card">
      <!-- 生产结算 -->
      <block v-if="isEqual('ProductionSettlement', node.type)">
        <view class="ko-wage-card__item">
          <view style="font-size: 14px; font-weight: bold;">
            {{ node.name || "-" }}
          </view>

          <view class="ko-wage-card__type" :class="[node.type]">{{ getTypeEnum }}</view>
        </view>

        <view class="ko-wage-card__item">
          <view class="cell">
            <block v-if="node.pricingMethod">
              <uni-icons type="tune" />
              <text style="padding-left: 4px;">
                {{ getPricingMethod(node.pricingMethod) }}
              </text>
            </block>
          </view>

          <view class="cell" v-if="getPricingPrice">
            <text class="ko-basic-money" style="padding-left: 4px;">
              {{ getPricingPrice }}
            </text>
          </view>
        </view>

        <view class="ko-wage-card__item" v-if="getAmount">
          <view class="cell">
            <text class="ko-basic-money" style="padding-left: 4px;">
              ¥ {{ getAmount }}
            </text>
          </view>
        </view>
      </block>

      <!-- 工资/补贴/奖金发放 -->
      <block v-if="isEqual('ClearAnAccount', node.type)">
        <view class="ko-wage-card__item" style="margin-bottom: 0;">
          <view class="cell" v-if="getAmount">
            <text class="ko-basic-money" style="padding-left: 4px;">
              ¥ {{ getAmount }}
            </text>
          </view>

          <view class="ko-wage-card__type" :class="[node.type]">{{ getTypeEnum }}</view>
        </view>
      </block>

      <!-- 补贴/奖金所得 -->
      <block v-if="isEqual('SubsidyAndBonus', node.type)">
        <view class="ko-wage-card__item">
          <view class="cell" v-if="getAmount">
            <text class="ko-basic-money" style="padding-left: 4px;">
              ¥ {{ getAmount }}
            </text>
          </view>

          <view class="ko-wage-card__type" :class="[node.type]">{{ getTypeEnum }}</view>
        </view>
      </block>

      <!-- 取消结算 -->
      <block v-if="isEqual('CancelSettlement', node.type)">
        <view class="ko-wage-card__item" style="margin-bottom: 0;">
          <view class="cell" v-if="getAmount">
            <text class="ko-basic-money" style="padding-left: 4px;">
              ¥ {{ getAmount }}
            </text>
          </view>

          <view class="ko-wage-card__type" :class="[node.type]">{{ getTypeEnum }}</view>
        </view>
      </block>

      <!-- 订单时间 -->
      <view class="ko-wage-card__item">
        <view class="cell">
          <uni-icons type="calendar" />
          <text style="padding-left: 4px;">
            {{ getCreateTime(node.updateTime) }}
          </text>
        </view>
      </view>

      <!-- 操作 -->
      <block v-if="$slots.operate">
        <view class="ko-wage-card__item">
          <view></view>
          <slot name="operate" />
        </view>
      </block>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-wage-card {
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;

    .cell {
      display: flex;
      align-items: center;
    }
  }

  &__type {
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 3px;
    font-weight: bold;

    &.ClearAnAccount {
      background: #fef3c7;
      color: #d97706;
    }

    &.ProductionSettlement {
      background: #dcfce7;
      color: #16a34a;
    }

    &.CancelSettlement {
      background: #fee2e2;
      color: #dc2626;
    }

    &.SubsidyAndBonus {
      background: #e0f2fe;
      color: #0284c7;
    }
  }
}
</style>
