<script>
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import {
  cancelInboundApi,
  confirmInboundApi,
  getInboundHistoryListApi,
  getInboundListApi,
  printA4InboundApi,
} from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, showToast } from "@/utils";
import PrintList from "@/components/PrintList/PrintList.vue";
import KoList from "@/components/List/List.vue";
import { CONFIG } from "@/utils/config";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "Warehouse",
  components: {
    UniEasyinput,
    KoList,
    PrintList,
    OrderCard,
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
      list: [],
      isHistory: false,

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
      },

      noMore: false,

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
          width: 300,
          slot: "operate",
        },

      ],
      // #endif
    };
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = this.isHistory ? getInboundHistoryListApi : getInboundListApi;

      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
          console.log(res);
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
            cancelInboundApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList(true);
              });
          }
        },
      });
    },
    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后增加库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            confirmInboundApi(item)
              .then(() => {
                uni.showToast({title: "入库成功"});
                this.getList(true);
              });
          }
        },
      });
    },
    onRowClick(row) {
      this.onJumpDetails(row, "inbound");
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      printA4InboundApi(data)
        .then(() => {
          showToast({
            title: "请求成功",
          });
        });
    },

    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      flag && this.$refs.SearchRef.onShowSearch();
      this.getList(true);
    },
  },
};
</script>

<template>
  <view class="ko-warehouse">
    <HistoryBar
      v-model="isHistory"
      :values="['待处理', '历史']"
      @change="onResetList(false)"
      is-show-search
      ref="SearchRef"
    >
      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <UniEasyinput v-model="queryList.orderCode" placeholder="请输入订单编号" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户名称" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
          </UniCol>
          <UniCol :span="24">
            <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onResetList(true)">重置</button>
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </HistoryBar>

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 10px;" v-for="(item, index) of list" :key="index">
          <OrderCard
            :item="item"
            @click="onJumpDetails(item, 'inbound')"
            :is-history="isHistory"
          >
            <template #operate v-if="isPerm('Stock_Write')">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onPrint(item)"
                >
                  打印入库单(A4)
                </button>

                <button
                  v-if="['CREATED'].includes(item.status) && false"
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item)"
                >
                  取消入库
                </button>
                <button
                  v-if="['CREATED', 'CANCELLED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item)"
                >
                  确认入库
                </button>
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
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
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'inbound')"
            >
              打印入库单(A4)
            </button>
            <button
              v-if="['CREATED'].includes(item.status) && false"
              class="ko-basic-button__card"
              @click.stop="onCancel(item)"
            >
              取消入库
            </button>
            <button
              v-if="['CREATED', 'CANCELLED'].includes(item.status)"
              class="ko-basic-button__card"
              @click.stop="onConfirm(item)"
            >
              确认入库
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <PrintList ref="PLRef" @submit="startPrint" />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-warehouse {
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
