<script>
// #ifdef H5
import { VuePrintLast } from "../vue-print-last";

import PrintHeader from "../components/PrintHeader.vue";
import PrintFooter from "../components/PrintFooter.vue";
import PrintTable from "../components/PrintTable.vue";
import mixins from "@/mixins/mixins";
import { cmToPx } from "@/shop/print/utils";
import { _deepCopy, _flattenDeep, _get, _groupBy, _isEqual, _keys, _sum } from "@/utils";

// 纸张大小
const PaperHeight = cmToPx(14);

// 获取出来的每行高度
const CellHeight = 17;

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

      classGroup: [],

      // 根据分类排序
      isClassSort: false,
    };
  },
  methods: {
    // 获取各个元素的大小
    getGroupList() {
      // 获取表格每行的高度
      const rect = this.$refs.PTableRef?.getListSize?.() || {};
      // 产考元素的高度 - 上下的边框线 - 上下的高度
      const RHeight = (this.$refs.RRef?.offsetHeight || (PaperHeight - 20)) - 10;

      // 表头总高度
      const headerHeight = ((rect.slotThead || 0) + (rect?.thead || 0) + 1);
      // 表尾的高度
      const footerHeight = (rect.slotTFoot || 0);

      // 内容高度
      const CHeight = RHeight - headerHeight - footerHeight;

      // 最终的数据
      const pages = [];

      // 临时存储的数据
      let vessel = [];

      // 各个数据项加起来的高度
      let count = 0;

      // 数据列表
      const data = (this.getFilterList || []);

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        const h = rect[row.id] || CellHeight;

        const obj = {...row, __height__: h};

        if (count + h <= CHeight) {
          vessel.push(obj);
          count += h;
        } else {
          pages.push(vessel);
          vessel = [obj];
          count = h;
        }
      }

      // 剩余内容的总高度
      const VTotalHeight = _sum(vessel.map(v => (v.__height__)));

      const A = Math.ceil((VTotalHeight || 0) / (_deepCopy(vessel).length || 0));

      // 每行平均的高度
      const averageCellHeight = isNaN(A) ? 19 : A;


      // 剩余空白高度
      const lastHeight = CHeight - VTotalHeight;

      // 最后页要填补的条数
      const fill = Math.floor(lastHeight / averageCellHeight);

      let balance = 0;
      // 是否有其它费用
      if (rect.fees) balance += 1;

      // 是否有统计
      if (rect.summary) balance += 1;

      // 当要补空格大于0并且小于 统计加其它费用时则直接补格子
      if (fill > 0 && fill < balance) {
        for (let i = 0; i < fill; i++) {
          vessel.push({__height__: averageCellHeight});
        }
      } else if (fill > 0) {
        for (let i = 0; i < (fill - balance); i++) {
          vessel.push({__height__: averageCellHeight});
        }
      }

      pages.push(vessel);

      // 最后一页的总高度
      const VTHeight = _sum(vessel.map(v => (v.__height__)));

      if (fill < 0 || ((CHeight - (VTHeight + (rect.fees || 0))) < 0)) {
        // 每页的条数
        const pageLength = Math.floor((CHeight - (rect.fees || 0) - (rect.summary || 0)) / averageCellHeight);

        const end = [];
        for (let i = 0; i < pageLength; i++) {
          end.push({__height__: averageCellHeight});
        }
        pages.push(end);
      }

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

    // 获取分类数据
    getClassGroup() {
      const List = _deepCopy(this.data);
      const group = _groupBy(List, (v) => v.classId);
      this.classGroup = _keys(group).map(id => {
        const list = group[id] || [];
        const item = list[0] || {};
        return {
          isPrint: true,
          label: item?.className,
          classId: item.classId,
          list,
        };
      });
    },
  },
  watch: {
    data: {
      handler() {
        this.getClassGroup();
      },
      deep: true,
    },
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
      return [...this.filterColumnList, ...this.getFees, ...this.getFilterList];
    },

    // 获取根据分类去去除数据
    filterItemList() {
      const classGroup = _deepCopy(this.classGroup).flatMap(item => {
        if (item.isPrint) {
          return [item.classId];
        } else {
          return [];
        }
      });

      return _deepCopy(this.data)?.filter(item => classGroup.includes(item.classId)) || [];
    },

    filterData() {
      return _flattenDeep(_deepCopy(this.classGroup)?.filter(item => item.isPrint)?.map(v => v.list) || [])
        ?.map((v, index) => ({...v, __index__: index + 1}));
    },

    // 获取排序后的数据列表
    getFilterList() {
      return this.isClassSort ? this.filterData : this.filterItemList;
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-n-print" :style="[rootStyle]">
    <div class="ko-n-print__picker ko-basic-box-shadow">
      <div style="flex: 1;">
        <div class="ko-n-print__check">
          <label>打印字段：</label>
          <div>
            <el-checkbox
              :disabled="item.disabled"
              :label="item.label"
              v-for="(item, index) of columns"
              :key="'column' + index"
              v-model="item.isPrint"
              v-if="!(isA4 && item.notA4)"
            />
            <el-checkbox
              :disabled="item.disabled"
              :label="item.label"
              v-for="(item, index) of feesList"
              :key="'fees' + index"
              v-model="item.isPrint"
              v-if="!(isA4 && item.notA4)"
            />
          </div>
        </div>
        <div class="ko-n-print__check" style="margin-top: 10px; margin-bottom: 10px;">
          <label>
            打印分类：

            <el-checkbox
              v-if="classGroup.length > 1"
              style="margin-left: 10px;"
              v-model="isClassSort"
              label="根据类型排序"
            />
          </label>
          <div>
            <el-checkbox
              :disabled="item.disabled"
              :label="item.label"
              v-for="(item, index) of classGroup"
              :key="'column' + index"
              v-model="item.isPrint"
            />
          </div>
        </div>
      </div>

      <div>
        <el-button type="primary" size="mini" @click="onPrint">打印</el-button>
      </div>
    </div>

    <div class="ko-n-print__wrap">
      <div class="ko-n-print__content" ref="A4Ref" :class="{'is-a4': isA4}">
        <PrintTable
          ref="PTableRef"
          is-summary
          :columns="filterColumnList"
          :data="getFilterList || []"
          :summary="isA4 ? [] : getSummary"
          :is-fees="!!getFees.length"
          :fees-list="getFees"
        >
          <template #thead>
            <PrintHeader ref="HeaderRef" :title="GET_SHOP_NAME + header" :node="node" />
          </template>
          <template #tfoot>
            <PrintFooter
              ref="FooterRef"
              :out-name="GET_USER_INFO.nickName"
              :info="GET_CONFIG_INFO"
              :node="node"
            />
          </template>
        </PrintTable>
      </div>
    </div>

    <div class="ko-n-print__item ko-n-print__refer">
      <div
        ref="RRef"
        class="ko-n-print__item--content"
      ></div>
    </div>

    <div class="ko-n-print__pages" :style="rootStyle" :key="JSON.stringify(groupList)">
      <div class="ko-n-print__pages--wrap" ref="PrintRef">
        <div class="ko-n-print__item" v-for="(item, index) of groupList" :key="'print' + index">
          <div class="ko-n-print__item--content">
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
                <PrintFooter
                  :out-name="GET_USER_INFO.nickName"
                  :info="GET_CONFIG_INFO"
                  :node="node"
                />
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

.ko-n-print {
  padding-top: 150px;
  padding-bottom: 80px;
  background: #fff;
  min-height: calc(100vh - 65px);
  position: relative;

  &__wrap {
    width: var(--ko-paper-width);
    margin: 0 auto;
  }

  &__picker {
    position: absolute;
    top: 0;
    width: 1166px;
    left: 50%;
    transform: translateX(-50%);
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 0 30px;
    margin: 0 auto 20px;
    z-index: 999;
  }

  &__content {
    border-top: none;
    border-bottom: none;

    ::v-deep .ko-n-print-header {
      border: none;
    }

    ::v-deep .ko-n-print-footer {
      border: none;
    }
  }

  // 参考的元素
  &__refer {
    position: absolute;
    left: -9999999px;
    top: 0;
  }

  &__item {
    height: var(--ko-paper-height);
    width: var(--ko-paper-width);
    display: flex;
    align-items: center;
    justify-content: center;

    ::v-deep .ko-print-table {
      height: 100%;
    }

    &--content {
      width: calc(100% - 6px);
      height: calc(100% - 16mm - 14px);
      padding: 0 4px;
    }
  }

  &__pages {
    position: absolute;
    left: -999999999px;
    top: 0;
  }
}

// #endif
</style>
