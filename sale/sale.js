import { CONFIG, PageEnums } from "@/utils/config";
import { _deepCopy, _groupBy, _isBoolean, _isEmpty, _isEqual, _isString, _keys, _pick, CustomToast } from "@/utils";
import { getSaleDetailApi, printSaleApi, quickOutApi } from "@/api/erp/sale";
import { getOrderCodeDetailApi } from "@/api/erp/produce";
import mixins from "@/mixins/mixins";
import reLogin from "@/mixins/re-login";

const PageMenu = [
  {
    label: "待处理",
    perm: "SALE_LIST",
    func: 0,
  },
  {
    label: "待付款",
    perm: "SALE_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "SALE_HISTORY",
    func: 2,
  },
];

export default {
  mixins: [mixins, reLogin],
  data() {
    return {
      loading: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
        orderAddress: "",
      },
      noMore: false,

      node: {},
      nodeIndex: null,

      noRefresh: false,

      isReturn: false,

      isNewList: false,

      PAGE_MENU: _deepCopy(PageMenu),

      visible: false,
      inadequate: [],
    };
  },
  methods: {
    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      if (this.isProductionOrder(item.orderType)) {
        uni.navigateTo({
          url: PageEnums.produceWork + `?id=${item.orderCode}&ADDED_TYPE=packing&FORM=SALE&isAgain=${_isEqual(item.status, "WAIT_PAY")}`,
        });
        return false;
      }

      if (this.sBill) {
        uni.navigateTo({
          url: PageEnums.shopping + `?PAGE_TYPE=SALE&id=${item.id}`,
        });
        return false;
      }

      this.jumpAddedSale({id: item.id}, this.nodeIndex);
    },

    onToDetails(item) {
      if (this.isProductionOrder(item.orderType)) {
        uni.setStorageSync("TO_DETAILS", true);

        uni.navigateTo({
          url: PageEnums.produceDetails + `?id=${item.orderCode}&FORM=SALE`,
        });
        return false;
      }
      this.onJumpDetails(item, "sale");
    },

    onTrigger(event) {
      let {path} = event.item || {};
      if (path) {
        this.noRefresh = true;
        this.isNewList = true;

        if (_isEqual(PageEnums.NewSale, path)) {
          path = !this.sBill ? PageEnums.NewSale : (PageEnums.shopping + "?PAGE_TYPE=SALE");
        }

        uni.navigateTo({url: path});
      }
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;

      this.jumpSaleAddedDocuments({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount"]),
        FORM: "SALE",
        noUnable: true,
      });
    },
    // 申请退货
    onReturn(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      this.isReturn = true;
      this.jumpSaleReturn({order_id: item.id});
    },

    onRowClick(row) {
      this.onToDetails(row, "sale");
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      item.func && this[item.func] && this[item.func](_deepCopy(this.node), this.nodeIndex);
      !(item.func && this[item.func]) && this.$refs.UASRef.close();
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      printSaleApi(data)
        .then(() => {
          CustomToast({
            title: "请求成功",
          });
        });
    },

    // 更新列表数据
    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;
      const Func = _isEqual("customized", info?.produceType) ? getOrderCodeDetailApi : getSaleDetailApi;

      !id && (this.uType = null);

      id && Func({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data, isPayment);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 快捷出库
    onQuickOut(item, index) {
      this.inadequate = [];
      uni.showModal({
        title: "温馨提示",
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后扣除库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            quickOutApi(item)
              .then((resp) => {
                const list = _deepCopy(_groupBy(resp.data, (item) => item.className));
                this.inadequate = _keys(list).map(key => ({
                  key,
                  children: list[key],
                }));

                if (_isEmpty(resp.data)) {
                  uni.showToast({title: "出库成功"});
                } else {
                  this.visible = true;
                }
              });
          }
        },
      });
    },

    // 生成订单二维码
    onGenerateCode(item) {
      this.$refs.GCRef.open(item.orderCode);
    },

    // 切换样式
    onSwitchStyle() {
      this.setSaleStyle();
      this.$nextTick(() => {
        const sSale = this.sSale;
        if (sSale) {
          uni.redirectTo({url: PageEnums.saleOrderList});
        } else {
          uni.redirectTo({url: PageEnums.sale});
        }
      });
    },
  },
  computed: {
    actionList() {
      const node = this.node;
      return [
        {
          name: "分享订单",
          openType: "share",
          perm: "SHARE_ORDER",
          params: {
            title: `分享订单！`,
            path: PageEnums.produceWork,
            query: {
              PAGE_TYPE: "SHARE_ORDER",
              FORM: "SALE",
              queryList: node,
            },
          },
        },
        {
          name: "生成订单二维码",
          func: "onGenerateCode",
        },
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
          perm: "SALE_RETURN_ADD",
        },
        {
          name: "快捷出库",
          func: "onQuickOut",
          status: ["WAIT_PAY"],
          perm: "SALE_QUICK_OUT",
          color: "#e43d33",
        },
        {
          name: "取消订单",
          func: "cancelSale",
          status: ["CREATED"],
          perm: "SALE_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "WAIT_PAY"],
          perm: "SALE_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removeSale",
          status: ["CANCELLED", "CREATED"],
          perm: "SALE_DELETE",
        },
      ]
        .filter(item => {
          if (_isEqual(item.func, "onGenerateCode")) return true;

          const isStatus = item.status?.includes?.(node.status);

          if (_isEqual(item.func, "onJump")) {
            return this.isEditorButton(node) && isStatus;
          }

          const isPerm = this.isPerm(item.perm);

          if (_isEqual("onReturn", item.func)) {
            return isPerm && isStatus && !this.isProductionOrder(item.orderType);
          }

          if (_isEqual("onQuickOut", item.func)) {
            return isPerm && isStatus;
          }

          return isPerm && isStatus || (isPerm && _isEqual(item.openType, "share") && this.isProductionOrder(node.orderType));
        });
    },
    // 判断是不是要显示编辑按钮
    isEditorButton() {
      return (node) => {
        if (_isEqual(node.status, "CREATED") && this.isProductionOrder(node.orderType)) {
          return this.isPerm("SALE_PRODUCE_UPDATE");
        }

        // 是否可以重新下单
        if (_isEqual(node.status, "WAIT_PAY")) {
          return this.isPerm("SALE_RE_ORDER");
        }

        return !_isEqual(node.status, "FINISHED") && this.isPerm("SALE_UPDATE");
      };
    },

    // 下拉列表数据
    MOVABLE_LIST() {
      const produceEnable = (this.GET_CONFIG_INFO || {})?.produceEnable || false;
      const dProduceEnable = _isBoolean(produceEnable) ? !produceEnable : false

      return [
        // #ifdef MP
        {
          text: "分享",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.shopping,
            query: {
              PAGE_TYPE: "SALE_SHARE",
            },
          },
          perm: "SALE_SHARE",
        },
        {
          text: "板材",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.produceWork,
            query: {
              PAGE_TYPE: "SHARE_PRODUCE_PACKING",
              ADDED_TYPE: "packing",
              FORM: "SALE",
            },
          },
          disabled: dProduceEnable,
          perm: "CNC_ADD_CUSTOMIZED_BOARD",
        },
        // #endif
        /*  {
           text: "生产",
           iconfont: "icon-shengchan",
           path: PageEnums.produceWork + "?ADDED_TYPE=common&FORM=SALE",
         }, */
        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          perm: "SALE_PRODUCE_ADD",
          disabled: dProduceEnable,
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx&FORM=SALE",
        },
        // #endif
        {
          text: "板材",
          iconfont: "icon-ziyuanicon",
          perm: "CNC_ADD_CUSTOMIZED_BOARD",
          disabled: dProduceEnable,
          path: PageEnums.produceWork + "?ADDED_TYPE=packing&FORM=SALE",
        },
        {
          text: "开单",
          iconfont: "icon-tianjia",
          perm: "SALE_ADD",
          path: PageEnums.NewSale,
        },
      ];
    },
  },

  // #ifdef MP
  // 分享相关
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
