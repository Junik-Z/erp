import { PageEnums } from "@/utils/config";
import {
  cancelPurchaseApi,
  cancelPurchaseReturnApi,
  confirmPurchaseApi,
  confirmPurchaseReturnApi,
  removePurchaseApi,
  removePurchaseReturnApi,
} from "@/api/erp/purchase";
import { _isNumber, _isString } from "@/utils";

export default {
  name: "PurchaseMixins",
  data() {
    return {};
  },
  methods: {
    getList() {
    },

    // 添加采购单
    jumpAddedPurchase(query) {
      const q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.editPurchase}${q}`,
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
                // this.getList(true);

                if (_isNumber(index) && (!flag || _isString(flag))) {
                  this.list.splice(index, 1);
                }
                flag === true && this.updateList();
              });
          }
        },
      });
    },

    // 提交采购订单
    submitPurchase(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该采购订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmPurchaseApi(item)
              .then(() => {
                uni.showToast({title: "提交成功"});
                this.list = [];
                this.tab = 1;
                this.getList(true);
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
                  this.list.splice(index, 1);
                }
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
      /* const q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.financeTicket}${q}`,
      }); */
    },

    // 添加采购单退货
    jumpAddedReturnPurchase(query) {
      const q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.refundPurchase}${q}`,
      });
    },


    // 取消采购退货单
    cancelReturnPurchase(item, index, flag = false) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelPurchaseReturnApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                if (_isNumber(index) && !flag) {
                  this.list.splice(index, 1);
                }
                flag && this.updateList();
              });
          }
        },
      });
    },

    // 提交采购退货订单
    submitReturnPurchase(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该采购退货订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmPurchaseReturnApi({id: item.id})
              .then(() => {
                uni.showToast({title: "提交成功"});
                if (_isNumber(index)) {
                  this.list.splice(index, 1);
                }
              })
              .finally(() => {
                this.$set(item, "__s_loading__", false);
              });
          }
        },
      });
    },

    // 删除采购退货单
    removeReturnPurchase(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此采购退货订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removePurchaseReturnApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                if (_isNumber(index)) {
                  this.list.splice(index, 1);
                }
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },

  },
};
