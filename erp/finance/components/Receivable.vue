<script>
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import {
  cancelReceivableApi,
  finishReceivableApi,
  getReceivableCountApi,
  getReceivableHistoryListApi,
  getReceivableListApi,
} from "@/api/erp/finance";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get, _pick } from "@/utils";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "Receivable",
  components: {
    KoTable,
    HistoryBar,
    LoadMore,
    OrderCard,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
    UvCountTo,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [],
      isHistory: false,

      operate: [
        {
          label: "订单确认",
          type: "onConfirm",
        },
        {
          label: "添加单据",
          type: "onAddedTicket",
        },
      ],
      count: {
        count: 0,
        customerCount: 0,
        num: 0,
        settledCount: 0,
      },

      CountList: [
        {
          label: "应收总额",
          key: "count",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "已收款总金额",
          key: "settledCount",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "对账订单数量",
          key: "num",
          color: "#2979ff",
          unit: "单",
        },
        {
          label: "对账客户数量",
          key: "customerCount",
          color: "#2979ff",
          unit: "家",
          func: "onJumpReconcile",
        },
      ],

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
        },
        {
          label: "客户",
          prop: "customer",
          children: [
            {
              label: "Logo",
              prop: "customer.logo",
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "customer.logo")), size: 64}})],
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
          label: "总金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          render(h, {row}) {
            return h("div", [
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onCancelOrder.bind(_this, row)},
                },
                "取消",
              ),
              h("button",
                {
                  class: "ko-basic-button__card",
                  on: {click: _this.onJump.bind(_this, row)},
                }
                , "修改"),
            ]);
          },
        },
      ],
      // #endif
    };
  },
  mounted() {
  },
  methods: {
    getList() {
      this.getCount();

      this.loading = true;
      const Func = this.isHistory ? getReceivableHistoryListApi : getReceivableListApi;

      Func({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getCount() {
      getReceivableCountApi()
        .then(res => {
          console.log(res.data);
          this.count = res.data;
        });
    },

    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelReceivableApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList();
              });
          }
        },
      });
    },
    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对金额是否准确，确认后入账。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            finishReceivableApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },
    // 添加票据
    onAddedTicket(item) {
      const q = this.getQueryString({
        ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId"]),
        isReceivable: true,
      });

      uni.navigateTo({
        url: `/erp/finance/ticket${q}`,
      });
    },

    // 跳转到对账客户页面
    onJumpReconcile() {
      uni.navigateTo({
        url: "/erp/finance/reconcile",
      });
    },

    onFunc(item) {

      if (item.func) {
        this[item.func](item);
      }
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.count, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-receivable">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count" @click.stop="onFunc(item)">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info">
              <UvCountTo
                :separator="item.unit === '元' ? ',' : ''"
                :start-val="0"
                bold
                :end-val="getCountValue(item)"
                :color="item.color ? item.color : '#2979ff'"
              />
              <text class="ko-basic-count__info--unit" v-if="item.unit">{{ item.unit }}</text>
            </view>
          </view>
        </UniCol>
      </UniRow>
    </view>

    <HistoryBar v-model="isHistory" text="应收款" @change="getList" />

    <view class="ko-receivable__row">
      <UniList>
        <!-- #ifdef MP -->
        <UniListItem v-for="(item, index) of list" :key="index">
          <template #body>
            <OrderCard
              @click="onJumpDetails(item, 'receivable')"
              :item="item"
            >
              <template #operate>
                <view
                  v-if="isPerm('Finance_Write') && !isHistory"
                  style="display: flex; align-items: center; justify-content: center; padding-top: 8px;"
                >
                  <button
                    v-if="item.confirmable"
                    class="ko-basic-button__card"
                    @click.stop="onConfirm(item)"
                  >
                    订单确认
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onAddedTicket(item)"
                  >
                    添加单据
                  </button>
                </view>
              </template>
            </OrderCard>
          </template>
        </UniListItem>
        <LoadMore :loading="loading" />
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px;">
          <KoTable
            :loading="loading"
            :columns="getColumns"
            :data="list"
            empty-text="暂无数据"
            stripe
          />
        </view>
        <!-- #endif -->
      </UniList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-receivable {
  //padding: 10px;
  margin-top: 10px;

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
