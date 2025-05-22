import { PageEnums } from "@/utils/config";
import mixins from "@/mixins/mixins";
import reLogin from "@/mixins/re-login";
import { cancelPayableApi, finishPayableApi } from "@/api/erp/finance";
import { _deepCopy, _pick } from "@/utils";

export default {
  data() {
    return {
      node: {},
      nodeIndex: null,
    };
  },
  mixins: [mixins, reLogin],

  methods: {
    onSwitchStyle() {
      this.setApStyle();
      this.$nextTick(() => {
        const sApStyle = this.sApStyle;
        if (sApStyle) {
          uni.redirectTo({url: PageEnums.financeApPay});
        } else {
          uni.redirectTo({url: PageEnums.financePay});
        }
      });
    },
    // 取消订单
    onCancel(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `如果销售订单未出库或仓库计划取消订单，库存将保持原状。若商品已经出库，系统会自动将其退回仓库。请仓库工作人员在商品退回后进行仔细盘点。`,
        success: (res) => {
          if (res.confirm) {
            cancelPayableApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.onRemoveList(index);
                this?.updateAddressNode?.(item);
              });
          }
        },
      });
    },
    // 完成清帐
    onConfirm(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请仔细核对金额是否准确。未确认的单据将自动确认，确认后入账。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            finishPayableApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this[this.isSearch ? "sList" : "oList"]?.[index] && this.$set(this[this.isSearch ? "sList" : "oList"], index, {
                  ...item,
                  status: "FINISHED",
                });
                this?.updateAddressNode?.(item);
              });
          }
        },
      });
    },
    // 添加票据
    onAddedTicket(item, index) {
      this.node = _deepCopy(item);
      this.nodeIndex = _deepCopy(index);
      this.$refs.TPRef.open({
        ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId", "totalAmount"]),
        isReceivable: false,
        FORM: "PAY_LISE",
      });
    },

    // #ifdef MP
    // 点击更多按钮
    onActionClick(item, index) {
      this.node = _deepCopy(item);
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },

    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex, "footer");
    },
    // #endif
  },

  computed: {
    // #ifdef MP
    actionList() {
      const node = this.node;
      return [
        {
          name: "取消订单",
          func: "onCancel",
          status: ["CREATED"],
          perm: "FINANCE_PAYABLE_CANCEL",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);
          const isStatus = item?.status?.includes(node.status);
          return isStatus && isPerm;
        });
    },
    // #endif
  },
};
