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
  //border: 1px solid #8f939c;
  //border: 1px solid #000;
  border-top: none;
  @include print-style();

  .out-of-stock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10% 8px;

    &__item {
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      @include print-style();

      label {
        width: 100px;
        text-align: right;
        white-space: nowrap;
      }

      span {
        display: inline-block;
        width: 10em;
        border-bottom: 0.5px solid #000;
        text-align: center;
        white-space: nowrap;
      }
    }
  }

  .illustrate {
    margin-top: 2px;
    //color: #8f939c;
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

    &__account {
      @include print-style();
    }

    &__ad {
      letter-spacing: 10px;
      @include print-style();
    }
  }
}
</style>
