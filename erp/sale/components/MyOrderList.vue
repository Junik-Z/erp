<script>
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import { getMyReturnSaleListApi, getMySaleListApi, getMyStatisticsApi } from "@/api/erp/sale";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import { CONFIG } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import SaleMixins from "../SaleMixins";

export default {
  name: "MyOrderList",
  components: {
    KoMovable, UvActionSheet, UniListItem, OrderCard, KoList, HistoryBar, UniRow, UniCol, UvCountTo,
  },
  mixins: [mixins, SaleMixins],
  data() {
    return {
      CountList: [
        {
          label: "未结金额",
          key: "totalSignAmount",
          color: "#2979ff",
          unit: "元",
          span: 12,
        },
        {
          label: "未结订单",
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

      actionItem: {},

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
          label: "下单日期",
          prop: "createTime",
          width: 180,
        },
        {
          label: "状态",
          width: 80,
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "金额(元)",
          prop: "totalAmount",
          width: 80,
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "客户",
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
        /* {
          label: "产品详情",
          prop: "details",
          render: (h, {row}) => {
            return h("div", row.details);
          },
        }, */
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
        {
          label: "操作",
          slot: "operate",
          width: 380,
        },
      ],
      // #endif
    };
  },
  created() {
    this.getCount();
  },
  methods: {
    getCount() {
      getMyStatisticsApi()
        .then(res => {
          console.log(res.data);
          this.data = res.data;
        });
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = this.isHistory ? getMyReturnSaleListApi : getMySaleListApi;
      Func(this.queryList)
        .then(res => {
          console.log(res.data);
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
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

    // 处理添加修改
    onAdded(item) {
      if (this.isHistory) {
        this.jumpSaleReturn({
          PAGE_TYPE: "ADDED_REFUND_SALE",
          ...(item?.id ? {id: item.id} : {}),
        });
      } else {
        this.jumpAddedSale({
          PAGE_TYPE: "ADDED_SALE",
          ...(item?.id ? {id: item.id} : {}),
        });
      }
    },
    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },

    // 提交销售订单
    onSubmit(item) {
      const Func = this.isHistory ? this.submitRefundSale : this.submitSale;
      Func(item);
    },
    // 删除订单
    onRemove(item) {
      const Func = this.isHistory ? this.removeRefundSale : this.removeSale;
      Func(item);
    },
    // 取消订单
    onCancel(item) {
      const Func = this.isHistory ? this.cancelRefundSale : this.cancelSale;
      Func(item);
    },
    // 申请退货
    onReturn(item) {
      this.jumpSaleReturn({
        order_id: item.id,
        PAGE_TYPE: "ADDED_REFUND_SALE",
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

    actionList() {
      const node = this.actionItem || {};
      return [
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
        },
        {
          name: "取消订单",
          func: "onCancel",
          status: ["CREATED"],
        },
        {
          name: "编辑",
          func: "onAdded",
          status: ["CREATED", "CANCELLED"],
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          status: ["CANCELLED", "CREATED"],
        },
      ]
        .filter(li => {
          return li?.status.includes(node.status) && !(this.isHistory && _isEqual(li.func, "onReturn"));
        });
    },
  },
};
</script>

<template>
  <view class="ko-my-order-list">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
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

    <HistoryBar v-model="isHistory" :values="['销售订单', '销售退货订单']" @change="getList(true)" />

    <view class="ko-my-order-list__wrap">
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px">
          <OrderCard
            v-for="item of list"
            :key="item.id"
            :item="item"
            @click="onJumpDetails(item, isHistory ? 'saleReturn' : 'sale')"
            is-sales
            :spacing="10"
          >
            <template #operate>
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <!--<button
                  v-if="['CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onSubmit(item)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>-->

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                  v-if="[isHistory ? '' : 'FINISHED', 'CREATED', 'CANCELLED'].includes(item.status)"
                >
                  更多
                </button>
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
    </view>

    <KoMovable @click="onAdded('')" v-if="!isHistory" />

    <!-- #ifdef MP -->
    <UvActionSheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-my-order-list {
  //display: flex;
  //flex-direction: column;
  //height: calc(100vh - 64px);

  &__wrap {
    //flex: 1;
    //overflow: hidden;
  }
}
</style>
