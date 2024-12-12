<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { cancelOutboundApi, confirmOutboundApi, getOutboundHistoryListApi, getOutboundListApi } from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get } from "@/utils";

export default {
  name: "OUT",
  components: {OrderCard, HistoryBar, LoadMore, UniCol, UniRow, BasicCard, UniListItem, UniList},
  mixins: [mixins],
  data() {
    const _this = this;

    return {
      loading: false,
      list: [],
      isHistory: false,

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
          render: (h, {row}) => {
            return h("div", row.orderCode);
          },
        },
        {
          label: "订单类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", _this.ORDER_TYPE_ENUMS(row.orderType));
          },
        },
        {
          label: "总金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "供应商",
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
          label: "时间",
          prop: "createTime",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
        },

      ],
      // #endif
    };
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getOutboundHistoryListApi : getOutboundListApi;
      Func({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onJump() {
      uni.navigateTo({
        url: "/erp/stock/verify",
      });
    },
    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelOutboundApi(item)
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
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后扣除库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            confirmOutboundApi(item)
              .then(() => {
                uni.showToast({title: "出库成功"});
                this.getList();
              });
          }
        },
      });
    },

    onRowClick(row) {
      this.onJumpDetails(row, "outbound");
    },
  },
};
</script>

<template>
  <view class="ko-out">

    <HistoryBar v-model="isHistory" text="出库审批" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="(item, index) of list" :key="index">
        <template #body>
          <OrderCard :item="item" @click="onJumpDetails(item, 'outbound')" :is-history="isHistory">
            <template #operate v-if="isPerm('Stock_Write')">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  v-if="['CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item)"
                >
                  取消出库
                </button>
                <button
                  v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item)"
                >
                  确认出库
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
        <view style="padding: 10px;">
          <KoTable
            :loading="loading"
            :columns="columns"
            :data="list"
            empty-text="暂无数据"
            stripe
            @row-click="onRowClick"
          >
            <template #operate="{item}" v-if="isPerm('Stock_Write')">
              <view style="display: flex; align-items: center; justify-content: center;">
                <button
                  v-if="['FINISHED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onJumpPrint(item, 'outbound')"
                >
                  打印单据
                </button>
                <button
                  v-if="['CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item)"
                >
                  取消出库
                </button>
                <button
                  v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item)"
                >
                  确认出库
                </button>
              </view>
            </template>
          </KoTable>
        </view>
      </view>
      <!-- #endif -->
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-out {
  width: 100%;
  padding-bottom: 80px;

  :deep(.uni-list-item__container ) {
    display: block;
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
    margin: 0 5px;
  }
}

/* #ifdef H5 */
.ko-out {
  .uni-group {
    display: flex;
    align-items: center;

    .ko-basic-button__card {
      margin: 0 5px;
    }
  }
}

/* #endif */
</style>
