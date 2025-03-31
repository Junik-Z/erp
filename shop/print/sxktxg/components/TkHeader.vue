<script>
import mixins from "@/mixins/mixins";
import { _deepCopy } from "@/utils";
import Dayjs from "@/utils/dayjs";

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
    header: String,
    isPickDate: Boolean,
  },
  data() {
    return {
      date: "",
    };
  },
  methods: {
    onChange(event) {
      this.$set(this.node, "updateTime", Dayjs(event).format("YYYY-MM-DD HH:mm:ss"));
    },
  },
  watch: {
    node: {
      handler() {
        this.date = _deepCopy(this.node?.updateTime || "");
      },
      deep: true,
    },
  },
};
</script>

<template>
  <div class="ko-tk-header" style="--ko-basic-table-grid-col: 80px auto 80px auto 80px auto;">
    <h3>天科板材{{ header }}</h3>

    <div class="ko-tk-header__page" v-if="showPage">第{{ page }}</div>

    <div class="ko-tk-header__center">
      <div class="ko-basic-table ko-basic-table__not-border">
        <div>客户名称：</div>
        <div>{{ GET_FUNC(node || {}, "customer.name") }}</div>

        <div>录单日期：</div>
        <div style="display: flex; align-items: center;">
          <span v-if="!isPickDate"> {{ node.updateTime || "" }}</span>

          <el-date-picker
            v-else
            style="font-size: 12px"
            type="datetime"
            placeholder="选择录单时间"
            @change="onChange"
            v-model="date"
          />
        </div>

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
    font-size: 22px;
    text-align: center;
    margin-bottom: 10px;
  }

  &__page {
    position: absolute;
    top: 0;
    right: 30px;
  }

  &__center {
    padding: 0 10px;
    @include tk-print-style();

    ::v-deep .el-date-editor.el-input {
      width: auto;

      .el-input__inner {
        width: auto;
        height: auto;
        line-height: 16px;
        padding-left: 0;
        padding-right: 0;
        border: none;
        @include tk-print-style();
        color: #000;
      }

      .el-input__prefix, .el-input__suffix {
        display: none;
      }

    }
  }

}
</style>
