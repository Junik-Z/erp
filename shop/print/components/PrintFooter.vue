<script>
export default {
  name: "PrintFooter",
  props: {
    outName: String,
    info: {
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

      <div class="company__account" v-if="false">户名: 袁路平</div>
      <div class="company__ad" v-if="false">耀通有您更精彩！</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ko-print-footer {
  border: 1px solid #8f939c;
  border-top: none;

  .out-of-stock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10%;

    &__item {
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;

      label {
        color: #8f939c;
        width: 80px;
        text-align: right;
      }

      span {
        display: inline-block;
        width: 200px;
        color: #333;
        border-bottom: 0.5px solid #8f939c;
        text-align: center;
      }
    }
  }

  .illustrate {
    margin-top: 2px;
    font-size: 12px;
    color: #8f939c;
    text-align: center;

    &.not-footer {
      padding-bottom: 10px;
    }
  }

  .company {
    padding: 0 10% 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &__bank {
      text-align: center;
    }

    &__account {
      font-size: 12px;
    }

    &__ad {
      font-size: 23px;
      font-weight: bold;
      letter-spacing: 10px;
    }
  }
}
</style>
