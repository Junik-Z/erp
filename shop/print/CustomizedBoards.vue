<script>
// #ifdef H5
import PrintTable from "./components/BoardsPrint.vue";
import PrintFooter from "./components/PrintFooter.vue";
import PrintHeader from "./components/PrintHeader.vue";
import { Button } from "@/uni_modules/element-ui/element.min";

import { VuePrintLast } from "./vue-print-last";
import mixins from "@/mixins/mixins";
import { cmToPx } from "@/shop/print/utils";

// 纸张大小
const PaperHeight = cmToPx(14);
// 设置纸张的上下间隙的和
const UpperAndLowerClearance = cmToPx(2);
let TimeVm = null;

export default {
  name: "CustomizedBoards",
  mixins: [mixins],
  components: {
    PrintTable,
    PrintFooter,
    PrintHeader,
    Button,
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
      const rect = this.$refs.PTableRef.getListSize();

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

      console.log(this.getTableList);

      ;(this.getTableList || []).forEach((row) => {
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
      if ((count + footerHeight + (rect.fees || 0) + (rect.result || 0)) <= maxHeight) {
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

        ...this.GET_FUNC(this.node || {}, "_result_").map((item, index) => {
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
  <div class="ko-print-customized-boards" :style="rootStyle">
    <div class="ko-print-customized-boards__header ko-basic-box-shadow">
      <div>
        <Button type="primary" size="mini" @click="onPrint">打印</Button>
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

    <div class="ko-print-customized-boards__pages" :style="rootStyle" :key="JSON.stringify(groupList)">
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

<style lang="scss">
// #ifdef H5
//@page Triple {
//  size: 216mm 140mm;
//  margin: 0;
//}

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

    /deep/ .ko-print-header {
      border: none;
    }

    /deep/ .ko-print-footer {
      border: none;
    }
  }

  &__pages {
    //page: Triple;
    //position: fixed;
    //z-index: -99;
    //top: 3000vh;
    //left: 30000vw;
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
