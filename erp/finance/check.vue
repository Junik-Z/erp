<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import KoNotice from "@/components/Notice/Notice.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  getPaidOrderListApi,
  getPayableCheckApi,
  getReceivableCheckApi,
  getReturnedOrderListApi,
} from "@/api/erp/finance";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _get, _groupBy, _isEqual } from "@/utils";
import { checkListApi } from "@/api/erp/logistics";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";

export default {
  name: "check",
  mixins: [mixins],
  components: {
    UniSection,
    BasicCard,
    UvAvatar,
    UniCol,
    UniRow,
    OrderCard,
    LoadMore,
    UniListItem,
    UniList,
    KoNotice,
    UniSegmentedControl,
  },
  data() {
    const _this = this;
    return {
      tabsList: [
        {
          sale: "销售订单",
          purchase: "退货订单",
          logistics: "送货订单",
          func: getReceivableCheckApi,
          pageType: "receivable",
        },
        {
          sale: "退货订单",
          purchase: "采购订单",
          logistics: "收货订单",
          func: getPayableCheckApi,
          pageType: "payable",
        },
        {
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
        },
      ],
      current: 0,
      loading: false,

      list: [],

      saleIndex: [0, 1, 2, 3],
      purchaseIndex: [1, 0, 2, 3],
      logisticsIndex: [1, 0, 2, 3],

      showTabList: [],

      // 物流商
      isLogistics: false,
      logisticsList: {},

      // #ifdef H5
      columns: [
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
                      size: 64,
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
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 64}})],
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
                  size: 64,
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

      this.showTabList = Ins.map(index => {
        const obj = this.tabsList[index];
        return {
          ...obj,
          label: obj[key],
        };
      });

      this.getList();
    },

    getList() {
      const Func = this.isLogistics ? checkListApi : _get(this.showTabList, `${this.current}.func`); // [getReceivableCheckApi, getPayableCheckApi, getPaidOrderListApi, getReturnedOrderListApi][this.current];

      this.list = [];

      Func({
        [this.isLogistics ? "logisticsId" : "supplierId"]: this.option.id,
        ...(this.current > 1 ? {orderStatus: "FINISHED"} : {}),
      })
        .then(res => {
          this.list = res.data;

          if (this.isLogistics) {
            this.list = _groupBy(res.data, (it) => it.orderCode);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    getPageType() {
      return _get(this.showTabList, `${this.current}.pageType`);
    },
  },
};
</script>

<template>
  <view class="ko-check">
    <KoNotice />
    <view class="ko-check__tabs" v-if="!isLogistics">
      <UniSegmentedControl
        :values="showTabList"
        label-key="label"
        :current.sync="current"
        @clickItem="getList"
      />
    </view>

    <!-- #ifdef MP -->
    <UniList>
      <UniListItem v-for="(item, key) of list" :key="key">
        <template #body>
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
            <OrderCard
              v-if="current < 2"
              is-check-finance
              :item="item"
              @click.stop="onJumpDetails(item, getPageType)"
              is-finished
              is-finance
            />
            <template v-else>
              <BasicCard :spacing="10">
                <UniRow gutter="16">
                  <UniCol :span="24" v-if="item.vouchers">
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
        </template>
      </UniListItem>
      <LoadMore :loading="loading" />
    </UniList>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="current < 2 ? columns : columns1"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="current < 2 ? onJumpDetails($event, getPageType) : () => {}"
      />
    </view>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-check {
  padding-bottom: 80px;


  &__tabs {
    padding: 10px;

    // #ifdef H5
    width: 400px;

    // #endif
  }
}
</style>
