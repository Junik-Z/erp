<script>
import mixins from "@/mixins/mixins";

export default {
  name: "TkFooter",
  mixins: [mixins],
  props: {
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
  <div class="ko-tk-footer" style="--ko-basic-table-grid-col: 70px auto 60px auto 80px auto;">
    <div class="ko-tk-footer__center">
      <div class="ko-basic-table ko-basic-table__not-border">
        <div>制单人：</div>
        <div>{{ GET_USER_INFO.nickName }}</div>

        <div>电话：</div>
        <div>{{GET_CONFIG_INFO.ticketTailContent}}</div>

        <div>客户签单：</div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ko-tk-footer {
  &__center {
    padding: 0 10px;
    @include tk-print-style();
  }
}
</style>
