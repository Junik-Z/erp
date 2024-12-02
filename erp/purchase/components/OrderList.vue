<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import { cancelPurchaseApi, getPurchaseHistoryListApi, getPurchaseListApi } from "@/api/erp/purchase";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import BasicMixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "OrderList",
  components: {HistoryBar, LoadMore, UniFab, UniCol, UniRow, BasicCard, UniListItem, UniList},
  mixins: [BasicMixins],
  data() {
    const _this = this;

    return {
      content: [
        // #ifdef MP
        {
          text: "分享",
          iconPath: "/static/images/icons/share.png",
          path: "share",
          openType: "share",
          params: {
            title: "填写信息",
            content: "邀请您填写信息，方便下次联系。",
            path: "/erp/purchase/order?type=added",
          },
        },
        // #endif
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: "/erp/purchase/order",
        },
      ],

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
          label: "采购单号",
          prop: "orderCode",
        },
        {
          label: "总金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, `¥ ${_this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "供应商",
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
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getPurchaseHistoryListApi : getPurchaseListApi;
      Func()
        .then(res => {
          this.list = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onCancelOrder(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelPurchaseApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList();
              });
          }
        },
      });
    },
    onJump() {
      // uni.navigateTo({
      //   url: "/erp/stock/verify",
      // });
    },
    onTrigger(event) {
      const {path} = event.item || {};
      this.$refs.FabRef.close();
      if (path) {
        uni.navigateTo({url: path});
      }
    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif
  }
};
</script>

<template>
  <view class="ko-order">
    <HistoryBar v-model="isHistory" text="采购订单" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <BasicCard>
            <view class="ko-order__info">
              <UniRow gutter="10">
                <UniCol :span="24">
                  <label class="ko-basic-label">订单编号：</label>{{ item.orderCode }}
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
                <UniCol :span="24">
                  <label class="ko-basic-label">订单状态：</label>
                  {{ ORDER_STATUS_ENUMS(item.status) }}
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  {{ item.remark }}
                </UniCol>
              </UniRow>
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button class="ko-basic-button__card" @click="onCancelOrder(item)">取消</button>
                <button class="ko-basic-button__card" @click="onJump(item)">修改</button>
                <!--<button class="ko-basic-button__card" @click="onJump">申请入库</button>-->
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
          :columns="getColumns"
          :data="list"
          empty-text="暂无数据"
          stripe
        />
      </view>
      <!-- #endif -->
    </UniList>

    <UniFab
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      :content="content"
      direction="vertical"
      @trigger="onTrigger"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-order {
  width: 100%;

  .ko-basic-button__card {
    margin: 0 5px;
  }

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
}
</style>
