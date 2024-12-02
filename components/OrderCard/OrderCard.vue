<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "OrderCard",
  components: {UniCol, BasicCard, UniRow},
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
          <label class="ko-basic-label">总金额大写：</label>
          <text class="ko-basic-money">
            {{ toBigMoney(toYuan(item.totalAmount)) }}元
          </text>
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
