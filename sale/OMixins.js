import { PageEnums } from "@/utils/config";
import {
  cancelSaleApi,
  getCustomerAddressListApi,
  getCustomerListApi,
  removeSaleApi,
  submitSaleApi,
} from "@/api/erp/sale";
import { _isEmpty, _isEqual, _isNumber, _keys, _pick } from "@/utils";

export default {
  name: "OMixins",
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
      if (_isEqual(this.uType, 1)) this.updateList();
    },

    // 跳转到添加修改销售订单
    jumpAddedSale(query = {}, index) {
      let q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.NewSale}${q}`,
      });
    },

    // 跳转到销售订单添加付款单据
    jumpSaleAddedDocuments(query) {
      this?.$refs?.TPRef?.open(query);
    },

    // 取消销售订单
    cancelSale(item, index, flag = false) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelSaleApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.$set(this[this.isSearch ? "sList" : "oList"], index, {...item, status: "CANCELLED"});
                this.updateAddressNode(item);
              });
          }
        },
      });
    },

    // 提交销售订单
    submitSale(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该销售订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            submitSaleApi(item)
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

    // 删除销售订单
    removeSale(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此销售订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeSaleApi(item)
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

    // 申请退货
    jumpSaleReturn(query) {
      this.noRefresh = true;
      this.isNewList = _isEmpty(query);

      let q = this.getQueryString(query);
      uni.navigateTo({
        url: `${PageEnums.saleRefund}${q}`,
      });
    },

    // 更新地址列表
    updateAddressNode(node) {
      if (_isEmpty(node)) return false;

      if (_isEqual(this.rootId, node.supplierId)) {
        const orderAddress = node.orderAddress;
        getCustomerAddressListApi({
          id: this.rootId,
          address: orderAddress || "",
          queryNoAddress: !orderAddress,
        })
          .then(res => {
            // console.log(res, node, this.aId);
            const data = res.data;
            this.aList = this.onMergeArrays(this.aList, data, "id");

            if (this.aId && !this.oList.length) {
              this.getOrderList(true);
            }
          });
      }

      if (this.rootId) {
        getCustomerListApi({id: this.rootId})
          .then(res => {
            const list = (res.data || []).map(this.getCNode);
            this.cList = this.onMergeArrays(this.cList, list, "id");
            // console.log(this.cList);
          });
      }

    },

    // 更新数据s
    onProcessingListData(data, isPayment = false) {
      const L = this[this.isSearch ? "sList" : "oList"] || [];
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

      // if (_isEqual(supplierId, this.rootId) && !_isEqual(orderAddress, dz.address)) {
      //   this.getAddressList(true, this.aId);
      // }

      this.uType = null;
    },

    // 处理跳转
    onTrigger(event) {
      let {path} = event.item || {};
      if (path) {
        if (_isEqual(PageEnums.NewSale, path)) {
          this.uType = 1;
          path = !this.sBill ? PageEnums.NewSale : (PageEnums.shopping + "?PAGE_TYPE=SALE");
        }

        uni.navigateTo({url: path});
      }
    },

    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.uType = 1;

      if (this.isProductionOrder(item.orderType)) {
        uni.navigateTo({url: PageEnums.produceWork + `?id=${item.orderCode}&ADDED_TYPE=packing&FORM=SALE&isAgain=${_isEqual(item.status, "WAIT_PAY")}`});
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

  },
  computed: {
    // 判断是不是生产工单
    isProductionOrder() {
      return (type) => ["PRODUCTION", "CUSTOMIZED"].includes(type);
    },
  },
};
