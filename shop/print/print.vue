<script>
// #ifdef H5
import { getInboundDetailApi, getOutboundDetailApi } from "@/api/erp/stock";
import { _get, _isEqual, _keys, _sum, addUnit } from "@/utils";
import mixins from "@/mixins/mixins";
import { getOtherCostListApi, getSaleDetailApi, getSaleReturnDetailApi } from "@/api/erp/sale";
import { getPurchaseDetailApi, getPurchaseReturnDetailApi } from "@/api/erp/purchase";
import { getProduceDetailApi } from "@/api/erp/produce";
import { getPayableDetailApi, getReceivableDetailApi } from "@/api/erp/finance";
import { getProductFieldApi } from "@/api/erp/product";
import PrintHeader from "./components/PrintHeader.vue";
import PrintFooter from "./components/PrintFooter.vue";
import PrintTable from "@/shop/print/components/PrintTable.vue";

import { VuePrintLast } from "./vue-print-last";

import { Button, Checkbox } from "@/uni_modules/element-ui/element.min";
import { cmToPx, pointToPx } from "./utils";

// 纸张大小
const PaperWidth = cmToPx(21.5);
const PaperHeight = cmToPx(14);
// 设置纸张的上下间隙的和
const UpperAndLowerClearance = cmToPx(2);

const PageType = {
  inbound: "入库单",
  outbound: "出库单",
  sale: "销售单",
  saleReturn: "销售退货单",
  purchase: "采购单",
  purchaseReturn: "采购退货单",
  produce: "生产工单",
  receivable: "财务收款单",
  payable: "财务收款单",
};

const SummaryText = {
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

const Func = {
  inbound: getInboundDetailApi,
  outbound: getOutboundDetailApi,
  sale: getSaleDetailApi,
  saleReturn: getSaleReturnDetailApi,
  purchase: getPurchaseDetailApi,
  purchaseReturn: getPurchaseReturnDetailApi,
  produce: getProduceDetailApi,
  receivable: getReceivableDetailApi,
  payable: getPayableDetailApi,
};

export default {
  name: "DetailsOrder",
  mixins: [mixins],
  components: {PrintTable, PrintFooter, PrintHeader, Checkbox, Button},
  data() {
    return {
      option: {},
      node: {},
      header: "",
      FieldList: [],

      columns: [],

      groupList: [],

      maxHeight: 0,

      isA4: false,

      fees: {},
      feesList: [],
    };
  },
  async onLoad(option) {
    this.isA4 = ["outbound", "inbound"].includes(option?.page_type) || _isEqual(option.isA4, "true");

    this.option = option;
    this.header = _get(PageType, option?.page_type);
    uni.setNavigationBarTitle({title: this.header});

    await this.getFeesList();
    this.getColumnList();
    this.getExtendList();
    await this.getList();

    if (!this.isA4) {
      setTimeout(() => {
        this.getGroupList();
      }, 100);
    }
  },
  methods: {
    getList() {
      this.loading = true;

      Func[this.option.page_type]?.({id: this.option.id})
        .then(res => {
          const list = res.data;
          list.details = (list.details || []).map((item, index) => ({
            ...item,
            __index__: index + 1,
            total: item.price * item.productQuantity,
          }));

          // list.details = [...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details, ...list.details];

          /*  list.fees = {
             HandlingFee: "30",
             InstallationFee: "50",
             LogisticsFee: "22",
             UpstairsFee: "21",
           }; */

          this.feesList = _keys(list.fees).map((key) => ({
            key,
            isPrint: true,
            value: list.fees[key],
            label: this.fees[key],
            notA4: this.isA4,
          }));

          console.log(this.feesList);

          this.node = list;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getExtendList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.FieldList = res.data;
        })
        .finally(() => {
          this.getColumnList();
        });
    },

    // 获取表头数据
    getColumnList() {
      const extend = this.FieldList.map(item => {
        return {
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
          isPrint: true,
          disabled: false,
        };
      });
      this.columns = [
        {
          label: "序号",
          width: 50,
          prop: "__index__",
          isPrint: true,
          disabled: true,
        },
        {
          label: "类型",
          prop: "className",
          isPrint: true,
          disabled: true,
        },
        {
          label: "名称",
          prop: "name",
          isPrint: true,
          disabled: true,
        },
        ...extend,
        {
          label: "数量",
          prop: "productQuantity",
          // width: 70,
          isPrint: true,
          disabled: true,
        },
        {
          label: "单价",
          // width: 70,
          prop: "price",
          isPrint: true,
          disabled: true,
          notA4: true,
          render: (h, {row}) => {
            return h("span", {}, [this.toYuan(row.price) || ""]);
          },
        },
        {
          label: "金额",
          prop: "total",
          // width: 70,
          isPrint: true,
          disabled: true,
          notA4: true,
          render: (h, {row}) => {
            return h("span", {}, [this.toYuan(row.total) || ""]);
          },
        },
      ];
    },

    getFeesList() {
      return getOtherCostListApi()
        .then(res => {
          this.fees = res.data;
        });
    },

    // 获取各个元素的大小
    getGroupList() {
      // 获取表格每行的高度
      const rect = this.$refs.PTableRef.getListSize();

      console.log(rect);

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

      ;(this.node.details || []).forEach((row) => {
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

      // console.log(pages, PaperHeight, pageNumberSize);
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
    filterColumnList: {
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
    },
    getFees: {
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
    },
  },
  computed: {
    filterColumnList() {
      return this.columns.filter(item => item.isPrint && !(item.notA4 && this.isA4));
    },
    getTotal() {
      return _sum((this.node?.details || [])?.map(item => ((item.price || 0) * (item.productQuantity || 0))));
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
    rootStyle() {
      return {
        "--ko-paper-width": addUnit(PaperWidth),
        "--ko-paper-height": addUnit(PaperHeight),
        "--ko-paper-max-height": addUnit(this.maxHeight),
        "--ko-paper-title-font-size": pointToPx(18),
        "--ko-paper-font-size": pointToPx(11),
      };
    },
    // 宽 21.5 高 14
    getFees() {
      return this.feesList?.filter(item => item.isPrint && !(item.notA4 && this.isA4));
    },
  },
};

// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="ko-print" :style="rootStyle">
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
          :data="node.details || []"
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

    <div class="ko-print__pages" :style="rootStyle">
      <div ref="PrintRef">
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
  </view>
  <!-- #endif -->
</template>

<style scoped lang="scss">
// #ifdef H5

.ko-print {
  padding-top: 120px;
  padding-bottom: 80px;
  background: #fff;
  min-height: 100vh;
  position: relative;
  //font-family: "华文楷体", "KaiTi", sans-serif;

  @include print-style();

  &__wrap {
    width: var(--ko-paper-width);
    margin: 0 auto;
  }

  &__picker {
    position: fixed;
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

    /* &.is-a4 {
     }*/
  }

  &__pages {
    //position: fixed;
    //z-index: -99;
    //top: 3000vh;
    //left: 30000vw;
    @include print-style();
    position: absolute;
    left: -999999999px;


    &--item {
      height: var(--ko-paper-height);
      width: var(--ko-paper-width);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /deep/ .ko-print-table {
      height: var(--ko-paper-max-height, 100%);
    }
  }
}

// #endif
</style>
