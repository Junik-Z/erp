import {
  addedPaidOrderApi,
  addedReturnedOrderApi,
  confirmPaidOrderApi,
  confirmReturnedOrderApi,
  editPaidOrderApi,
  editReturnedOrderApi,
  finishPayableApi,
  finishReceivableApi,
  getAchievableListApi,
  getPaidOrderListApi,
  getPayableAchievableApi,
  getReturnedOrderListApi,
} from "@/api/erp/finance";
import { _deepCopy, _get, _isEmpty, _pick, _sum, CustomToast, transferYuan, yuanToPoints } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import mixins from "@/mixins/mixins";
import {
  addedSalePaidOrderApi,
  addedSaleReturnedOrderApi,
  editSalePaidOrderApi,
  editSaleReturnedOrderApi,
  getSalePaidOrderApi,
  getSaleReturnedOrderApi,
} from "@/api/erp/sale";
import {
  addedSPurchaseReturnedOrderApi,
  addedSPurchaseReturnedPaidOrderApi,
  editPurchaseReturnedOrderApi,
  editPurchaseReturnedPaidOrderApi,
  getPurchaseReturnedOrderApi,
  getPurchaseReturnedPaidOrderApi,
} from "@/api/erp/purchase";

export default {
  name: "TicketMixins",
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      option: {},

      list: [],
      loading: false,

      // 是否是要支付的订单
      isRefund: false,
      noMore: false,

      visible: false,

      form: {
        totalAmount: "",
        voucher: "",
        remark: "",
      },
      rules: {
        totalAmount: {
          rules: [
            {
              required: true,
              errorMessage: "请输入单据金额",
            },
          ],
        },
      },

      sLoading: false,
      isEdit: false,
      cLoading: false,

      // 判断是付是应收款模块进来的
      isReceivable: false,

      confirmationList: [],

      // 处理不可完成订单
      noUnable: true,

      // 处理付款详情
      isDetails: true,

      last: 0,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "日期",
          prop: "updateTime",
        },
        {
          label: "凭证",
          prop: "voucher",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "voucher")),
                  size: 42,
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "金额",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [_this.toYuan(row.totalAmount)]);
          },
        },
        {
          label: "操作",
          width: 260,
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  watch: {
    "option.totalAmount"() {
      this.getLast();
    },
    list: {
      handler() {
        this.getLast();
      },
      deep: true,
    },
  },
  methods: {
    setOption(option) {
      this.last = 0;
      this.confirmationList = [];
      this.isEdit = false;
      this.form = _deepCopy(this.form);
      this.list = [];

      this.option = option;
      this.noUnable = !!option.noUnable;
      this.isDetails = !!option.isDetails;

      // 销售退货和采购和采购定制的时候需要进行付款
      this.isRefund = ["SALE_RETURN", "PURCHASE", "CUSTOMIZED"].includes(option.orderType);

      // 是否是应收模块
      this.isReceivable = !!option.isReceivable;

      // #ifdef MP
      this.$refs?.FormRef?.setRules?.(this.rules);
      // #endif

      this.getList();
    },

    getList() {
      this.loading = true;

      const obj = _pick(_deepCopy(this.option), ["supplierId", "purchaserId", "orderCode", "orderType"]);

      // 获取最新的接口
      const Event = {
        SALE: getSalePaidOrderApi,
        SALE_RETURN: getSaleReturnedOrderApi,
        PURCHASE: getPurchaseReturnedOrderApi,
        PURCHASE_RETURN: getPurchaseReturnedPaidOrderApi,
        RECEIVABLE: getPaidOrderListApi,
        PAY_LISE: getReturnedOrderListApi,
      }[this.option.FORM];

      const Func = this.isRefund ? getReturnedOrderListApi : getPaidOrderListApi;

      ;(Event || Func)({...obj, pageSize: 100, pageNum: 0})
        .then(res => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 计算剩余金额
    getLast() {
      this.form = _deepCopy(this.$options.data().form);
      const last = Number(this.option.totalAmount);
      const paid = _sum(this.list?.map((item) => item.totalAmount || 0));
      this.last = (isNaN(last) ? 0 : last) - (isNaN(paid) ? 0 : paid);
      this.form.totalAmount = this.toYuan(this.last);
    },

    // 添加单据
    addedTicket(node) {
      this.confirmationList = [];
      this.isEdit = !_isEmpty(node);

      const params = _isEmpty(node) ? _deepCopy(this.$options.data().form) : _deepCopy(node);
      params.totalAmount = transferYuan(params.totalAmount);

      this.form = params;

      // #ifdef MP
      setTimeout(() => {
        this.$refs.FormRef.clearValidate();
      }, 60);
      // #endif
    },

    // 请求提交
    askSubmit() {
      this.sLoading = true;
      const Func = this.isEdit
        ? this.isRefund ? editReturnedOrderApi : editPaidOrderApi
        : this.isRefund ? addedReturnedOrderApi : addedPaidOrderApi;

      const Event = {
        SALE: this.isEdit ? editSalePaidOrderApi : addedSalePaidOrderApi,
        SALE_RETURN: this.isEdit ? editSaleReturnedOrderApi : addedSaleReturnedOrderApi,
        PURCHASE: this.isEdit ? editPurchaseReturnedOrderApi : addedSPurchaseReturnedOrderApi,
        PURCHASE_RETURN: this.isEdit ? editPurchaseReturnedPaidOrderApi : addedSPurchaseReturnedPaidOrderApi,
        RECEIVABLE: this.isEdit ? editPaidOrderApi : addedPaidOrderApi,
        PAY_LISE: this.isEdit ? editReturnedOrderApi : addedReturnedOrderApi,
      }[this.option.FORM];


      const params = _deepCopy(this.form);

      const obj = _pick(_deepCopy(this.option), ["supplierId", "orderType", "purchaserId", "orderCode"]);

      params.totalAmount = yuanToPoints(params.totalAmount);

      if (!obj.orderType) {
        obj.orderType = this.option.FORM;
      }

      ;(Event || Func)({...params, ...obj})
        .then(() => {
          uni.showToast({title: "操作成功"});
          this.getList();
          this.isEdit = false;
          setTimeout(() => {
            this.getLast();
          }, 10);
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 添加修改单据
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          uni.showModal({
            title: "温馨提示",
            content: `付款金额为 ¥ ${this.form?.totalAmount}，是否正确？`,
            success: (res) => {
              if (res.confirm) {
                this.askSubmit();
              }
            },
          });
        }
      });
    },

    // 确认单据
    onConfirmOrder(item) {
      uni.showModal({
        title: "温馨提示",
        content: "请核对单据金额，确认后将无法更改。",
        confirmText: "已确认",
        success: (resq) => {
          if (resq.confirm) {
            const Event = {
              RECEIVABLE: confirmPaidOrderApi,
              PAY_LISE: confirmReturnedOrderApi,
            }[this.option.FORM];

            const Func = this.isRefund ? confirmReturnedOrderApi : confirmPaidOrderApi;
            const params = _deepCopy(item);

            this.$set(item, "__confirm_loading__", true);

            ;(Event || Func)(params)
              .then(() => {
                CustomToast({
                  title: "单据已确认",
                  success() {
                  },
                });
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__confirm_loading__", false);
              });
          }
        },
      });
    },

    // 查询可确认订单
    queryConfirmOrder() {
      this.cLoading = true;
      const Func = this.isReceivable ? getAchievableListApi : getPayableAchievableApi;

      const params = _deepCopy(this.option);

      Func(_pick(params, ["supplierId"]))
        .then(res => {
          const list = res.data;

          if (_isEmpty(list)) {
            this.visible = false;
            uni.showModal({
              title: "温馨提示",
              content: "该客户没有可完成的订单。",
              confirmText: "继续添加",
              cancelText: "返回",
              success: (res) => {
                if (!res.confirm) {
                  uni.navigateBack({});
                }
              },
              fail(err) {
                console.log(err);
              },
            });
          } else {
            this.confirmationList = list;
            this.visible = true;
          }
        })
        .finally(() => {
          this.cLoading = false;
        });
    },

    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对金额是否准确。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            const Func = this.isReceivable ? finishReceivableApi : finishPayableApi;

            Func(item)
              .then(() => {
                uni.showToast({title: "核对成功"});
                this.queryConfirmOrder();
              });
          }
        },
      });
    },
  },
};
