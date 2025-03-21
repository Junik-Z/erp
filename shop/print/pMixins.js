// #ifdef H5

import { getInboundDetailApi, getOutboundDetailApi } from "@/api/erp/stock";
import { getOtherCostListApi, getSaleDetailApi, getSaleReturnDetailApi } from "@/api/erp/sale";
import { getPurchaseDetailApi, getPurchaseInfoApi, getPurchaseReturnDetailApi } from "@/api/erp/purchase";
import { getProduceDetailApi, getProduceOrderCodeDetailApi, getProduceOrderDetailApi } from "@/api/erp/produce";
import { getPayableDetailApi, getReceivableDetailApi } from "@/api/erp/finance";
import { _get, _isEmpty, _isEqual, _keys, addUnit } from "@/utils";
import { getProductFieldApi } from "@/api/erp/product";
import { VuePrintLast } from "@/shop/print/vue-print-last";
import { cmToPx } from "@/shop/print/utils";
import mixins from "@/mixins/mixins";

// 纸张大小
const PaperWidth = cmToPx(21.5);
const PaperHeight = cmToPx(14);

const PageType = {
  inbound: "入库单",
  inbound3: "入库单",
  outbound: "出库单",
  outbound3: "出库单",
  sale: "销售单",
  saleReturn: "销售退货单",
  purchase: "采购单",
  purchaseReturn: "采购退货单",
  produce: "生产工单",
  receivable: "财务收款单",
  payable: "财务收款单",
};

const Func = {
  inbound: getInboundDetailApi,
  inbound3: getInboundDetailApi,
  outbound: getOutboundDetailApi,
  outbound3: getOutboundDetailApi,
  sale: getSaleDetailApi,
  saleReturn: getSaleReturnDetailApi,
  purchase: getPurchaseDetailApi,
  purchaseReturn: getPurchaseReturnDetailApi,
  produce: getProduceDetailApi,
  receivable: getReceivableDetailApi,
  payable: getPayableDetailApi,
};

export default {
  mixins: [mixins],
  data() {
    return {
      option: {},
      node: {},
      header: "",
      FieldList: [],

      columns: [],

      isA4: false,

      fees: {},
      feesList: [],

      // 生产订单
      isProductIon: false,

      // 默认打印
      TabValue: "default",

      // 判断是不是采购定制单
      isPurchase: false,
    };
  },
  async onLoad(option) {
    this.isA4 = ["outbound", "inbound"].includes(option?.page_type) || _isEqual(option.isA4, "true");

    // 生产订单
    this.isProductIon = _isEqual(option.orderType, "PRODUCTION");

    // 采购定制单
    this.isPurchase = _isEqual(option.orderType, "CUSTOMIZED");

    this.option = option;
    this.header = _get(PageType, option?.page_type);

    uni.setNavigationBarTitle({title: this.header});

    if (!this.isPurchase) {
      await this.getFeesList();
      this.getColumnList();
      this.getExtendList();
    }

    this.getList();
  },

  methods: {
    getList() {
      this.loading = true;

      if (this.isPurchase) {
        getPurchaseInfoApi({orderCode: this.option.orderCode})
          .then(res => {
            const data = res.data;
            this.TabValue = "CustomTable";

            data.isCustomizedMaterials = !_isEmpty(data.customizedMaterials);

            try {
              const list = JSON.parse(_get(data, "customizedMaterials.0.customTable"));
              data.CustomTable = _get(list, "0.data") || [];
              data.CustomTableConfig = _get(list, "0.config") || {};
            } catch (e) {
              console.error(e);
            }

            this.node = data;
          })
          .finally(() => {
            this.loading = false;
          });
        return false;
      }

      if (this.isProductIon) {
        // 判断是否是销售
        const isSale = ["sale"].includes(this.option.page_type);
        const F = isSale ? getProduceOrderDetailApi : getProduceOrderCodeDetailApi;

        F({orderCode: this.option.orderCode})
          .then(res => {
            const data = res.data;
            this.feesList = _keys(data.fees).map((key) => ({
              key,
              isPrint: true,
              value: data.fees[key],
              label: this.fees[key],
              notA4: this.isA4,
            }));

            data.details = (data.productDetails || []).map((item, index) => ({
              ...item,
              __index__: index + 1,
              total: item.price * item.productQuantity,
            }));

            data.isCustomizedMaterials = !_isEmpty(data.customizedMaterials);

            if (data.isCustomizedMaterials) {
              this.TabValue = "CustomTable";
              try {
                const list = JSON.parse(_get(data, "customizedMaterials.0.customTable"));
                data.CustomTable = _get(list, "0.data") || [];
                data.CustomTableConfig = _get(list, "0.config") || {};

                // console.log(data.CustomTable);
              } catch (e) {
                console.error(e);
              }
            }

            data.isCustomizedBoards = !_isEmpty(data.customizedBoards);

            if (data.isCustomizedBoards) {
              this.TabValue = "CustomizedBoards";

              try {
                const list = _get(data, "customizedBoards.0");
                data.CustomizedBoards = _get(list, "boards.0.items")?.map((v, index) => ({
                  ...v,
                  id: v.rid,
                  __index__: index + 1,
                }));

                data._result_ = _get(list, "result");

              } catch (e) {
                console.error(e);
              }
            }

            this.node = data;
          });

        return false;
      }

      this.TabValue = "default";

      Func[this.option.page_type]?.({id: this.option.id})
        .then(res => {
          const list = res.data;

          list.details = (list.details || []).map((item, index) => ({
            ...item,
            __index__: index + 1,
            total: item.price * item.productQuantity,
          }));

          /* list.details = [
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details,
            ...list.details
          ].slice(0, 40); */

          this.feesList = _keys(list.fees).map((key) => ({
            key,
            isPrint: true,
            value: list.fees[key],
            label: this.fees[key],
            notA4: this.isA4,
          }));
          this.node = list;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 获取额外字段
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

    // 获取其它费用
    getFeesList() {
      return getOtherCostListApi()
        .then(res => {
          this.fees = res.data;
        });
    },

    onPrint(el) {
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
    rootStyle() {
      return {
        "--ko-paper-width": addUnit(PaperWidth),
        "--ko-paper-height": addUnit(PaperHeight),
        "--ko-paper-min-height": "16px",
      };
    },

    // 停用绑定数据
    bindObj() {
      return {
        isA4: this.isA4,
        columns: this.columns,
        node: this.node,
        feesList: this.feesList,
        header: this.header,
        option: this.option,
        rootStyle: this.rootStyle,
      };
    },
  },
};

// #endif
