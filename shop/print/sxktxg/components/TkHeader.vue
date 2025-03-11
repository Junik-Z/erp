<script>
import mixins from "@/mixins/mixins";

export default {
  name: "TkHeader",
  mixins: [mixins],
  props: {
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    showPage: Boolean,
    page: [Number, String],
  },
};
</script>

<template>
  <div class="ko-tk-header" style="--ko-basic-table-grid-col: 80px auto 80px auto 80px auto;">
    <h3>天科板材五金批发部</h3>

    <div class="ko-tk-header__page" v-if="showPage">第{{ page }}</div>

    <div class="ko-tk-header__center">
      <div class="ko-basic-table ko-basic-table__not-border">
        <div>客户名称：</div>
        <div>{{ GET_FUNC(node || {}, "customer.name") }}</div>

        <div>录单日期：</div>
        <div>{{ node.createTime }}</div>

        <div>单据编号：</div>
        <div>{{ node.orderCode }}</div>

        <div>联系电话：</div>
        <div>{{ node.orderPhone }}</div>

        <div>地址：</div>
        <div>{{ node.orderAddress }}</div>

        <div>联系人：</div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ko-tk-header {
  position: relative;

  h3 {
    letter-spacing: 1em;
    font-size: 18px;
    text-align: center;
  }

  &__page {
    position: absolute;
    top: 0;
    right: 30px;
  }

  &__center {
    padding: 0 10px;
    @include tk-print-style();
  }

}
</style>
