<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { cancelInboundApi, confirmInboundApi, getInboundHistoryListApi, getInboundListApi } from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";

export default {
  name: "Warehouse",
  components: {
    HistoryBar,
    LoadMore,
    UniCol,
    UniRow,
    BasicCard,
    UniListItem,
    UniList,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [{}],
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
          render: (h, params) => {
            console.log(params);
            return h("div", "你是什什么鬼");
          },
        },
        {
          label: "总金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, `¥ ${_this.toYuan(row.totalAmount)}`);
          },
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
        },

      ],
      // #endif
    };
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getInboundHistoryListApi : getInboundListApi;

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
    selectionChange() {
    },
    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelInboundApi(item)
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
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认无误后可办理入库。`,
        confirmText: "确认入库",
        success: (res) => {
          if (res.confirm) {
            confirmInboundApi(item)
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
  <view class="ko-warehouse">
    <HistoryBar v-model="isHistory" text="入库审批" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="(item, index) of list" :key="index">
        <template #body>
          <BasicCard>
            <view class="ko-warehouse__info">
              <UniRow gutter="10">
                <UniCol :span="24">
                  <label class="ko-basic-label">订单编号：</label>
                  {{ item.orderCode || "-" }}
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">订单类型：</label>
                  {{ ORDER_TYPE_ENUMS(item.orderType) }}
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">订单总金额：</label>
                  <text class="ko-basic-money">
                    ¥ {{ toYuan(item.totalAmount) }}元
                  </text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">总金额大写：</label>
                  <text class="ko-basic-money">
                    {{ toBigMoney(toYuan(item.totalAmount)) }}元
                  </text>
                </UniCol>
                <UniCol :span="24" v-if="isHistory">
                  <label class="ko-basic-label">状态：</label>
                  {{ ORDER_STATUS_ENUMS(item.status) }}
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  {{ item.remark || "-" }}
                </UniCol>
              </UniRow>
              <view
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
                v-if="!isHistory"
              >
                <button class="ko-basic-button__card" @click="onCancel(item)">取消入库</button>
                <button class="ko-basic-button__card" @click="onConfirm(item)">确认入库</button>
              </view>
            </view>
          </BasicCard>
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
        />
      </view>
      <!-- #endif -->
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-warehouse {
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
.ko-warehouse {
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
