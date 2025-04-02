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

    // 隐藏状态
    isHideStatus: Boolean,

    // 新版UI
    isNew: Boolean,

    // 是否显示订单类型
    showOrderType: Boolean,

    // 是否显示订单电话
    showOrderPhone: Boolean,

    // 是否是生产工单
    isWork: Boolean,

    // 显示自定义状态名称
    isCustomStatusName: Boolean,
    // 自定义的状态名称
    customStatusName: String,
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
          CUSTOMIZED: "供应商",
          PURCHASE_RETURN: "供应商",
        }[item.orderType] || "-";
      };
    },

    isSalesPurchase() {
      return this.isPurchase || this.isSales;
    },

    getUpdateTime() {
      return this.item.updateTime ? this.item.updateTime?.split(" ")[0] : "-";
    },
  },
};
</script>

<template>
  <BasicCard :spacing="spacing" custom-class="ko-order-card" @click="$emit('click')">
    <view class="ko-order-card__wrap">
      <block v-if="isNew">
        <block v-if="showOrderType">
          <view class="ko-order-card__item" style="padding: 0;">
            <view style="flex: 1; text-align: left;">
              <text class="ko-order-card__order-type" :class="[item.orderType]">
                {{ ORDER_TYPE_ENUMS(item.orderType) }}
              </text>
            </view>
          </view>
        </block>

        <view class="ko-order-card__item">
          <view
            style="font-size: 15px; font-weight: bold;"
            @click.stop="onCopyText(item.orderCode)"
          >
            {{ item.orderCode || "-" }}
          </view>

          <view class="ko-order-card__status" v-if="!isHideStatus" :class="[item.status]">
            <block v-if="isCustomStatusName && customStatusName">
              {{ customStatusName }}
            </block>
            <block v-else-if="isWork">
              {{ PRODUCE_STATUS_ENUMS(item.status) }}
            </block>
            <block v-else-if="!isFinance">
              {{ ORDER_STATUS_ENUMS(item.status) }}
            </block>
            <block v-else>
              {{ FINANCE_ORDER_STATUS_ENUMS(item.status) }}
            </block>
          </view>
        </view>

        <view class="ko-order-card__item">
          <view v-if="false" style="font-weight: bold;">
            总计
          </view>
          <view class="ko-basic-money">
            ¥ {{ toYuan(item.totalAmount) }}
          </view>
        </view>

        <view class="ko-order-card__item">
          <view style="display: flex; align-items: center;">
            <uni-icons type="calendar" />
            <text style="padding-left: 4px;">
              {{ getUpdateTime }}
            </text>
          </view>
          <view
            v-if="item.customer && (isCheckStock ? !['PRODUCTION', 'CHECK_IN'].includes(item.orderType) : !['CHECK_IN'].includes(item.orderType))"
          >
            <block v-if="isLogistics">
              <view class="ko-basic-label__images-wrap">
                <view style="margin-right: 10px;" @click.stop>
                  <UvAvatar
                    :size="28"
                    :font-size="12"
                    :text="GET_FUNC(item, 'logistics.name') || ''"
                    :src="getImageUrl(GET_FUNC(item, 'logistics.logo'))"
                    random-bg-color
                  />
                </view>
                <text>{{ GET_FUNC(item, "logistics.name") || "-" }}</text>
              </view>
            </block>
            <block v-else>
              <view class="ko-basic-label__images-wrap">
                <view style="margin-right: 10px;" @click.stop>
                  <UvAvatar
                    :size="28"
                    :text="GET_FUNC(item, 'customer.name') || ''"
                    :src="getImageUrl(GET_FUNC(item, 'customer.logo'))"
                    random-bg-color
                    :font-size="12"
                  />
                </view>
                <text>{{ GET_FUNC(item, "customer.name") || "-" }}</text>
              </view>
            </block>
          </view>
        </view>

        <view class="border-top"></view>

        <block v-if="isCheckStock">
          <view
            class="ko-order-card__item"
            v-for="child of item.details"
            :key="child.id"
          >
            <view style="display:flex; align-items: center;">
              <UvAvatar
                v-if="GET_FUNC(child, 'images')"
                :size="28"
                :src="getImageUrl(GET_FUNC(child, 'images'))"
                shape="square"
                random-bg-color
                :font-size="12"
              />
              {{ child.name }}
            </view>
            <view>x{{ child.productQuantity }}</view>
          </view>

          <view class="border-top" style="margin-left: 10px; margin-right: 10px;"></view>
        </block>

        <view class="ko-order-card__item" v-if="isLogistics && item.logisticsNo">
          <view>
            <label class="ko-basic-label" style="margin-right: 6px;">
              <uni-icons type="flag" />
            </label>
            {{ item.logisticsNo || "-" }}
          </view>
        </view>

        <view class="ko-order-card__item" v-if="showOrderPhone && item.orderPhone">
          <view>
            <label class="ko-basic-label" style="margin-right: 6px;">
              <uni-icons type="phone" />
            </label>
            {{ item.orderPhone || "-" }}
          </view>
        </view>

        <view class="ko-order-card__item" v-if="item.orderAddress">
          <view>
            <label class="ko-basic-label" style="margin-right: 6px;">
              <uni-icons type="location" />
            </label>
            {{ item.orderAddress || "-" }}
          </view>
        </view>

        <view class="ko-order-card__item" v-if="item.remark">
          <view>
            <label class="ko-basic-label" style="margin-right: 6px;">
              <uni-icons type="chat" />
            </label>
            {{ item.remark || "-" }}
          </view>
        </view>

        <!--<view class="border-top"></view>-->

        <view class="ko-order-card__item" style="margin-top: 6px;">
          <view style="display: flex; align-items: center;">
            <block v-if="GET_FUNC(item, 'user.nickName') || GET_FUNC(item, 'user.avatar')">
              <view style="margin-right: 10px;" @click.stop>
                <UvAvatar
                  :size="28"
                  random-bg-color
                  :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
                  :text="GET_FUNC(item, 'user.nickName') || ''"
                  :font-size="12"
                />
              </view>
              <text v-if="GET_FUNC(item, 'user.nickName')">{{ GET_FUNC(item, "user.nickName") }}</text>
            </block>
          </view>
          <view>
            <view style="padding-top: 0;" class="ko-order-card__operate" v-if="$slots.operate">
              <slot name="operate" :node="item" />
            </view>
          </view>
        </view>
      </block>

      <block v-else>
        <view class="ko-order-card__finished" v-if="!isHideStatus">
          <view class="ko-order-card__finished--text" v-if="!isFinance">
            {{ ORDER_STATUS_ENUMS(item.status) }}
          </view>
          <view class="ko-order-card__finished--text" v-else>
            {{ FINANCE_ORDER_STATUS_ENUMS(item.status) }}
          </view>
        </view>

        <UniRow :gutter="10">
          <UniCol :span="24">
            <label class="ko-basic-label">编号：</label>
            {{ item.orderCode || "-" }}
          </UniCol>

          <UniCol :span="24" v-if="!isCheckStock && !isLogistics">
            <label class="ko-basic-label">金额：</label>
            <text class="ko-basic-money">
              {{ toYuan(item.totalAmount) }}元
            </text>
          </UniCol>

          <UniCol :span="24" v-if="!isSalesPurchase">
            <label class="ko-basic-label">类型：</label>
            <text class="ko-order-card__order-type" :class="[item.orderType]">
              {{ ORDER_TYPE_ENUMS(item.orderType) }}
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
                <view style="margin-right: 10px;" @click.stop>
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
            <label class="ko-basic-label">日期：</label>
            {{ item.updateTime || "-" }}
          </UniCol>

          <UniCol :span="24">
            <label class="ko-basic-label">地址：</label>
            {{ item.orderAddress || "-" }}
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
      </block>
    </view>
  </BasicCard>
</template>

<style lang="scss">
.border-top {
  height: 1px;
  //background: #e9e9eb;
  margin: 6px;
}

.ko-order-card {

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }

  &__status {
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 3px;
    font-weight: bold;

    &.CREATED {
      background: #fef3c7;
      color: #d97706;
    }

    &.FINISHED {
      background: #dcfce7;
      color: #16a34a;
    }

    &.CANCELLED {
      background: #fee2e2;
      color: #dc2626;
    }

    &.APPLY_MATERIAL {
      background: #e0f2fe;
      color: #0284c7;
    }
  }


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
    font-size: 10px;

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
