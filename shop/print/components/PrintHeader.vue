<script>
import mixins from "@/mixins/mixins";

export default {
  name: "PrintHeader",
  mixins: [mixins],
  props: {
    title: String,
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
  <div class="ko-print-header">
    <h2>{{ title }}</h2>
    <div class="ko-print-header__info">
      <div class="ko-print-header__info--item">
        <label>订单编号：</label>
        <span>{{ node.orderCode }}</span>
      </div>
      <div class="ko-print-header__info--item">
        <label>日&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;期：</label>
        <span>{{ node.createTime }}</span>
      </div>
      <div class="ko-print-header__info--item">
        <label>客户名称：</label>
        <span>{{ GET_FUNC(node, "customer.name") }}</span>
      </div>
      <div class="ko-print-header__info--item">
        <label>联系电话：</label>
        <span>{{ node.orderPhone }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ko-print-header {
  padding-top: 10px;
  border: 1px solid #8f939c;
  border-bottom: none;
  padding-bottom: 8px;

  h2 {
    font-size: 26px;
    font-weight: bold;
    text-align: center;
    line-height: 1.4;
  }

  &__info {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    font-size: 12px;

    &--item {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      width: calc(48% - 40px);
      margin: 4px 20px;

      label {
        color: #8f939c;
        width: 80px;
      }

      span {
        width: 300px;
        color: #333;
        border-bottom: 0.5px solid #8f939c;
        text-align: center;
      }
    }
  }
}
</style>
