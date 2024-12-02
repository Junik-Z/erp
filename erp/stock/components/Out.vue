<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniTable from "@/uni_modules/uni-table/components/uni-table/uni-table.vue";
import UniTr from "@/uni_modules/uni-table/components/uni-tr/uni-tr.vue";
import UniTh from "@/uni_modules/uni-table/components/uni-th/uni-th.vue";
import UniTd from "@/uni_modules/uni-table/components/uni-td/uni-td.vue";
import { cancelOutboundApi, confirmOutboundApi, getOutboundHistoryListApi, getOutboundListApi } from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";

export default {
  name: "OUT",
  components: {HistoryBar, LoadMore, UniCol, UniRow, UniTd, UniTh, UniTr, UniTable, BasicCard, UniListItem, UniList},
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
          // this.list = res.data;
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
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认无误后可办理出库。`,
        confirmText: "确认入库",
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
          <BasicCard>
            <view class="ko-out__info">
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
                  {{ ORDER_STATUS_ENUMS(item.status)}}
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
                <button class="ko-basic-button__card" @click="onCancel(item)">取消出库</button>
                <button class="ko-basic-button__card" @click="onConfirm(item)">确认出库</button>
              </view>
            </view>
          </BasicCard>
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <UniTable
          ref="table"
          :loading="loading"
          border
          stripe
          type="selection"
          emptyText="暂无更多数据"
          @selection-change="selectionChange"
        >
          <UniTr>
            <UniTh width="150" align="center">序号</UniTh>
            <UniTh width="150" align="center">商品名称</UniTh>
            <UniTh align="center">仓库地址</UniTh>
            <UniTh width="204" align="center">操作</UniTh>
          </UniTr>
          <uni-tr v-for="(item, index) in list" :key="index">
            <UniTd>{{ item.date }}</UniTd>
            <UniTd>
              <view class="name">{{ item.name }}</view>
            </UniTd>
            <UniTd align="center">{{ item.address }}</UniTd>
            <UniTd>
              <view class="uni-group">
                <button class="ko-basic-button__card" @click="onJump">审批</button>
                <button class="ko-basic-button__card">修改</button>
                <button class="ko-basic-button__card">删除</button>
              </view>
            </UniTd>
          </uni-tr>
        </UniTable>
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
