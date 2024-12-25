import { PageEnums } from "@/utils/config";
import {
  cancelSaleApi,
  cancelSaleReturnApi,
  confirmSaleReturnApi,
  removeSaleApi,
  removeSaleReturnApi,
  submitSaleApi,
} from "@/api/erp/sale";

export default {
  name: "SaleMixins",
  data() {
    return {};
  },
  methods: {
    getList() {
    },

    // 跳转到添加修改销售订单
    jumpAddedSale(query = {}) {
      let q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.editSale}${q}`,
      });
    },

    // 跳转到销售订单添加付款单据
    jumpSaleAddedDocuments(query) {
      let q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.ticket}${q}`,
      });
    },

    // 取消销售订单
    cancelSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelSaleApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList(true);
              });
          }
        },
      });
    },

    // 提交销售订单
    submitSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该销售订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            submitSaleApi(item)
              .then(() => {
                uni.showToast({title: "提交成功"});
                this.list = [];
                this.isHistory = true;
                this.getList(true);
              })
              .finally(() => {
                this.$set(item, "__s_loading__", false);
              });
          }
        },
      });
    },

    // 删除销售订单
    removeSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此销售订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeSaleApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList(true);
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },

    // 申请退货
    jumpSaleReturn(query) {
      let q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.saleRefund}${q}`,
      });
    },

    // 取消销售退货单
    cancelRefundSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelSaleReturnApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList(true);
              });
          }
        },
      });
    },

    // 提交销售退货单
    submitRefundSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该销售退货订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmSaleReturnApi(item)
              .then(() => {
                uni.showToast({title: "提交成功"});
                this.list = [];
                this.isHistory = true;
                this.getList(true);
              })
              .finally(() => {
                this.$set(item, "__s_loading__", false);
              });
          }
        },
      });
    },

    // 删除销售退货单
    removeRefundSale(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此销售退货订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeSaleReturnApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList(true);
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
