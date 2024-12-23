<script>
import QiunDataCharts from "@/erp/components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import {
  cancelPayableApi,
  finishPayableApi,
  getPayableCountApi,
  getPayableHistoryListApi,
  getPayableListApi,
} from "@/api/erp/finance";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import { _get, _isEqual, _pick } from "@/utils";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";

export default {
  name: "PayList",
  mixins: [mixins],
  components: {
    KoTable,
    HistoryBar,
    LoadMore,
    OrderCard,
    UniListItem, BasicCard, UniCol, UniRow, UniList, QiunDataCharts, UvCountTo,
  },
  data() {
    const _this = this;

    return {
      loading: false,
      list: [{}],

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
          label: "应付总额",
          key: "count",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "已付款总金额",
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
          label: "时间",
          prop: "createTime",
          width: 180,
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
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },

        {
          label: "状态",
          width: 80,
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.FINANCE_ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "备注",
          prop: "remark",
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
  mounted() {
  },
  methods: {
    getList() {
      this.getCount();
      this.loading = true;
      const Func = this.isHistory ? getPayableHistoryListApi : getPayableListApi;

      Func({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelPayableApi(item)
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
        content: `请核对金额是否准确，确认后出账。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            finishPayableApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },

    getCount() {
      getPayableCountApi()
        .then(res => {
          this.count = res.data;
          console.log(res.data);
        });
    },
    // 添加票据
    onAddedTicket(item) {
      const q = this.getQueryString({
        ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId"]),
        isReceivable: false,
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
  },
};
</script>

<template>
  <view class="ko-pay">
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

    <HistoryBar v-model="isHistory" text="应付款" @change="getList" />

    <view class="ko-pay__row">
      <UniList>
        <!-- #ifdef MP -->
        <UniListItem v-for="(item, index) of list" :key="index">
          <template #body>
            <OrderCard
              @click="onJumpDetails(item, 'payable')"
              :item="item"
              is-finance
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
            :columns="columns"
            :data="list"
            empty-text="暂无数据"
            stripe
            @row-click="onJumpDetails($event, 'payable')"
          >
            <template #operate="{item}">
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
          </KoTable>
        </view>
        <!-- #endif -->
      </UniList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-pay {
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
