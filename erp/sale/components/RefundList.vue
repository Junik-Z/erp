<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import {
  cancelSaleReturnApi,
  confirmSaleReturnApi,
  getSaleReturnHistoryApi,
  getSaleReturnListApi,
  removeSaleReturnApi,
} from "@/api/erp/sale";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _pick } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";

export default {
  name: "RefundList",
  components: {UvActionSheet, OrderCard, HistoryBar, LoadMore, UniCol, UniRow, UniFab, BasicCard, UniListItem, UniList},
  mixins: [mixins],
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
            path: "/erp/sale/refund",
          },
        },
        // #endif
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: "/erp/sale/refund",
        },
      ],

      loading: false,
      list: [],
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
          label: "退货单号",
          prop: "orderCode",
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
          label: "总金额(元)",
          prop: "totalAmount",
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
        {
          label: "备注",
          prop: "remark",
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
  methods: {
    getList() {
      this.loading = true;
      const Func = this.isHistory ? getSaleReturnHistoryApi : getSaleReturnListApi;

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
            cancelSaleReturnApi(item)
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
        url: `/erp/sale/refund?id=${item.id}`,
      });
    },

    onSubmit(item) {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要提交该销售退货订单吗？请注意，一旦提交，订单内容将无法再进行修改。",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__s_loading__", true);
            confirmSaleReturnApi(item)
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
        content: "您确定要删除此销售退货订单吗？",
        success: (res) => {
          if (res.confirm) {
            this.$set(item, "__r_loading__", true);
            removeSaleReturnApi(item)
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

    onTrigger(event) {
      if ("uni") {
        uni.navigateTo({
          url: "/erp/sale/refund",
        });
        return false;
      }

      const {path} = event.item || {};
      this.$refs.FabRef.close();
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    // 添加单据
    onAddedDocuments(item) {
      const q = this.getQueryString({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId"]),
        orderType: "SALE_RETURN",
        noUnable: true,
      });
      uni.navigateTo({
        url: `/erp/finance/ticket${q}`,
      });
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },
  },
  computed: {
    actionList() {
      const node = this.actionItem;
      return [
        {
          name: "取消订单",
          func: "onCancel",
          status: ["CREATED"],
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED"],
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          status: ["CANCELLED", "CREATED"],
        },
      ]
        .filter(li => li.status.includes(node.status));
    },
  },
};
</script>

<template>
  <view class="ko-client">
    <HistoryBar v-model="isHistory" text="退货订单" @change="getList" />

    <UniList>
      <!-- #ifdef MP -->
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard is-sales :is-history="isHistory" :item="item" @click="onJumpDetails(item, 'saleReturn')">
            <template #operate v-if="isPerm('Sales_Write')">
              <view
                style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
              >
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
                  v-if="!['CANCELLED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item)"
                >
                  付款
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                  style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;"
                  v-if='["CREATED", "CANCELLED"].includes(item.status)'
                >
                  <i class="iconfont icon-gengduocaozuo"></i>
                </button>

                <template v-if="false">
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
                </template>
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
          @row-click="onJumpDetails($event, 'saleReturn')"
        >
          <template #operate="{item}" v-if="isPerm('Sales_Write')">
            <view
              style="display: flex; align-items: center; justify-content: center;"
            >
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
                v-if="!['CANCELLED'].includes(item.status)"
                class="ko-basic-button__card"
                @click.stop="onAddedDocuments(item)"
              >
                付款
              </button>

              <button
                v-if="['FINISHED'].includes(item.status)"
                class="ko-basic-button__card"
                @click.stop="onJumpPrint(item, 'saleReturn')"
              >
                打印单据
              </button>

              <template v-if="true">
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
              </template>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </UniList>

    <UniFab
      v-if="isPerm('Sales_Write')"
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff",
      }'
      horizontal="right"
      :content="[] || content"
      direction="vertical"
      @fab-click="onTrigger"
    />

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
.ko-client {
  width: 100%;
  padding-bottom: 80px;

  .ko-basic-button__card {
    margin: 5px;
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
