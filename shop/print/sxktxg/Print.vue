<script>
// #ifdef H5
import props from "../props";
import TkTable from "./components/TkTable.vue";
import { _get, _keys, _pick, _sum } from "@/utils";
import TkHeader from "./components/TkHeader.vue";
import TkFooter from "./components/TkFooter.vue";
import mixins from "@/mixins/mixins";
import { VuePrintLast } from "../vue-print-last";
import { cmToPx } from "@/shop/print/utils";

const PaperHeight = cmToPx(14);

const FontSize = 14;
const CellHeight = 17;

export default {
  name: "Print",
  mixins: [mixins],
  props: props,
  components: {
    TkTable,
    TkHeader,
    TkFooter,
  },
  data() {
    return {
      groupList: [],
    };
  },
  watch: {
    node: {
      handler() {
        if (!this.isA4) {
          setTimeout(() => {
            this.$nextTick(() => {
              this.computeGroup();
            });
          }, 300);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 计算显示的数据
    computeGroup() {
      const rect = this.$refs.TTRef?.getListSize?.() || {};
      // 产考元素的高度
      const RHeight = this.$refs.RRef.offsetHeight || (PaperHeight - 20);

      // 表头总高度
      const headerHeight = (rect.slotThead || 0) + (rect?.thead || 0);
      // 表尾的高度
      const footerHeight = (rect.slotTFoot || 0);

      // 内容高度 - CellHeight 是为了放最后页小计 - 页小计
      const CHeight = (RHeight - headerHeight - footerHeight) - (rect.statistics || CellHeight) - (2 * CellHeight);

      // 最终的数据
      const pages = [];

      // 临时存储的数据
      let vessel = [];

      // 各个数据项加起来的高度
      let count = 0;

      // 数据列表
      const data = (this.node?.details || []);
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
      const VTotalHeight = _sum(vessel.map(v => v.__height__));

      // 最后页要填补的条数
      const fill = Math.floor((CHeight - VTotalHeight) / CellHeight) - 1;

      // 当要补的要大于 1 条的时候则正常补空行
      if (fill > 0) {
        for (let i = 0; i < fill; i++) {
          vessel.push({__height__: CellHeight});
        }
      }

      pages.push(vessel);

      // 每页的条数
      const pageLength = Math.floor(CHeight / CellHeight);

      if (fill < 0) {
        const end = [];
        for (let i = 0; i < (pageLength - 2); i++) {
          end.push({__height__: CellHeight});
        }
        pages.push(end);
      }

      this.groupList = pages;
    },

    onPrint() {
      const el = this.isA4 ? this.$refs.A4Ref : this.$refs.PRef;

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
  computed: {
    bind() {
      return {
        ..._pick(this, _keys(props)),
        columns: [
          {
            label: "编号",
            headAlign: "center",
            headStyle: {
              // "letter-spacing": "1em",
              // paddingLeft: "1em",
            },
            align: "center",
            width: 70,
            prop: "__index__",
          },
          {
            label: "商品全名",
            headAlign: "center",
            headStyle: {
              "letter-spacing": "1em",
              paddingLeft: "1em",
            },
            prop: "name",
          },
          {
            label: "单位",
            headAlign: "center",
            headStyle: {
              "letter-spacing": "10px",
              paddingLeft: "10px",
            },
            prop: "name",
            align: "center",
            width: 70,
            render: (h, {row}) => {
              return h("span", {}, [_get(row || {}, "extend.dangwei") || ""]);
            },
          },
          {
            label: "数量",
            headAlign: "center",
            prop: "productQuantity",
            headStyle: {
              "letter-spacing": "10px",
              paddingLeft: "10px",
            },
            align: "center",
            width: 70,
          },
          {
            label: "单价",
            headAlign: "center",
            headStyle: {
              "letter-spacing": "10px",
              paddingLeft: "10px",
            },
            render: (h, {row}) => {
              return h("span", {}, [this.toYuan(row.price) || ""]);
            },
            align: "center",
            width: 70,
          },
          {
            label: "金额",
            width: 70,
            headAlign: "center",
            render: (h, {row}) => {
              return h("span", {}, [this.toYuan(row.total) || ""]);
            },
            align: "right",
            headStyle: {
              "letter-spacing": "10px",
              paddingLeft: "10px",
            },
          },
          {
            label: "备注",
            width: 100,
            headAlign: "center",
            prop: "remark",
            headStyle: {
              "letter-spacing": "1em",
              paddingLeft: "1em",
            },
          },
        ],
      };
    },

    getTotal() {
      return _sum(((this.node || {})?.details || [])?.map(v => (v.total || 0))) || 0;
    },

    getSummary() {
      return [
        {
          colspan: 1,
          label: "合计大写",
        },
        {
          colspan: 3,
          label: this.toBigMoney(this.toYuan(this.getTotal)),
        },
        {
          colspan: 1,
          label: "合计",
          style: "text-align:right;",
        },
        {
          colspan: 2,
          style: "text-align:right;",
          label: this.toYuan(this.getTotal),
        },
      ];
    },

    getRootStyle() {
      return {
        ...this.rootStyle,
        "--tk-cell-min-height": CellHeight + "px",
        "--tk-cell-font-size": FontSize + "px",
      };
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-print-tk" :style="getRootStyle">
    <div class="ko-print-tk__picker ko-basic-box-shadow">
      <div class="ko-print-tk__check">
      </div>
      <div>
        <button class="ko-basic-button__card" @click="onPrint">打印</button>
      </div>
    </div>

    <div class="ko-print-tk__wrap">
      <div class="ko-print-tk__wrap--content" ref="A4Ref">
        <TkTable
          ref="TTRef"
          v-bind="bind"
          :data="node.details || []"
          :summary="getSummary"
          is-show-summary
        >
          <template #thead>
            <TkHeader :node="node" />
          </template>
          <template #tfoot>
            <TkFooter :node="node" />
          </template>
        </TkTable>
      </div>
    </div>

    <div class="ko-print-tk__item ko-print-tk__refer">
      <div
        ref="RRef"
        class="ko-print-tk__item--content"
      ></div>
    </div>

    <div class="ko-print-tk__triplet" :style="getRootStyle" :key="JSON.stringify(groupList)">
      <div ref="PRef" style="width: 100%">
        <div
          class="ko-print-tk__item"
          v-for="(item, index) of groupList"
          :key="'page' + index"
        >
          <div class="ko-print-tk__item--content">
            <TkTable
              style="height: 100%;"
              v-bind="bind"
              :data="item || []"
              :summary="getSummary"
              :is-show-summary="isEqual(groupList.length - 1, index)"
            >
              <template #thead>
                <TkHeader :node="node" show-page :page="`${index + 1}/${groupList.length || 0}`" />
              </template>
              <template #tfoot>
                <TkFooter :node="node" />
              </template>
            </TkTable>
            <!--<div class="page-break"></div>-->
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- #endif -->
</template>

<style lang="scss">
// #ifdef H5
/*@media print {
  .page-break {
    page-break-after: always; !* 在指定位置强制分页 *!
  }
}*/

.ko-print-tk {
  position: relative;
  padding: 110px 20px 30px;
  box-sizing: border-box;

  &__wrap {
    width: calc(210mm + 20px);
    margin: 0 auto;
    border: 1px solid #e9e9eb;
    padding: 10px;
    border-radius: 6px;

    &--content {
      width: 100%;
    }
  }

  &__picker {
    position: absolute;
    top: 0;
    width: 1366px;
    left: 50%;
    transform: translateX(-50%);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 0 30px;
    margin: 0 auto 20px;
    z-index: 9999;
  }

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

    &--content {
      width: calc(100% - 6px);
      height: calc(100% - 10mm - 8px);
      padding: 4px;
    }
  }

  // 三联纸打印容器
  &__triplet {
    @include tk-print-style();

    position: absolute;
    left: -99999999px;
    top: 0;
  }
}

// #endif
</style>
