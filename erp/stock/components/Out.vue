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
import OrderCard from "@/components/OrderCard/OrderCard.vue";

export default {
  name: "OUT",
  components: {OrderCard, HistoryBar, LoadMore, UniCol, UniRow, BasicCard, UniListItem, UniList},
  mixins: [mixins],
  data: () => ({
    loading: false,
    list: [],
    isHistory: false,
  }),
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getOutboundHistoryListApi : getOutboundListApi;
      Func()
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
                uni.showToast({title: "入库成功"});
                this.getList();
              });
          }
        },
      });
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
            <template #operate>
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

      </view>
      <!-- #endif -->
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-out {
  width: 100%;

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
