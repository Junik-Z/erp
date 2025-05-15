import mixins from "@/mixins/mixins";
import reLogin from "@/mixins/re-login";
import PurchaseMixins from "./PurchaseMixins";
import { PageEnums } from "@/utils/config";
import { _deepCopy, _isEqual, _isString, _pick, CustomToast } from "@/utils";
import { getPurchaseDetailApi, printA4PurchaseApi, printPurchaseApi, quickInApi } from "@/api/erp/purchase";

const PageMenu = [
  {
    label: "待处理",
    perm: "PURCHASE_LIST",
    func: 0,
  },
  {
    label: "待付款",
    perm: "PURCHASE_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "PURCHASE_HISTORY",
    func: 2,
  },
];

export default {
  mixins: [mixins, PurchaseMixins, reLogin],
  data() {
    return {
      MOVABLE_LIST: [
        // #ifdef MP
        {
          text: "分享",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.NewPurchase,
            query: {
              PAGE_TYPE: "ADDED_PURCHASE",
            },
          },
          perm: "PURCHASE_SHARE",
        },
        // #endif

        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx&FORM=PURCHASE",
          perm: "PURCHASE_CUSTOMIZED_ADD",
        },
        // #endif

        {
          text: "开单",
          iconfont: "icon-tianjia",
          path: PageEnums.NewPurchase,
          perm: "PURCHASE_ADD",
        },
      ],

      node: {},
      nodeIndex: null,

      noRefresh: false,
      // 退货申请a
      isReturn: false,

      isNewList: false,

      PAGE_MENU: _deepCopy(PageMenu),
    };
  },
  methods: {
    // 切换样式
    onSwitchStyle() {
      this.setPurchaseStyle();

      this.$nextTick(() => {
        const sPurchase = this.sPurchase;

        if (sPurchase) {
          uni.redirectTo({url: PageEnums.purchaseOrder});
        } else {
          uni.redirectTo({url: PageEnums.purchase});
        }
      });
    },


    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;

      if (_isEqual(item.orderType, "CUSTOMIZED")) {
        // #ifdef MP
        uni.showModal({
          title: "温馨提示",
          content: "定制表格，请在电脑端进行编辑。",
          showCancel: false,
        });

        this.noRefresh = false;
        // #endif

        // #ifndef MP
        uni.navigateTo({url: PageEnums.produceWork + `?ADDED_TYPE=xlsx&FORM=PURCHASE&id=${item.orderCode}`});
        // #endif
      } else {
        this.jumpAddedPurchase({id: item.id});
      }
    },

    onTrigger(event) {
      this.noRefresh = true;
      const {path} = event.item || {};

      if (path) {
        this.isNewList = true;
        uni.navigateTo({url: path});
      }
    },

    // 申请退货
    onReturn(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      this.isReturn = true;
      this.jumpAddedReturnPurchase({order_id: item.id});
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;
      this.jumpDocumentsTicket({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount", "orderType"]),
        FORM: "PURCHASE",
        noUnable: true,
      });
    },

    onRowClick(row) {
      this.onJumpDetails(row, "purchase");
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex, "footer");
    },

    // 开启打印
    onPrint(item, index, type) {
      this.$refs.PLRef.open({orderId: item.id, type});
    },
    // 开始打印
    startPrint(data) {
      if (_isEqual(data.type, "footer")) {
        printA4PurchaseApi(data)
          .then(() => {
            CustomToast({
              title: "请求成功",
            });
          });
      } else {
        printPurchaseApi(data)
          .then(() => {
            CustomToast({
              title: "请求成功",
            });
          });
      }
    },

    // 更新列表数据
    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getPurchaseDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data, isPayment);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 快捷入库
    onQuickIn(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后增加库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            quickInApi({orderCode: item.orderCode})
              .then(() => {
                uni.showToast({title: "入库成功"});
              });
          }
        },
      });
    },

    // 确定开始结束时间了
    onCalendarConfirm(event) {
      if (event) {
        const r = event.range || {};
        this.queryList.startTime = r.before ? r.before + " 00:00:00" : "";
        this.queryList.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.queryList.startTime = "";
        this.queryList.endTime = "";
      }
    },

    // #ifdef H5
    // 生成销售单
    onGenerateSale(item) {
      uni.navigateTo({url: PageEnums.produceWork + `?ADDED_TYPE=xlsx&FORM=PURCHASE&id=${item.orderCode}&isGenerateSales=true`});
    },
    // #endif
  },
  computed: {
    actionList() {
      const node = this.node;
      return [
        {
          name: "打印采购单(A4)",
          func: "onPrint",
          perm: "PURCHASE_PRINT",
          status: [],
        },
        {
          name: "快捷入库",
          func: "onQuickIn",
          status: ["FINISHED"],
          perm: "PURCHASE_QUICK_IN",
          color: "#e43d33",
        },
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
          perm: "PURCHASE_RETURN_ADD",
        },
        {
          name: "取消订单",
          func: "cancelPurchase",
          status: ["CREATED"],
          perm: "PURCHASE_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
          perm: "PURCHASE_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removePurchase",
          status: ["CANCELLED", "CREATED"],
          perm: "PURCHASE_DELETE",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);
          const isStatus = item?.status?.includes(node.status);

          if (_isEqual(item.func, "onPrint")) {
            return isPerm && !_isEqual(node.orderType, "CUSTOMIZED");
          }

          if (_isEqual(item.func, "onReturn")) {
            return isPerm && !_isEqual(node.orderType, "CUSTOMIZED");
          }

          if (_isEqual(item.func, "onJump")) {
            return this.isEditorButton(node) && isStatus;
          }

          if (_isEqual(item.func, "onQuickIn")) {
            return (_isEqual(this.GET_PAGE_MENU_FUNC, 1) && isStatus) && isPerm;
          }

          return isStatus && isPerm;
        });
    },

    // 判断是不是要显示编辑按钮
    isEditorButton() {
      return (node) => {
        if (_isEqual(this.GET_PAGE_MENU_FUNC, 0) && _isEqual(node.orderType, "CUSTOMIZED")) {
          return this.isPerm("PURCHASE_CUSTOMIZED_UPDATE");
        }

        if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) {
          // 待付款生产工单不能编辑
          if (_isEqual(node.orderType, "CUSTOMIZED")) {
            return false;
          }

          // 是否可以重新下单
          return this.isPerm("PURCHASE_UPDATE");
        }

        return !_isEqual(this.GET_PAGE_MENU_FUNC, 2) && this.isPerm("PURCHASE_UPDATE");
      };
    },
  },

  // #ifdef MP
  onShareAppMessage(res) {
    const obj = res.target.dataset.params;
    return new Promise(async (resolve) => {
      const query = await this._GET_SHARE_APP_PARAMS_(obj);

      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;
      console.log(query);
      resolve(query);
    });
  },
  // #endif
};
