<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
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
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get } from "@/utils";
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
    UniGridItem,
    UniGrid,
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
            return h("div", {class: "ko-basic-money"}, `¥ ${_this.toYuan(row.totalAmount)}`);
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

      Func()
        .then(res => {
          // this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getCount() {
      getReceivableCountApi()
        .then(res => {
          console.log(res);
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
        content: `请核对订单号 ${item.orderCode} 的各产品数量金额是否准确，确认无误后可办理入账。`,
        confirmText: "确认入库",
        success: (res) => {
          if (res.confirm) {
            finishReceivableApi(item)
              .then(() => {
                uni.showToast({title: "入账成功"});
                this.getList();
              });
          }
        },
      });
    },
    // 添加票据
    onAddedTicket(item) {
      uni.navigateTo({
        url: `/erp/finance/ticket?id=${item.id}&orderCode=${item.orderCode}`,
      });
    },

    onOperate(type, item) {
      this[type]?.(item);
    },
  },
  computed: {
    getOperateList() {
      return (node) => {
        return this.operate.filter((item) => {
          if (item.type === "onConfirm") {
            return node.confirmable;
          }
          return true;
        });
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
    <UniGrid :column="2" :square="false" :show-border="false">
      <UniGridItem>
        <view class="ko-receivable__item">
          <view>应收总额</view>
          <view>
            <UvCountTo separator="," :start-val="0" :end-val="toYuan(count.count)" color="#2979ff" />
            <text>元</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-receivable__item">
          <view>已收款总金额</view>
          <view>
            <UvCountTo separator="," :start-val="0" :end-val="toYuan(count.settledCount)" color="#2979ff" />
            <text>元</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-receivable__item">
          <view>对账订单数量</view>
          <view>
            <UvCountTo :start-val="0" :end-val="count.num" color="#2979ff" />
            <text>单</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-receivable__item">
          <view>对账客户数量</view>
          <view>
            <UvCountTo :start-val="0" :end-val="count.customerCount" color="#2979ff" />
            <text>家</text>
          </view>
        </view>
      </UniGridItem>
    </UniGrid>

    <HistoryBar v-model="isHistory" text="收款统计" @change="getList" />

    <view class="ko-receivable__row">
      <UniList>
        <!-- #ifdef MP -->
        <UniListItem v-for="(item, index) of list" :key="index">
          <template #body>
            <OrderCard
              :item="item"
              :operate="getOperateList(item)"
              @operate="onOperate"
            />
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
