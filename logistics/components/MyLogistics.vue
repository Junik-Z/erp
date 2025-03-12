<script>
import UvCountTo from "./uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import { _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "./OrderCard/OrderCard.vue";
import { confirmDeliveryApi, getDeliveryMyListApi, getMyStatisticsApi } from "@/api/erp/logistics";
import { CONFIG } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";

export default {
  name: "MyOrderList",
  components: {OrderCard, KoList, HistoryBar, UniRow, UniCol, UvCountTo},
  mixins: [mixins],
  data() {
    const _this = this;

    return {
      CountList: [
        {
          label: "待结账金额",
          key: "totalSignAmount",
          color: "#2979ff",
          unit: "元",
          span: 12,
        },
        {
          label: "完成单数",
          key: "totalSignCount",
          color: "#2979ff",
        },
      ],
      data: {},

      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
      loading: false,
      noMore: false,

      isHistory: false,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "订单类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_TYPE_ENUMS(row.orderType)]);
          },
        },
        {
          label: "订单状态",
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_STATUS_ENUMS(row.status)]);
          },
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
          label: "物流商",
          prop: "logistics",
          children: [
            {
              label: "Logo",
              prop: "logistics.logo",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {
                    props: {
                      src: _this.getImageUrl(_get(row, "logistics.logo")),
                     size: 42,
                      text: _get(row, "logistics.name") || _this.GET_SHOP_NAME,
                    },
                  })],
                );
              },
            },
            {
              label: "名称",
              prop: "logistics.name",
            },
          ],
        },
        {
          label: "物流单号",
          prop: "logisticsNo",
        },
        {
          label: "联系电话",
          prop: "orderPhone",
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
          width: 300,
        },
      ],
      // #endif
      tableKey: +new Date(),
    };
  },
  created() {
    this.getCount();
  },
  methods: {
    getCount() {
      if (this.isPerm("DELIVER_MY_STATISTICS")) {
        getMyStatisticsApi()
          .then(res => {
            console.log(res.data);
            this.data = res.data;
          });
      }
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      this.loading = true;
      getDeliveryMyListApi(this.queryList)
        .then(res => {
          console.log(res.data);
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 完成配送
    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定已完成 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            confirmDeliveryApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList(true);
              });
          }
        },
      });
    },
  },
  computed: {
    getCountValue() {
      return (node) => {
        const value = _get(this.data, node.key);
        return node.unit === "元" ? this.toYuan(value) : value;
      };
    },
  },

};
</script>

<template>
  <view class="ko-my-order-list">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10" v-if="isPerm('DELIVER_MY_STATISTICS')">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count">
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

    <view class="ko-my-order-list__wrap">
      <!-- #ifdef MP -->
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="item of list" :key="item.id">
          <OrderCard
            :item="item"
            is-logistics
            @click="onJumpDetails(item, 'logistics')"
            is-new
            show-order-type
            show-order-phone
          >
            <template #operate v-if="['CREATED'].includes(item.status) && isPerm('DELIVERY_CONFIRM')">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item)"
                >
                  完成配送
                </button>
                <!-- <button
                   class="ko-basic-button__card"
                   @click.stop="onActionClick(item)"
                   v-if="['CREATED'].includes(item.status)"
                 >
                   更多
                 </button>-->
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJumpDetails($event, 'logistics')"
        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
      >
        <!--
        @row-click="onJumpDetails($event, 'receivable')"
        -->
        <template #operate="{item}">
          <view
            style="display: flex; align-items: center; justify-content: center;"
          >
            <button
              class="ko-basic-button__card"
              @click.stop="onConfirm(item)"
              v-if="isPerm('DELIVERY_CONFIRM')"
            >
              完成配送
            </button>
          </view>
        </template>
      </KoTable>
      <!-- #endif -->
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-my-order-list {
  // #ifdef H5
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 50px);

  &__wrap {
    flex: 1;
    overflow: hidden;
  }

  // #endif

  &__wrap {
    //flex: 1;
    //overflow: hidden;

    padding: 10px;
  }
}
</style>
