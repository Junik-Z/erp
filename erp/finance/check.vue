<script>
// #ifdef H5
import { Checkbox } from "@/uni_modules/element-ui/element.min";
// #endif
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import KoNotice from "@/components/Notice/Notice.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  addedPaidOrderApi,
  addedReturnedOrderApi,
  getPayableCheckApi,
  getReceivableCheckApi,
} from "@/api/erp/finance";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _pick, _sum, CustomToast } from "@/utils";
import { checkListApi } from "@/api/erp/logistics";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import CheckPopup from "./CheckPopup.vue";
import { addedSalePaidOrderApi } from "@/api/erp/sale";
import { addedSPurchaseReturnedOrderApi } from "@/api/erp/purchase";

export default {
  name: "check",
  mixins: [mixins],
  components: {
    KoList,
    KoMovable,
    UniSection,
    BasicCard,
    UvAvatar,
    UniCol,
    UniRow,
    OrderCard,
    LoadMore,
    KoNotice,
    UniSegmentedControl,
    UniEasyinput,
    CheckPopup,
  },
  data() {
    const _this = this;
    return {
      tabsList: [
        // 添加收款单据
        {
          sale: "销售订单",
          purchase: "退货订单",
          logistics: "送货订单",
          func: getReceivableCheckApi,
          pageType: "receivable",
          perm: "FINANCE_RECEIVABLE_CHECK",
        },
        // 添加付款款单据
        {
          sale: "退货订单",
          purchase: "采购订单",
          logistics: "收货订单",
          func: getPayableCheckApi,
          pageType: "payable",
          perm: "FINANCE_PAYABLE_CHECK",
        },

        /*  {
           sale: "已收账款",
           purchase: "已收账款",
           logistics: "已收账款",
           func: getPaidOrderListApi,
           pageType: "receivable",
         },
         {
           sale: "已付账款",
           purchase: "已付账款",
           logistics: "已付账款",
           func: getReturnedOrderListApi,
           pageType: "payable",
         }, */
      ],
      current: 0,
      loading: false,

      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "user.nickName": "",
        orderAddress: "",
      },

      saleIndex: [0, 1],
      purchaseIndex: [1, 0],
      logisticsIndex: [1, 0],

      showTabList: [],

      // 物流商
      isLogistics: false,
      logisticsList: {},

      enumList: {
        sale: "客户",
        logistics: "物流商",
        purchase: "供应商",
      },

      // 款项描述枚举
      descPaymentEnum: {},

      isShowCheck: false,
      checked: [],

      sLoading: false,

      // #ifdef H5
      columns: [
        {
          label: "",
          type: "expand",
          width: 50,
          slot: "expand",
        },
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "订单编号",
          prop: "orderCode",
          width: 210,
        },
        {
          label: "时间",
          prop: "createTime",
          width: 180,
        },
        {
          label: "订单类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_TYPE_ENUMS(row.orderType)]);
          },
        },
        {
          label: "状态",
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.FINANCE_ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "客户/供应商",
          prop: "customer",
          children: [
            {
              label: "Logo",
              prop: "customer.logo",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {
                    props: {
                      src: _this.getImageUrl(_get(row, "customer.logo")),
                     size: 42,
                      text: _get(row, "customer.name") || _this.GET_SHOP_NAME,
                    },
                  })],
                );
              },
            },
            {
              label: "名称",
              prop: "customer.name",
            },
          ],
        },
        {
          label: "下单用户",
          prop: "customer",
          children: [
            {
              label: "头像",
              prop: "user.avatar",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 42}})],
                );
              },
            },
            {
              label: "昵称",
              prop: "user.nickName",
            },
          ],
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
      ],
      columns1: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "凭证",
          prop: "vouchers",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "vouchers")),
                 size: 42,
                  shape: "square",
                  text: _get(row, "vouchers") || "-",
                },
              })],
            );
          },
        },
        {
          label: "金额(元)",
          renderHeader(h, {}) {
            return h("label", [_this.current === 2 ? "收款金额" : "付款金额"]);
          },
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "时间",
          prop: "createTime",
        },
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
      ],
      // #endif

      tableKey: +new Date(),
      noMore: false,
    };
  },
  onLoad(option) {
    this.option = option;
    this.getShowTabList();
  },
  methods: {
    getShowTabList() {
      const key = this.option?.customer_type || "sale";

      this.isLogistics = _isEqual(key, "logistics");

      if (this.isLogistics) {
        this.getList();
        return false;
      }

      const Ins = {
        sale: this.saleIndex,
        purchase: this.purchaseIndex,
        logistics: this.logisticsIndex,
      }[key] || [];

      this.showTabList = Ins.flatMap(index => {
        const obj = this.tabsList?.[index] || {};
        if (this.isPerm(obj.perm)) {
          const item = {
            ...obj,
            label: obj[key],
          };

          return [item];
        } else {
          return [];
        }

      });

      this.getList();
    },
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      const Func = this.isLogistics ? checkListApi : _get(this.showTabList || [], `${this.current}.func`); // [getReceivableCheckApi, getPayableCheckApi, getPaidOrderListApi, getReturnedOrderListApi][this.current];

      this.loading = true;

      Func?.({
        [this.isLogistics ? "logisticsId" : "supplierId"]: this.option.id,
        ...(this.current > 1 ? {orderStatus: "FINISHED"} : {}),
        ...this.queryList,
      })
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;

          // #ifdef MP
          if (this.isLogistics) {
            this.list = _groupBy(this.list || [], (it) => it.orderCode);
          }
          // #endif
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onCheckboxItem(node) {
      if (!(!["FINISHED"].includes(node.status) && !node.confirmable)) return false;

      if (this.isCheckbox(node)) {
        this.checked = this.checked.filter(v => v.id !== node.id);
      } else {
        this.checked.push(node);
      }
    },
    onBatchClearing() {
      this.isShowCheck = !this.isShowCheck;
      this.checked = [];
    },

    onClickTabs() {
      this.isShowCheck = false;
      this.checked = [];

      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);

      this.getList(true);
    },

    async onSubmit() {
      if (!this.checked.length) {
        uni.showToast({
          title: "请先选择订单",
          icon: "none",
        });
        return false;
      }

      const list = this.checked.map(item => {
        const obj = _pick(_deepCopy(item), ["supplierId", "orderType", "purchaserId", "orderCode"]);

        // 已经结账的数据
        const closed = _sum(item.proofs?.map(v => v.totalAmount));

        return {
          ...obj,
          totalAmount: item.totalAmount - closed,
          voucher: "",
          remark: "",
        };
      });

      /* if (list) {
        console.log(list);
        return false;
      } */
      this.sLoading = true;

      let isError = false;

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        try {
          const Func = {
            sale: addedSalePaidOrderApi,
            purchase: addedSPurchaseReturnedOrderApi,
          }[this.option?.FORM];

          if (Func) {
            await Func(item)
              .then((res) => {
                this.onCheckboxItem(item);
                return res;
              });
          } else {
            // 添加收款订单
            if (_isEqual(this.getPageType, "receivable")) {
              await addedPaidOrderApi(item)
                .then((res) => {
                  this.onCheckboxItem(item);
                  return res;
                });
            }

            // 添加付款订单
            if (_isEqual(this.getPageType, "payable")) {
              await addedReturnedOrderApi(item)
                .then((res) => {
                  this.onCheckboxItem(item);
                  return res;
                });
            }
          }
        } catch (e) {
          console.error(e);
          isError = true;
        }
      }

      this.sLoading = false;

      if (!isError) {
        await CustomToast({
          title: "操作成功",
          icon: "none",
        });

        this.checked = [];
        this.isShowCheck = false;
        this.getList();
      }
    },

    onJumpDet(item, getPageType) {
      if (this.isShowCheck) {
        this.onCheckboxItem(item);
        return false;
      }
      this.onJumpDetails(item, getPageType);
    },

    // 跳转到单据详情
    toTicket(item) {
      console.log(item);
      const q = this.getQueryString({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "orderType"]),
        isDetails: true,
      });
      uni.navigateTo({
        url: `${PageEnums.ticket}${q}`,
      });
    },

    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 打开对账单
    openStatement() {
      if (!this.checked.length) {
        uni.showToast({
          title: "请先选择订单",
          icon: "none",
        });
        return false;
      }

      this.$refs.CPRef.open(this.checked, this.option);
    },
  },
  computed: {
    getPageType() {
      return _get(this.showTabList, `${this.current}.pageType`);
    },
    isCheckbox() {
      return (node) => {
        return this.checked?.some(item => item.id === node.id);
      };
    },
    isShowFooter() {
      return this.current < 2;
    },
    totalAmount() {
      return _sum(this.checked?.map(v => (v.totalAmount - _sum((v.proofs || []).map(v => v.totalAmount || 0))) || 0) || []);
    },
    // 计算已结的金额
    calculationCompleted() {
      return (list) => _sum(list.map((v) => v.totalAmount || 0));
    },

    // #ifdef H5
    getCheckColumns() {
      const columns = _deepCopy(this.columns);
      if (this.isShowCheck) {
        columns.push({
          label: "选择",
          width: 55,
          render: (h, {row}) => {
            return h("div",
              {class: "ko-table-checked__warp"},
              [
                h(
                  Checkbox,
                  {
                    class: `ko-table-checked`,
                    props: {
                      value: this.isCheckbox(row),
                      disabled: !(!["FINISHED"].includes(row.status) && !row.confirmable),
                    },
                  },
                ),
              ]);
          },
        });
      }
      return columns;
    },
    // #endif

    getShowCheckBillButton() {
      const key = this.option?.customer_type;
      return {
        sale: this.isPerm("FINANCE_RECEIVABLE_CHECK_BILL"),
        purchase: this.isPerm("FINANCE_PAYABLE_CHECK_BILL"),
      }[key];
    },

    // 是否显示批量清帐按钮
    isShowCheckButton() {
      const label = _get(this.showTabList || [], `${this.current}.label`) || "";

      const isCheck = ["销售订单", "采购订单"].includes(label);

      const isPaid = {
        sale: this.isPerm("SALE_ADD_PAID_ORDER"),
        purchase: this.isPerm("PURCHASE_ADD_RETURNED_ORDER"),

        F_SALE: this.isPerm("FINANCE_ADD_PAID_ORDER"),
        F_PURCHASE: this.isPerm("FINANCE_ADD_RETURNED_ORDER"),
      }[this.option?.FORM];

      // 当显示弹窗 并且 不是物流商 并且
      return !this.isShowCheck && isCheck && !this.isLogistics && (this.option?.FORM ? isPaid : true);
    },
  },
};
</script>

<template>
  <view class="ko-check" :class="{'not-footer': isShowFooter && isShowCheck}">
    <KoNotice />
    <view class="ko-check__tabs" v-if="!isLogistics">
      <HistoryBar
        v-model="current"
        :values="showTabList"
        label-key="label"
        @change="onClickTabs(false)"
        is-show-search
        ref="SearchRef"
      >
        <view class="ko-basic-search">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderCode" placeholder="请输入编号" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
            </UniCol>
            <UniCol :span="24">
              <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onClickTabs(true)">重置</button>
                <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </HistoryBar>
    </view>

    <!-- #ifdef MP -->
    <KoList :loading="loading" :no-data="!list.length" :no-more="noMore">
      <view v-for="(item, key) of list" :key="key" class="ko-check__row">
        <block v-if="isLogistics">
          <UniSection :title="`订单编号：${key}`" type="line">
            <BasicCard v-for="child of item" :key="child.id" :spacing="10">
              <UniRow gutter="10">
                <UniCol :span="12">
                  <view>
                    <label class="ko-basic-label">费用类型：</label>
                    <text>{{ FEES_TYPE_ENUMS(child.feesType) }}</text>
                  </view>
                </UniCol>
                <UniCol :span="12">
                  <view>
                    <label class="ko-basic-label">金额：</label>
                    <text class="ko-basic-money">{{ toYuan(child.amount) }}元</text>
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <view>
                    <label class="ko-basic-label">时间：</label>
                    <text>{{ child.createTime }}</text>
                  </view>
                </UniCol>
              </UniRow>
            </BasicCard>
          </UniSection>
        </block>
        <block v-else>
          <view v-if="current < 2" class="ko-check__item">
            <OrderCard
              is-check-finance
              :item="item"
              @click.stop="onJumpDet(item, getPageType)"
              is-finished
              is-finance
              is-hide-status
              is-new
              show-order-type
            />

            <BasicCard v-if="item.proofs && item.proofs.length" @click.stop="toTicket(item)">
              <UniRow :gutter="4">
                <UniCol :span="24" v-for="child of item.proofs" :key="child.id">
                  <view style="font-size: 13px; padding-left: 30px;">
                    <text style="padding-right: 10px; font-size: 12px">{{ child.updateTime || "-" }}</text>
                    <text style="padding-right: 10px; font-size: 12px">{{ GET_PAYMENT_ENUMS(item.orderType) }}:</text>
                    <text class="ko-basic-money">
                      {{ toYuan(child.totalAmount) }}元
                    </text>
                    <text
                      style="font-size: 11px; padding-left: 6px;color: #c7c9ce;"
                      v-if="['CREATED'].includes(child.orderStatus)"
                    >
                      {{ GET_PROOFS_STATUS_ENUMS(child.orderStatus) }}
                    </text>
                  </view>
                </UniCol>
              </UniRow>
            </BasicCard>

            <block v-if="item.proofs && item.proofs.length">
              <view style="border-bottom: 0.5px solid #dcdcdc; margin: 5px 0;"></view>

              <BasicCard not-padding no-shadow>
                <UniRow :gutter="4">
                  <UniCol :span="24">
                    <view
                      v-if="item.totalAmount || 0"
                      style="font-size: 12px; padding: 5px 10px 5px 30px; display: flex; align-items: center; justify-content: flex-end;"
                    >
                      <block v-if="(item.totalAmount || 0) - calculationCompleted(item.proofs) > 0">
                        <text style="padding-right: 10px; font-size: 12px; white-space: nowrap;">
                          {{ GET_PAYMENT_REMAINING_ENUMS(item.orderType) }}：
                        </text>
                        <text class="ko-basic-money">
                          {{ toYuan((item.totalAmount || 0) - calculationCompleted(item.proofs)) }}元
                        </text>
                      </block>
                      <text style="color: #008000;" v-else>
                        已结清
                      </text>
                    </view>
                  </UniCol>

                  <UniCol :span="12" v-if="false">
                    <view
                      style="font-size: 12px; padding: 5px 10px 5px 30px; display: flex; align-items: center; justify-content: flex-end;"
                    >
                      <text style="padding-right: 10px; font-size: 12px; white-space: nowrap;">
                        共计{{ GET_PAYMENT_ENUMS(item.orderType) }}：
                      </text>
                      <text class="ko-basic-money">
                        {{ toYuan(calculationCompleted(item.proofs)) }}元
                      </text>
                    </view>
                  </UniCol>
                </UniRow>
              </BasicCard>
            </block>

            <button
              v-if="!['FINISHED'].includes(item.status) && isShowCheck && !item.confirmable"
              class="ko-check__item--button"
              @click.stop="onCheckboxItem(item)"
            >
              <checkbox
                color="#256eff"
                style="transform:scale(1.2)"
                :checked="isCheckbox(item)"
                class="ko-check__item--button--checkbox"
              />
            </button>
          </view>
          <template v-else>
            <BasicCard :spacing="10">
              <UniRow gutter="16">
                <UniCol :span="24" v-if="item.voucher">
                  <label class="ko-basic-label">凭证：</label>
                  <UvAvatar
                    :src="getImageUrl(item.voucher)"
                    mode="scaleToFill"
                    shape="square"
                    :size="64"
                  />
                </UniCol>
                <UniCol :span="24">
                  <view>
                    <label class="ko-basic-label">{{ current === 2 ? "收款金额" : "付款金额" }}：</label>
                    <text class="ko-basic-money"> {{ toYuan(item.totalAmount) }}元</text>
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <view style="display: flex; align-items: center;">
                    <label class="ko-basic-label">客户/供应商：</label>
                    <view style="margin-right: 10px;">
                      <UvAvatar
                        :size="38"
                        :text="GET_FUNC(item, 'customer.name') || ''"
                        :src="getImageUrl(GET_FUNC(item, 'customer.logo'))"
                        random-bg-color
                      />
                    </view>
                    <text>{{ GET_FUNC(item, "customer.name") || "-" }}</text>
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <view style="display: flex; align-items: center;">
                    <label class="ko-basic-label">操作人：</label>
                    <view style="margin-right: 10px;">
                      <UvAvatar
                        :size="38"
                        random-bg-color
                        :src="getImageUrl(GET_FUNC(item, 'user.avatar'))"
                        :text="GET_FUNC(item, 'user.nickName') || ''"
                      />
                    </view>
                    <text>{{ GET_FUNC(item, "user.nickName") || "-" }}</text>
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">时间：</label>
                  <text>{{ item.updateTime || "-" }}</text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  <text>{{ item.remark || "-" }}</text>
                </UniCol>
              </UniRow>
            </BasicCard>
          </template>
        </block>
      </view>
    </KoList>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="current < 2 ? getCheckColumns : columns1"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="current < 2 ? onJumpDet($event, getPageType) : () => {}"
        :no-more="noMore || loading"
        @next-load="RequestNextPage"
        :expand-row-keys="list.map(v => v.id)"
        row-key="id"
      >
        <template #expand="{item}">
          <div style="display: flex; justify-content: flex-end; align-items: flex-end; flex-direction: column;">
            <BasicCard v-if="item.proofs && item.proofs.length" @click.stop="toTicket(item)">
              <UniRow :gutter="4">
                <UniCol :span="24" v-for="child of item.proofs" :key="child.id">
                  <view style="font-size: 13px; display: flex; align-items: center; justify-content: flex-end;">
                    <text style="padding-right: 10px; font-size: 12px">{{ child.updateTime || "-" }}</text>
                    <text style="padding-right: 10px; font-size: 12px">{{ GET_PAYMENT_ENUMS(item.orderType) }}:</text>
                    <text class="ko-basic-money">
                      {{ toYuan(child.totalAmount) }}元
                    </text>
                    <text
                      style="font-size: 11px; padding-left: 6px;color: #c7c9ce;"
                      v-if="['CREATED'].includes(child.orderStatus)"
                    >
                      {{ GET_PROOFS_STATUS_ENUMS(child.orderStatus) }}
                    </text>
                  </view>
                </UniCol>
              </UniRow>
            </BasicCard>

            <block v-if="item.proofs && item.proofs.length">
              <view style="border-bottom: 0.5px solid #dcdcdc; margin: 5px 0;"></view>
              <BasicCard not-padding no-shadow>
                <UniRow :gutter="4">
                  <UniCol :span="24">
                    <view
                      v-if="item.totalAmount || 0"
                      style="font-size: 12px; padding: 5px 10px 5px 30px; display: flex; align-items: center; justify-content: flex-end;"
                    >
                      <block v-if="(item.totalAmount || 0) - calculationCompleted(item.proofs) > 0">
                        <text style="padding-right: 10px; font-size: 12px; white-space: nowrap;">
                          {{ GET_PAYMENT_REMAINING_ENUMS(item.orderType) }}：
                        </text>
                        <text class="ko-basic-money">
                          {{ toYuan((item.totalAmount || 0) - calculationCompleted(item.proofs)) }}元
                        </text>
                      </block>
                      <text style="color: #008000;" v-else>
                        已结清
                      </text>
                    </view>
                  </UniCol>

                  <UniCol :span="12" v-if="false">
                    <view
                      style="font-size: 12px; padding: 5px 10px 5px 30px; display: flex; align-items: center; justify-content: flex-end;"
                    >
                      <text style="padding-right: 10px; font-size: 12px; white-space: nowrap;">
                        共计{{ GET_PAYMENT_ENUMS(item.orderType) }}：
                      </text>
                      <text class="ko-basic-money">
                        {{ toYuan(calculationCompleted(item.proofs)) }}元
                      </text>
                    </view>
                  </UniCol>
                </UniRow>
              </BasicCard>
            </block>

            <p
              style="text-align: center; color: #c7c9ce; padding-right: 50px;"
              v-if="!(item.proofs && item.proofs.length)"
            >
              暂无清帐记录
            </p>
          </div>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      v-if="isShowCheckButton"
      @click="onBatchClearing('')"
    >
      <view style="line-height: 1.2; font-size: 12px;">
        <view>批量</view>
        清帐
      </view>
    </KoMovable>

    <view class="ko-check__footer ko-basic-box-shadow" v-if="isShowFooter && isShowCheck">
      <view class="ko-check__footer--wrap">
        <view>
          <block v-if="totalAmount">
            <label class="ko-basic-label">金额：</label>
            <text class="ko-basic-money">{{ toYuan(totalAmount) }}元</text>
          </block>
        </view>

        <view style="display: flex; align-items: center;">
          <button class="ko-basic-button__card" @click.stop="onBatchClearing">
            {{ isShowCheck ? "取消" : "批量清帐" }}
          </button>

          <button
            v-if="!isLogistics && getShowCheckBillButton"
            class="ko-basic-button__card"
            @click.stop="openStatement"
          >
            对账单
          </button>

          <button
            :disabled="sLoading"
            :loading="sLoading"
            v-if="isShowCheck"
            class="ko-basic-button__card"
            @click.stop="onSubmit"
          >
            提交
          </button>
        </view>
      </view>
    </view>

    <CheckPopup ref="CPRef" />
  </view>
</template>

<style lang="scss">
.ko-check {
  padding-bottom: 40px;

  &__tabs {
    padding: 10px;

    // #ifdef H5
    width: 1024px;
    margin: 0 auto;
    // #endif
  }

  &__item {
    position: relative;

    &--button {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10;

      &--checkbox {
        position: absolute;
        top: -0px;
        right: -0px;

        //&[disabled] {
        //  //background: #000 !important;
        //}
      }
    }
  }

  &.not-footer {
    padding-bottom: 80px;
  }

  &__footer {
    height: 80px;
    background: #fff;
    padding: 10px 20px 30px;
    display: flex;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;

    &--wrap {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      // #ifdef H5
      .ko-basic-button__card {
        width: 100px;
        margin: 0 10px;
      }

      // #endif
    }
  }

  &__row {
    padding: 10px;
  }
}

// #ifdef H5
::v-deep .ko-table-checked {
  font-size: 20px;

  &__warp {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
      cursor: pointer;
    }

  }

  &__single .el-checkbox__inner {
    border-radius: 50%;
  }

  .el-checkbox__inner {
    width: 20px;
    height: 20px;

    &::after {
      width: 5px;
      height: 10px;
      left: 6px;
    }
  }
}

// #endif
</style>
