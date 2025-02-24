<script>
// #ifdef H5
import { VuePrintLast } from "./vue-print-last";

import { Button, Checkbox } from "@/uni_modules/element-ui/element.min";

import PrintHeader from "./components/PrintHeader.vue";
import PrintFooter from "./components/PrintFooter.vue";
import PrintTable from "./components/PrintTable.vue";
import mixins from "@/mixins/mixins";
import { cmToPx } from "@/shop/print/utils";
import { _get, _isEqual, _sum } from "@/utils";

// 纸张大小
const PaperHeight = cmToPx(14);

// 设置纸张的上下间隙的和
const UpperAndLowerClearance = cmToPx(2);

const SummaryText = {
  inbound3: "实收",
  outbound3: "实收",
  inbound: "实收",
  outbound: "实收",
  sale: "实收",
  saleReturn: "实退",
  purchase: "实付",
  purchaseReturn: "实收",
  produce: "实收",
  receivable: "实收",
  payable: "实收",
};

export default {
  name: "PrintInvoice",
  mixins: [mixins],
  components: {
    PrintTable,
    PrintFooter,
    PrintHeader,
    Button,
    Checkbox,
  },
  props: {
    isA4: Boolean,
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    showColumns: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    feesList: {
      type: Array,
      default() {
        return [];
      },
    },
    rootStyle: {
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
    header: String,
    option: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      groupList: [],
      maxHeight: 0,
    };
  },
  methods: {
    // 获取各个元素的大小
    getGroupList() {
      // 获取表格每行的高度
      const rect = this.$refs.PTableRef?.getListSize?.() || {};

      // 表头总高度
      const headerHeight = (rect.slotThead || 0) + (rect?.thead || 0);
      // 表尾的高度
      const footerHeight = (rect.slotTFoot || 0);

      // 纸张高度
      const totalHeight = PaperHeight - UpperAndLowerClearance;

      // 最大高度
      const maxHeight = totalHeight - headerHeight - footerHeight;

      const pages = [];

      let vessel = [];
      // 各个数据项加起来的高度
      let count = 0;
      let pageNumberSize = 0;

      ;(this.data || []).forEach((row) => {
        const h = rect[row.id] || 0;

        const obj = {...row, __height__: h};

        if (!pageNumberSize) {
          pageNumberSize = Math.floor(maxHeight / h);
        }

        if (count + h <= maxHeight) {
          vessel.push(obj);
          count += h;
        } else {
          pages.push(vessel);
          vessel = [obj];
          count = h;
        }

        pageNumberSize = pageNumberSize < vessel.length ? vessel.length : pageNumberSize;
      });

      if (vessel.length < pageNumberSize) {
        let number = pageNumberSize - vessel.length - 2;

        for (let i = 0; i < number; i++) {
          vessel.push({__label__: ""});
        }
      }

      // 当最后一页小于最大高度时直接渲染 否则就新开一页
      if ((count + footerHeight + (rect.fees || 0)) <= maxHeight) {
        pages.push(vessel);
      } else {
        const foot = pageNumberSize - 2;
        const li = [];
        for (let i = 0; i < foot; i++) {
          li.push({__label__: ""});
        }
        pages.push(vessel, li);
      }

      this.maxHeight = maxHeight;
      this.groupList = pages;
    },

    onPrint() {
      const el = this.isA4 ? this.$refs.A4Ref : this.$refs.PrintRef;

      new VuePrintLast({
        el,
        standard: "html5",
        customSize: this.isA4 ? {
          width: "210mm",
          height: "297mm",
        } : {
          width: "216mm",
          height: "140mm",
        },
      });
    },
  },
  watch: {
    watchSize: {
      handler() {
        if (!this.isA4) {
          setTimeout(() => {
            this.$nextTick(() => {
              this.getGroupList();
            });
          }, 300);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    filterColumnList() {
      return this.columns.filter(item => item.isPrint && !(item.notA4 && this.isA4));
    },
    // 宽 21.5 高 14
    getFees() {
      return this.feesList?.filter(item => item.isPrint && !(item.notA4 && this.isA4));
    },
    getSummary() {
      const count = _sum((this.node?.details || []).map(item => item.total));
      const numIndex = this.filterColumnList.findIndex(item => _isEqual(item.label, "数量"));

      if (count === this.node.totalAmount) {
        return [
          {label: "大写合计", colspan: 1},
          {
            label: this.toBigMoney(this.toYuan(count)),
            colspan: numIndex - 2,
          },
          {label: "合计", colspan: 1},
          {label: this.toYuan(count), colspan: 1},
        ];
      }

      return [
        {label: `大写${_get(SummaryText, this.option?.page_type)}`, colspan: 1},
        {
          label: this.toBigMoney(this.toYuan(this.node.totalAmount)),
          colspan: numIndex - 2,
        },
        {label: "合计", colspan: 1},
        {label: this.toYuan(count), colspan: 1},
        {label: `${_get(SummaryText, this.option?.page_type)}`, colspan: 1},
        {label: this.toYuan(this.node.totalAmount), colspan: 1},
      ];
    },
    watchSize() {
      return [...this.filterColumnList, ...this.getFees];
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-print" :style="rootStyle">
    <div class="ko-print__picker ko-basic-box-shadow">
      <div class="ko-print__check">
        <label>打印字段：</label>
        <div>
          <Checkbox
            :disabled="item.disabled"
            :label="item.label"
            v-for="(item, index) of columns"
            :key="'column' + index"
            v-model="item.isPrint"
            v-if="!(isA4 && item.notA4)"
          />
          <Checkbox
            :disabled="item.disabled"
            :label="item.label"
            v-for="(item, index) of feesList"
            :key="'fees' + index"
            v-model="item.isPrint"
            v-if="!(isA4 && item.notA4)"
          />
        </div>
      </div>
      <div>
        <Button type="primary" size="mini" @click="onPrint">打印</Button>
      </div>
    </div>

    <div class="ko-print__wrap">
      <div class="ko-print__content" ref="A4Ref" :class="{'is-a4': isA4}">
        <PrintTable
          ref="PTableRef"
          is-summary
          :columns="filterColumnList"
          :data="data || []"
          :summary="isA4 ? [] : getSummary"
          :is-fees="!!getFees.length"
          :fees-list="getFees"
        >
          <template #thead>
            <PrintHeader ref="HeaderRef" :title="GET_SHOP_NAME + header" :node="node" />
          </template>
          <template #tfoot>
            <PrintFooter ref="FooterRef" :out-name="GET_USER_INFO.nickName" :info="GET_CONFIG_INFO" />
          </template>
        </PrintTable>
      </div>
    </div>

    <div class="ko-print__pages" :style="rootStyle" :key="JSON.stringify(groupList)">
      <div class="ko-print__pages--wrap" ref="PrintRef">
        <div class="ko-print__pages--item" v-for="(item, index) of groupList" :key="'print' + index">
          <div class="ko-print__pages--center">
            <PrintTable
              :columns="filterColumnList"
              :data="item || []"
              :summary="getSummary"
              :is-summary="(groupList.length - 1) === index"
              :is-fees="(groupList.length - 1) === index && !!getFees.length"
              :fees-list="getFees"
            >
              <template #thead>
                <PrintHeader :title="GET_SHOP_NAME + header" :node="node" />
              </template>
              <template #tfoot>
                <PrintFooter :out-name="GET_USER_INFO.nickName" :info="GET_CONFIG_INFO" />
              </template>
            </PrintTable>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- #endif -->
</template>

<style scoped lang="scss">
// #ifdef H5
@media print {
  .ko-print__pages--center {
    margin: 0; /* 移除外边距 */
    padding: 0; /* 移除内边距 */
    box-sizing: border-box; /* 确保边框包含在宽度内 */
    width: 19.5cm;
  }
}

.ko-print {
  padding-top: 120px;
  padding-bottom: 80px;
  background: #fff;
  min-height: calc(100vh - 65px);
  position: relative;

  @include print-style();

  &__wrap {
    width: var(--ko-paper-width);
    margin: 0 auto;
  }

  &__picker {
    position: absolute;
    top: 0;
    width: 1366px;
    left: 50%;
    transform: translateX(-50%);
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 0 30px;
    margin: 0 auto 20px;
    z-index: 9999;
  }

  &__content {
    border-top: none;
    border-bottom: none;

    /deep/ .ko-print-header {
      border: none;
    }

    /deep/ .ko-print-footer {
      border: none;
    }
  }

  &__pages {
    @include print-style();
    position: absolute;
    left: -999999999px;

    &--wrap {
      width: 100%;
    }

    &--item {
      height: var(--ko-paper-height);
      width: var(--ko-paper-width);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &--center {
      width: calc(var(--ko-paper-width) - 2cm);
    }

    /deep/ .ko-print-table {
      height: var(--ko-paper-max-height, 100%);
    }
  }
}

// #endif
</style>
