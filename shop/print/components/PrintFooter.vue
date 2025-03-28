<script>
import mixins from "@/mixins/mixins";

export default {
  name: "PrintFooter",
  mixins: [mixins],
  props: {
    outName: String,
    info: {
      type: Object,
      default() {
        return {};
      },
    },
    node: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<template>
  <div class="ko-print-footer">
    <div class="out-of-stock">
      <div class="out-of-stock__item">
        <label>出库人：</label>
        <span>{{ outName || "" }}</span>
      </div>
      <div class="out-of-stock__item" v-if="node.debt && node.debt < 0">
        <label>累计欠款：</label>
        <span>{{ Math.abs(toYuan(node.debt || 0)) }}</span>
      </div>
      <div class="out-of-stock__item">
        <label>客户确认：</label>
        <span></span>
      </div>
    </div>
    <p class="illustrate" :class="{'not-footer': !info.ticketTailContent}">
      说明：本销售单一式三联，其中红联为结算联，经客户确认后视为欠款凭证，具有同等法律效力！
    </p>

    <div class="company" v-if="info.ticketTailContent">
      <div class="company__bank">
        <p>{{ info.ticketTailContent }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ko-print-footer {
  //border: 1px solid #8f939c;
  //border: 1px solid #000;
  border-top: none;
  @include print-style();

  .out-of-stock {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 6px 20px 8px;

    &__item {
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      @include print-style();

      label {
        text-align: right;
        white-space: nowrap;
      }

      span {
        display: inline-block;
        width: 8em;
        border-bottom: 0.5px solid #000;
        text-align: center;
        white-space: nowrap;
      }
    }
  }

  .illustrate {
    margin-top: 2px;
    text-align: center;
    @include print-style();


    &.not-footer {
      padding-bottom: 10px;
    }
  }

  .company {
    padding: 0 10% 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    @include print-style();

    &__bank {
      text-align: center;
      @include print-style();
    }
  }
}
</style>
