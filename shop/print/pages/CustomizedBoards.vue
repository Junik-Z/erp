<script>
// #ifdef H5
import PrintTable from "../components/BoardsPrint.vue";
import PrintFooter from "../components/PrintFooter.vue";
import PrintHeader from "../components/PrintHeader.vue";

import { VuePrintLast } from "../vue-print-last";
import mixins from "@/mixins/mixins";
import { cmToPx } from "@/shop/print/utils";
import { _sum } from "@/utils";

// 纸张大小
const PaperHeight = cmToPx(14);
let TimeVm = null;

const CellHeight = 17;

export default {
  name: "CustomizedBoards",
  mixins: [mixins],
  components: {
    PrintTable,
    PrintFooter,
    PrintHeader,
  },
  props: {
    isA4: Boolean,
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
  },
  data() {
    return {
      groupList: [],
      columns: [
        {
          label: "序号",
          prop: "__index__",
          width: 50,
        },
        {
          label: "名称",
          prop: "name",
        },
        {
          label: "宽",
          prop: "width",
        },
        {
          label: "高",
          prop: "height",
        },
        {
          label: "厚",
          prop: "weight",
        },
        {
          label: "数量",
          prop: "quantity",
        },
        {
          label: "颜色",
          prop: "color",
          bind: {colspan: 2},
        },
        {
          label: "统计",
          prop: "piece",
          bind: {colspan: 0, style: {display: "none"}},
        },
      ],
    };
  },
  methods: {
    // 获取各个元素的大小
    getGroupList() {
      // 获取表格每行的高度
      const rect = this.$refs.PTableRef?.getListSize?.() || {};

      // 产考元素的高度 - 上下的边框线
      const RHeight = (this.$refs.RRef?.offsetHeight || (PaperHeight - 20)) - 4;

      // 表头总高度
      const headerHeight = ((rect.slotThead || 0) + (rect?.thead || 0));
      // 表尾的高度
      const footerHeight = (rect.slotTFoot || 0);

      // 内容高度
      const CHeight = RHeight - headerHeight - footerHeight;

      const pages = [];

      let vessel = [];
      // 各个数据项加起来的高度
      let count = 0;

      const data = (this.getTableList || []);

      console.log(data);

      data.forEach((row) => {
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
      });

      // 剩余内容的总高度
      const VTotalHeight = _sum(vessel.map(v => (v.__height__)));

      // 剩余空白高度
      const lastHeight = CHeight - VTotalHeight;

      // 最后页要填补的条数
      const fill = Math.floor(lastHeight / CellHeight);

      let balance = 0;
      // 是否有其它费用
      if (rect.fees) balance += 1;

      // 是否有统计
      if (rect.summary) balance += 2;

      // 当要补空格大于0并且小于 统计加其它费用时则直接补格子
      if (fill > 0 && fill < balance) {
        for (let i = 0; i < fill; i++) {
          vessel.push({__height__: CellHeight});
        }
      } else if (fill > 0) {
        for (let i = 0; i < (fill - balance); i++) {
          vessel.push({__height__: CellHeight});
        }
      }

      pages.push(vessel);

      // 最后一页的总高度
      const VTHeight = _sum(vessel.map(v => (v.__height__)));

      if (fill < 0 || ((CHeight - (VTHeight + (rect.fees || 0))) < 0)) {
        // 每页的条数
        const pageLength = Math.floor((CHeight - (rect.fees || 0) - (rect.summary || 0)) / CellHeight);

        const end = [];
        for (let i = 0; i < pageLength; i++) {
          end.push({__height__: CellHeight});
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
  },
  watch: {
    watchSize: {
      handler() {
        if (!this.isA4) {
          TimeVm && clearTimeout(TimeVm);
          TimeVm = setTimeout(() => {
            this.getGroupList();
          }, 300);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    watchSize() {
      return [...this.data, ...this.feesList];
    },

    getSummary() {
      return [
        {label: "大写合计", colspan: 1},
        {
          label: this.toBigMoney(this.toYuan(this.node.totalAmount)),
          colspan: 4 - 2,
        },
        {label: "合计", colspan: 1},
        {label: this.toYuan(this.node.totalAmount), colspan: 1},
      ];
    },
    // 表格列表
    getTableList() {
      return [
        ...this.data?.map(item => {
          return {
            ...item,
            _config_: {
              color: {colspan: 2},
              piece: {colspan: 0},
            },
          };
        }),
        {
          name: "工程总价",
          _config_: {
            __index__: {colspan: 0},
            name: {colspan: 8},
            width: {colspan: 0},
            height: {colspan: 0},
            weight: {colspan: 0},
            quantity: {colspan: 0},
            color: {colspan: 0},
            piece: {colspan: 0},
          },
        },
        ...(this.GET_FUNC(this.node || {}, "_result_") || [])
          .map((item, index) => {
            const name = item.name || "";

            const numbers = name?.match?.(/\d+/g); // 匹配所有数字
            const description = name?.match?.(/\(([^)]+)\)/); // 匹配括号内的内容

            return {
              ...item,
              name: description?.[1] || name || "",
              color: this.toYuan(item.price),
              width: numbers?.[0] || "",
              height: numbers?.[1] || "",
              weight: numbers?.[2] || "",
              piece: this.toYuan(item.price * item.quantity),
              __index__: index + 1,
              /*  _config_: {
                 __index__: {colspan: 0},
                 name: {colspan: 2},
               }, */
            };
          }),
      ];
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-print-customized-boards" :style="[rootStyle]">
    <div class="ko-print-customized-boards__header ko-basic-box-shadow">
      <div>
        <el-button type="primary" size="mini" @click="onPrint">打印</el-button>
      </div>
    </div>

    <div class="ko-print-customized-boards__wrap">
      <div class="ko-print-customized-boards__content" ref="A4Ref" :class="{'is-a4': isA4}">
        <PrintTable
          ref="PTableRef"
          :columns="columns"
          :data="getTableList || []"
          :is-fees="!!feesList.length"

          :summary="getSummary"
          is-summary
          :fees-list="feesList"
          is-customized-boards
          is-result
          :result="GET_FUNC(node || {}, '_result_')"
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

    <div class="ko-print-customized-boards__item ko-print-customized-boards__refer">
      <div
        ref="RRef"
        class="ko-print-customized-boards__item--content"
      ></div>
    </div>


    <div class="ko-print-customized-boards__pages" :style="[rootStyle]" :key="JSON.stringify(groupList)">
      <div class="ko-print-customized-boards__pages--wrap" ref="PrintRef">
        <div class="ko-print-customized-boards__pages--item" v-for="(item, index) of groupList" :key="'print' + index">
          <div class="ko-print-customized-boards__pages--center">
            <PrintTable
              :columns="columns"
              :data="item || []"
              is-customized-boards
              :is-fees="!!feesList.length"
              :fees-list="feesList"
              :is-result="index === (groupList.length - 1)"
              :result="GET_FUNC(node || {}, '_result_')"

              :summary="getSummary"
              :is-summary="(groupList.length - 1) === index"
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

.ko-print-customized-boards {
  padding-top: 70px;
  padding-bottom: 80px;
  background: #fff;
  min-height: calc(100vh - 65px);
  position: relative;

  &__header {
    position: absolute;
    top: 0;
    width: 1366px;
    left: 50%;
    transform: translateX(-50%);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: #fff;
    padding: 0 30px;
    margin: 0 auto 20px;
    z-index: 9999;
  }

  &__wrap {
    width: var(--ko-paper-width);
    margin: 0 auto;
  }

  &__content {
    border-top: none;
    border-bottom: none;

    ::v-deep .ko-print-header {
      border: none;
    }

    ::v-deep .ko-print-footer {
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
