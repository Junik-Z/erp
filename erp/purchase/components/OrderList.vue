<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import {
  cancelPurchaseApi,
  confirmPurchaseApi,
  getPurchaseHistoryListApi,
  getPurchaseListApi,
  removePurchaseApi,
} from "@/api/erp/purchase";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import BasicMixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get, _isEqual } from "@/utils";
import OrderCard from "@/components/OrderCard/OrderCard.vue";

export default {
  name: "OrderList",
  components: {OrderCard, HistoryBar, LoadMore, UniFab, BasicCard, UniListItem, UniList},
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
            title: `${_this.GET_USER_INFO?.nickName || ""}邀请您来下单啦！`,
            path: "/erp/purchase/order",
            query: {
              PAGE_TYPE: "ADDED_PURCHASE",
            },
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
                  on: {click: _this.onCancel.bind(_this, row)},
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
    onCancel(item) {
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
    onJump(item) {
      uni.navigateTo({
        url: `/erp/purchase/order?id=${item.id}`,
      });
    },
    onTrigger(event) {
      const {path} = event.item || {};
      this.$refs.FabRef.close();
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    // 提交销售订单
    onSubmit(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该采购订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmPurchaseApi(item)
              .then(() => {
                uni.showToast({title: "提交成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__s_loading__", false);
              });
          }
        },
      });
    },
    onRemove(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要删除此采购订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removePurchaseApi(item)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              })
              .finally(() => {
                this.$set(item, "__r_loading__", false);
              });
          }
        },
      });
    },
  },
  computed: {
    // #ifdef H5
    getColumns() {
      return this.columns.filter(item => this.isHistory ? !_isEqual(item.label, "操作") : true);
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-order">
    <HistoryBar v-model="isHistory" text="采购订单" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard is-purchase :item="item" :is-history="isHistory" @click="onJumpDetails(item, 'purchase')">
            <template #operate v-if="isPerm('Purchase_Write')">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  v-if="['CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onSubmit(item)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onJump(item)"
                  v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                >
                  修改
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item)"
                  v-if="['CREATED'].includes(item.status)"
                >
                  取消
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onRemove(item)"
                  :loading="item.__r_loading__"
                  :disabled="item.__r_loading__"
                  v-if="['CANCELLED', 'CREATED'].includes(item.status)"
                >
                  删除
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

    <UniFab
      v-if="isPerm('Purchase_Write')"
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
