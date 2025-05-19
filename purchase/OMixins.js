import { PageEnums } from "@/utils/config";
import {
  cancelPurchaseApi,
  confirmPurchaseApi,
  getSupplierAddressListApi,
  getSupplierListApi,
  removePurchaseApi,
} from "@/api/erp/purchase";
import { _isEmpty, _isEqual, _isNumber, _keys, _pick } from "@/utils";

export default {
  name: "PurchaseMixins",
  data() {
    return {
      uType: null, // 更新类型： 1: 开单,修改
    };
  },
  onShow() {
    this.upList();
  },
  methods: {
    // 更新列表
    upList() {
      console.log(this.uType);

      if (_isEqual(this.uType, 1)) this.updateList();
    },

    // 添加采购单
    jumpAddedPurchase(query) {
      const q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.NewPurchase}${q}`,
      });
    },

    // 取消采购单
    cancelPurchase(item, index, flag = false) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelPurchaseApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.$set(this[this.isSearch ? "sList" : "oList"], index, {...item, status: "CANCELLED"});
                this.updateAddressNode(item);
              });
          }
        },
      });
    },

    // 提交采购订单
    submitPurchase(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该采购订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmPurchaseApi(item)
              .then(() => {
                uni.showToast({title: "提交成功"});
                this.$set(this[this.isSearch ? "sList" : "oList"], index, {...item, status: "WAIT_PAY"});
                this.updateAddressNode(item);
              })
              .finally(() => {
                this.$set(item, "__s_loading__", false);
              });
          }
        },
      });
    },

    // 删除采购单
    removePurchase(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此采购订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removePurchaseApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});

                if (_isNumber(index)) {
                  this[this.isSearch ? "sList" : "oList"].splice(index, 1);
                }
                this.updateAddressNode(item);
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },

    // 跳转到对账
    jumpDocumentsTicket(query) {
      this?.$refs?.TPRef?.open(query);
    },

    onTrigger(event) {
      let {path} = event.item || {};
      if (path) {
        this.uType = 1;
        uni.navigateTo({url: path});
      }
    },

    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.uType = 1;

      if (_isEqual(item.orderType, "CUSTOMIZED")) {
        // #ifdef MP
        uni.showModal({
          title: "温馨提示",
          content: "定制表格，请在电脑端进行编辑。",
          showCancel: false,
        });
        // #endif

        // #ifndef MP
        uni.navigateTo({url: PageEnums.produceWork + `?ADDED_TYPE=xlsx&FORM=PURCHASE&id=${item.orderCode}`});
        // #endif
      } else {
        this.jumpAddedPurchase({id: item.id});
      }
    },

    // 更新数据
    onProcessingListData(data, isPayment = false) {
      const L = this[this.isSearch ? "sList" : "oList"];

      const index = L.findIndex(v => v.id === data.id);
      let node = _isEmpty(this.node) ? L.at(-1) : this.node;
      node = _isEmpty(node) ? data : node;
      node = _pick(data, _keys(node));
      const {supplierId, orderAddress} = data || {};

      this.updateAddressNode(node);

      if (L.some(v => _isEqual(v.orderCode, data.orderCode)) && _isEqual(supplierId, this.rootId)) {
        this[this.isSearch ? "sList" : "oList"] = L.map(v => {
          if (_isEqual(v.orderCode, data.orderCode)) {
            v = {...v, ..._pick(data, ["totalAmount"])};
          }
          return v;
        });
      }

      if (isPayment && index > -1) {
        this.$set(this[this.isSearch ? "sList" : "oList"], index, node);
        this.uType = null;
        return false;
      }

      const dz = this.aList.find(v => _isEqual(v.id, this.aId)) || {};

      if (_isEqual(supplierId, this.rootId) && _isEqual(orderAddress, dz.address)) {
        if (index > -1) {
          this.$set(this[this.isSearch ? "sList" : "oList"], index, node);
        } else {
          this[this.isSearch ? "sList" : "oList"]?.unshift(node);
        }
      }

      this.uType = null;
    },

    // 更新地址列表
    updateAddressNode(node) {
      if (_isEmpty(node)) return false;
      if (_isEqual(this.rootId, node.supplierId)) {
        const orderAddress = node.orderAddress;

        getSupplierAddressListApi({
          id: this.rootId,
          address: orderAddress || "",
          queryNoAddress: !orderAddress,
        })
          .then(res => {
            // console.log(res, node);
            const data = res.data;
            this.aList = this.onMergeArrays(this.aList, data, "id");
            if (this.aId && !this.oList.length) {
              this.getOrderList(true);
            }
          });
      }

      if (this.rootId) {
        getSupplierListApi({id: this.rootId})
          .then(res => {
            const list = (res.data || []).map(this.getCNode);
            this.cList = this.onMergeArrays(this.cList, list, "id");
            // console.log(this.cList);
          });
      }
    },
  },
};
