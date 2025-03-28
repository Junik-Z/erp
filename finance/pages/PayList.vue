<script>
import UvCountTo from "../components/uv-count-to/uv-count-to.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import {
  cancelPayableApi,
  finishPayableApi,
  getPayableCountApi,
  getPayableDetailApi,
  getPayableHistoryListApi,
  getPayableListApi,
} from "@/api/erp/finance";
import OrderCard from "../components/OrderCard/OrderCard.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import { _deepCopy, _get, _isEmpty, _keys, _pick } from "@/utils";
import mixins from "@/mixins/mixins";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import Pay from "../components/Pay/Pay.vue";

const PageMenu = [
  {
    label: "待清帐",
    perm: "FINANCE_PAYABLE_LIST",
    func: 0,
  },
  {
    label: "已完成",
    perm: "FINANCE_PAYABLE_HISTORY",
    func: 1,
  },
  // #ifdef H5
  {
    label: "已取消",
    perm: "FINANCE_PAYABLE_HISTORY",
    func: 2,
  },
  // #endif
];

export default {
  name: "PayList",
  mixins: [mixins],
  components: {
    UniEasyinput,
    KoList,
    HistoryBar,
    OrderCard,
    UniCol,
    UniRow,
    UvCountTo,
    Pay,
  },
  data() {
    const _this = this;

    return {
      loading: false,
      list: [],

      operate: [
        {
          label: "订单确认",
          type: "onConfirm",
        },
        {
          label: "添加单据",
          type: "onAddedTicket",
        },
      ],

      count: {
        count: 0,
        customerCount: 0,
        num: 0,
        settledCount: 0,
      },

      CountList: [
        {
          label: "应付总额",
          key: "count",
          color: "#2979ff",
          unit: "元",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "已付款总金额",
          key: "settledCount",
          color: "#2979ff",
          unit: "元",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "对账订单数量",
          key: "num",
          color: "#2979ff",
          unit: "单",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "对账客户数量",
          key: "customerCount",
          color: "#2979ff",
          unit: "家",
          func: "onJumpReconcile",
          // #ifdef H5
          span: 6,
          // #endif
        },
      ],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
        orderAddress: "",
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
        },
        {
          label: "日期",
          prop: "updateTime",
          width: 180,
        },
        {
          label: "客户/供应商",
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
                     size: 42,
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
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 42}})],
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
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },

        {
          label: "状态",
          width: 80,
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.FINANCE_ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          slot: "operate",
        },
      ],
      // #endif
      tableKey: +new Date(),

      node: {},
      nodeIndex: null,

      PAGE_MENU: _deepCopy(PageMenu),
    };
  },
  mounted() {
    this.getCount();
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
        this.tableKey = +new Date();
      }

      const params = _deepCopy(this.queryList);
      this.loading = true;
      const Func = [getPayableListApi, getPayableHistoryListApi, getPayableHistoryListApi][this.GET_PAGE_MENU_FUNC];

      if (this.GET_PAGE_MENU_FUNC > 0) {
        params.status = {
          1: "FINISHED",
          2: "CANCELLED",
        }[this.GET_PAGE_MENU_FUNC];
      }

      // #ifdef H5
      const top = _deepCopy(this.$refs.WrapRef.scrollTop);
      // #endif
      Func(params)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          // #ifdef H5
          this.$nextTick(() => {
            this.$refs.WrapRef.scrollTop = top;
          });
          // #endif
        });
    },
    onCancel(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `如果销售订单未出库或仓库计划取消订单，库存将保持原状。若商品已经出库，系统会自动将其退回仓库。请仓库工作人员在商品退回后进行仔细盘点。`,
        success: (res) => {
          if (res.confirm) {
            cancelPayableApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.list.splice(index, 1);
              });
          }
        },
      });
    },
    onConfirm(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `请仔细核对金额是否准确。未确认的单据将自动确认，确认后入账。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            finishPayableApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                // this.getList(true);
                this.list.splice(index, 1);
                this.getCount();
              });
          }
        },
      });
    },

    getCount() {
      if (this.isPerm("FINANCE_PAYABLE_COUNT")) {
        getPayableCountApi()
          .then(res => {
            this.count = res.data;
            console.log(res.data);
          });
      }
    },
    // 添加票据
    onAddedTicket(item, index) {
      this.node = _deepCopy(item);
      this.nodeIndex = _deepCopy(index);
      this.$refs.TPRef.open({
        ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId", "totalAmount"]),
        isReceivable: false,
        FORM: "PAY_LISE",
      });
      /*  const q = this.getQueryString({
         ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId"]),
         isReceivable: false,
       });
       uni.navigateTo({
         url: `${PageEnums.financeTicket}${q}`,
       }); */
    },

    // 跳转到对账客户页面
    onJumpReconcile() {
      uni.navigateTo({
        url: PageEnums.financeReconcile,
      });
    },

    onFunc(item) {
      if (item.func) {
        this[item.func](item);
      }
    },

    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
    },

    onSuccess() {
      const node = this.node;
      const index = this.nodeIndex;
      getPayableDetailApi({id: node.id})
        .then(res => {
          this.$set(this.list, index, _pick(res.data, _keys(node)));
        });
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.count, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },
  },
};
</script>

<template>
  <!-- #ifdef H5 -->
  <view
    class="ko-pay"
    v-infinite-scroll="onRequestNextPage"
    infinite-scroll-immediate
    :infinite-scroll-delay="200"
    :infinite-scroll-disabled="noMore"
    :infinite-scroll-distance="200"
    ref="WrapRef"
    :key="tableKey"
  >
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <view class="ko-pay">
      <!-- #endif -->
      <view class="ko-basic-count__wrap">
        <UniRow :gutter="10" v-if="isPerm('FINANCE_PAYABLE_COUNT')">
          <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
            <view class="ko-basic-count" @click.stop="onFunc(item)">
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

      <HistoryBar
        v-model="PAGE_MENU_INDEX"
        :values="GET_PAGE_MENU"
        label-key="label"

        @change="onResetList(false)"
        is-show-search
        ref="SearchRef"
      >
        <view class="ko-basic-search">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderCode" placeholder="请输入编号" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户/供应商名称" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
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

      <view class="ko-pay__row">
        <!-- #ifdef MP -->
        <view>
          <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
            <view style="padding: 5px 10px;" v-for="(item, index) of list" :key="index">
              <OrderCard
                @click="onJumpDetails(item, 'payable')"
                :item="item"
                is-finance
                is-new
                show-order-type
              >
                <template #operate>
                  <view
                    v-if="!GET_PAGE_MENU_FUNC"
                    style="display: flex; align-items: center; justify-content: center; padding-top: 8px;"
                  >
                    <button
                      v-if="item.confirmable && isPerm('FINANCE_PAYABLE_FINISH')"
                      class="ko-basic-button__card"
                      @click.stop="onConfirm(item, index)"
                    >
                      确认清帐
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onAddedTicket(item, index)"
                      v-if="isPerm('FINANCE_ADD_RETURNED_ORDER') || isPerm('FINANCE_RETURNED_ORDER')"
                    >
                      添加单据
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onCancel(item, index)"
                      v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_PAYABLE_CANCEL')"
                    >
                      取消订单
                    </button>
                  </view>
                </template>
              </OrderCard>
            </view>
          </KoList>
        </view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px; height: 100%; overflow: hidden;">
          <KoTable
            :loading="loading"
            :columns="columns"
            :data="list"
            empty-text="暂无数据"
            stripe
            @row-click="onJumpDetails($event, 'payable')"

            @next-load="onRequestNextPage"
            no-more
          >
            <template #operate="{item, index}">
              <view
                v-if="!GET_PAGE_MENU_FUNC"
                style="display: flex; align-items: center; justify-content: center; padding-top: 8px;"
              >
                <button
                  v-if="item.confirmable && isPerm('FINANCE_PAYABLE_FINISH')"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item, index)"
                >
                  确认清帐
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onAddedTicket(item, index)"
                  v-if="isPerm('FINANCE_ADD_RETURNED_ORDER') || isPerm('FINANCE_RETURNED_ORDER')"
                >
                  添加单据
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item, index)"
                  v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_PAYABLE_CANCEL')"
                >
                  取消订单
                </button>
              </view>
            </template>
          </KoTable>
        </view>
        <!-- #endif -->
      </view>

      <Pay ref="TPRef" @close="onSuccess" />
      <!-- #ifdef H5 -->
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
  </view>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-pay {
  //padding: 10px;
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 56px - 60px - 10px);
  overflow-y: auto;
  // #endif

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
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
      text-align: center;
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
