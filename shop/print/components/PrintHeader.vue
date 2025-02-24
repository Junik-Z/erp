<script>
import mixins from "@/mixins/mixins";
import { Col, Row } from "@/uni_modules/element-ui/element.min";

export default {
  name: "PrintHeader",
  mixins: [mixins],
  components: {Row, Col},
  props: {
    title: String,
    node: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  /* watch: {
    node: {
      handler() {
        console.log('打印头部', this.node);
      },
      immediate: true,
      deep: true
    }
  } */
};
</script>

<template>
  <div class="ko-print-header">
    <h2>{{ title }}</h2>
    <Row class="ko-print-header__info" :gutter="10">
      <Col :span="9" class="ko-print-header__info--item">
        <label>订单编号：</label>
        <span>{{ node.orderCode }}</span>
      </Col>
      <Col :span="8" class="ko-print-header__info--item no1">
        <label>订单日期：</label>
        <span>{{ node.createTime }}</span>
      </Col>
      <Col :span="7" class="ko-print-header__info--item">
        <label>客户名称：</label>
        <span>{{ GET_FUNC(node || {}, "customer.name") }}</span>
      </Col>
      <Col :span="9" class="ko-print-header__info--item">
        <label>联系电话：</label>
        <span>{{ node.orderPhone }}</span>
      </Col>
      <Col :span="15" class="ko-print-header__info--item">
        <label>配送地址：</label>
        <span>{{ node.orderAddress }}</span>
      </Col>
    </Row>
  </div>
</template>

<style scoped lang="scss">
.ko-print-header {
  padding-top: 10px;
  border-bottom: none;
  padding-bottom: 8px;
  @include print-style();
  position: relative;
  background: #fff;
  z-index: 99;
  overflow: hidden;

  h2 {
    text-align: center;
    line-height: 1.4;
    @include print-header-style();
  }

  &__info {
    margin-top: 10px;
    padding: 0 10px;
    overflow: hidden;

    @include print-style();

    &--item {
      display: flex;
      align-items: flex-end;
      @include print-style();
      font-weight: normal;

      label {
        color: #000;
        white-space: nowrap;
      }

      span {
        flex: 1;
        color: #000;
        border-bottom: 0.5px solid #000;
        text-align: center;
        white-space: nowrap;
      }
    }
  }
}
</style>
