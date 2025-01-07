<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import BasicMixins from "@/mixins/mixins";
import { getSaleHistoryApi, getSaleListApi, getSaleWaitPaymentListApi, printSaleApi } from "@/api/erp/sale";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _pick, showToast } from "@/utils";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/components/PrintList/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import SaleMixins from "../SaleMixins";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import Pay from "../../components/Pay/Pay.vue";

export default {
  name: "OrderList",
  components: {
    Pay,
    UniCol,
    UniRow,
    UniEasyinput,
    KoList,
    KoMovable,
    PrintList,
    UvActionSheet,
    OrderCard,
    HistoryBar,
    BasicCard,
  },
  mixins: [BasicMixins, SaleMixins],
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
            title: `邀请您来下单啦！`,
            path: PageEnums.editSale,
            query: {
              PAGE_TYPE: "ADDED_SALE",
            },
          },
        },
        // #endif
        {
          text: "新增",
          iconPath: "/static/images/icons/added.png",
          path: PageEnums.editSale,
        },
      ],

      loading: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
      },
      noMore: false,

      tab: 0,
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
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = [getSaleListApi, getSaleWaitPaymentListApi, getSaleHistoryApi][this.tab];
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

    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      flag && this.$refs.SearchRef.onShowSearch();
      this.getList(true);
    },

    onJump(item) {
      this.jumpAddedSale({id: item.id});
    },

    onTrigger(event) {
      const {path} = event.item || {};
      if (path) {
        uni.navigateTo({url: path});
      }
    },

    // 添加单据
    onAddedDocuments(item) {
      this.jumpSaleAddedDocuments({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount"]),
        orderType: "SALE",
        noUnable: true,
      });
    },
    // 申请退货
    onReturn(item) {
      this.jumpSaleReturn({order_id: item.id});
    },

    onRowClick(row) {
      this.onJumpDetails(row, "sale");
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      printSaleApi(data)
        .then(() => {
          showToast({
            title: "请求成功",
          });
        });
    },
  },
  computed: {
    actionList() {
      const node = this.actionItem;
      return [
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
        },
        {
          name: "取消订单",
          func: "cancelSale",
          status: ["CREATED"],
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removeSale",
          status: ["CANCELLED", "CREATED"],
        },
      ]
        .filter(li => {
          if (li.name === "编辑") {
            return this.tab !== 2 && li.status.includes(node.status);
          }

          return li.status.includes(node.status);
        });
    },
  },
};
</script>

<template>
  <view class="ko-order">
    <HistoryBar
      v-model="tab" :values="['待处理', '待付款', '已完成']"
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
        <view style="padding: 5px 10px" v-for="item of list" :key="item.id">
          <OrderCard
            :item="item"
            @click="onJumpDetails(item, 'sale')"
            is-sales
          >
            <template #operate v-if="isPerm('Sales_Write')">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  v-if="['FINISHED', 'CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="onPrint(item)"
                >
                  打印单据
                </button>
                <button
                  v-if="['FINISHED'].includes(item.status) && !item.confirmable"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item)"
                >
                  付款
                </button>
                <button
                  v-if="['CREATED'].includes(item.status)"
                  class="ko-basic-button__card"
                  @click.stop="submitSale(item)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item)"
                >
                  更多
                </button>
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px;flex: 1;overflow: hidden;">
      <KoTable
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onRowClick"
        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item}" v-if="isPerm('Sales_Write')">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              v-if="['FINISHED'].includes(item.status) && !item.confirmable"
              class="ko-basic-button__card"
              @click.stop="onAddedDocuments(item)"
            >
              付款
            </button>
            <button
              v-if="['FINISHED'].includes(item.status)"
              class="ko-basic-button__card"
              @click.stop="onReturn(item)"
            >
              申请退货
            </button>
            <button
              v-if="['FINISHED', 'CREATED'].includes(item.status)"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'sale')"
            >
              打印单据
            </button>
            <button
              v-if="['CREATED'].includes(item.status)"
              class="ko-basic-button__card"
              @click.stop="submitSale(item)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              提交订单
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onJump(item)"
              v-if="['CREATED', 'CANCELLED', 'FINISHED'].includes(item.status) && tab !== 2"
            >
              修改
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="cancelSale(item)"
              v-if="['CREATED'].includes(item.status)"
            >
              取消
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="removeSale(item)"
              :loading="item.__r_loading__"
              :disabled="item.__r_loading__"
              v-if="['CANCELLED', 'CREATED'].includes(item.status)"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      v-if="isPerm('Sales_Write')"
      :content="content"
      @click="onTrigger"
    />

    <!-- #ifdef MP -->
    <PrintList ref="PLRef" @submit="startPrint" />
    <UvActionSheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->

    <Pay ref="TPRef" @success="getList(true)" />
  </view>
</template>

<style scoped lang="scss">
.ko-order {
  width: 100%;
  // #ifdef MP
  padding-bottom: 80px;
  // #endif

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

  // #ifdef H5
  height: calc(100vh - 56px - 60px);
  display: flex;
  flex-direction: column;
  // #endif
}
</style>
