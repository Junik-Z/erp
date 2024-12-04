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
  },
  methods: {
    onClickOperate(child, item) {
      this.$emit("operate", child.type, item);
    },
  },

  computed: {
    getCustomerName() {
      return (item) => {
        return {
          PRODUCTION: "生产工单",
          SALE: "客户",
          SALE_RETURN: "客户",
          PURCHASE: "供应商",
          PURCHASE_RETURN: "供应商",
        }[item.orderType] || "-";
      };
    },
  },
};
</script>

<template>
  <BasicCard custom-class="ko-order-card">
    <view class="ko-order-card__wrap">
      <UniRow gutter="10">
        <UniCol :span="24">
          <label class="ko-basic-label">订单编号：</label>
          {{ item.orderCode || "-" }}
        </UniCol>
        <UniCol :span="24">
          <label class="ko-basic-label">订单总金额：</label>
          <text class="ko-basic-money">
            ¥ {{ toYuan(item.totalAmount) }}元
          </text>
        </UniCol>
        <UniCol :span="24">
          <label class="ko-basic-label">订单类型：</label>
          <text>
            {{ ORDER_TYPE_ENUMS(item.orderType) }}
          </text>
        </UniCol>
        <UniCol :span="24" v-if="false">
          <label class="ko-basic-label">总金额大写：</label>
          <text class="ko-basic-money">
            {{ toBigMoney(toYuan(item.totalAmount)) }}元
          </text>
        </UniCol>
        <UniCol :span="24" v-if="!!GET_FUNC(item, 'customer.name')">

          <view class="ko-basic-label__images-wrap">
            <label class="ko-basic-label">{{ getCustomerName(item) }}：</label>
            <UvAvatar v-if="GET_FUNC(item, 'customer.logo')" :src="getImageUrl(GET_FUNC(item, 'customer.logo'))" />
            <text style="margin-left: 10px;">{{ GET_FUNC(item, "customer.name") }}</text>
          </view>
        </UniCol>
        <UniCol :span="24" v-if="!!GET_FUNC(item, 'user.nickName')">
          <view class="ko-basic-label__images-wrap">
            <label class="ko-basic-label">下单用户：</label>

            <UvAvatar
              :size="38"
              v-if="GET_FUNC(item, 'user.avatar')"
              :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
            />

            <text style="margin-left: 10px">{{ GET_FUNC(item, "user.nickName") }}</text>
          </view>
        </UniCol>
        <UniCol :span="24">
          <label class="ko-basic-label">备注：</label>
          {{ item.remark || "-" }}
        </UniCol>
      </UniRow>
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
}
</style>
