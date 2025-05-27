<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import {
  getReceivableCountApi,
  getReceivableDetailApi,
  getReceivableHistoryListApi,
  getReceivableListApi,
} from "@/api/erp/finance";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _keys, _pick } from "@/utils";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import Pay from "@/components/Pay/Pay.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import TopMenus from "./components/TopMenus.vue";
import orMixins from "@/finance/or-mixins";

const PageMenu = [
  {
    label: "待清帐",
    perm: "FINANCE_RECEIVABLE_LIST",
    func: 0,
  },
  {
    label: "已完成",
    perm: "FINANCE_RECEIVABLE_HISTORY",
    func: 1,
  },
  // #ifdef H5
  {
    label: "已取消",
    perm: "FINANCE_RECEIVABLE_HISTORY",
    func: 2,
  },
  // #endif
];

export default {
  name: "Receivable",
  components: {
    PickerCalendars,
    Pay,
    UniEasyinput,
    KoList,
    HistoryBar,
    OrderCard,
    UniCol,
    UniRow,
    UvCountTo,
    TopMenus,
  },
  mixins: [orMixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [],

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
        orderAddress: "",
      },
      noMore: false,

      count: {
        count: 0,
        customerCount: 0,
        num: 0,
        settledCount: 0,
      },

      CountList: [
        {
          label: "应收总额",
          key: "count",
          color: "#2979ff",
          unit: "元",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "已收款总金额",
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

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "编号",
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

      PAGE_MENU: _deepCopy(PageMenu),

      maxInputWrapHeight: 100,
    };
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },
  mounted() {
    // this.getCount();
  },
  methods: {
    // 请求下一页数据
    RequestNextPage() {
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
      const params = _deepCopy(this.queryList);

      const Func = [getReceivableListApi, getReceivableHistoryListApi, getReceivableHistoryListApi][this.GET_PAGE_MENU_FUNC];

      if (this.GET_PAGE_MENU_FUNC > 0) {
        params.status = {
          1: "FINISHED",
          2: "CANCELLED",
        }[this.GET_PAGE_MENU_FUNC];
      }

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
        });
    },

    getCount() {
      if (this.isPerm("FINANCE_RECEIVABLE_COUNT")) {
        getReceivableCountApi()
          .then(res => {
            console.log(res.data);
            this.count = res.data;
          });
      }
    },

    // 跳转到对账客户页面
    onJumpReconcile() {
      uni.navigateTo({
        url: PageEnums.financeReconcile,
      });
    },

    // 移除列表的数据
    onRemoveList(index) {
      this.list.splice(index, 1);
    },

    onFunc(item) {
      if (item.func) {
        this[item.func](item);
      }
    },

    onResetList() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);

      this.$refs.PCRef && this.$refs.PCRef.clearable();

      this.tableKey = +new Date();

      this.getList(true);
    },

    onSuccess() {
      const node = this.node;
      const index = this.nodeIndex;
      getReceivableDetailApi({id: node.id})
        .then(res => {
          console.log(res);
          this.$set(this.list, index, _pick(res.data, _keys(node)));
        });
    },

    // 确定开始结束时间了
    onCalendarConfirm(event) {
      if (event) {
        const r = event.range || {};
        this.queryList.startTime = r.before ? r.before + " 00:00:00" : "";
        this.queryList.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.queryList.startTime = "";
        this.queryList.endTime = "";
      }
    },

    // 更新系统数据
    updateAddressNode(item) {
      const node = this.node;
      const index = this.nodeIndex;
      getReceivableDetailApi({id: node.id || item.id})
        .then(res => {
          const data = _pick(res.data, _keys(node));
          if (_isEqual("FINISHED", data.status)) {
            this.list.splice(index, 1);
          } else {
            this.$set(this.list, index, data);
          }
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
  <KoList
    class="ko-receivable"
    :no-more="noMore"
    hide-tips
    @load-next="RequestNextPage"
    @lower="RequestNextPage"
    :data="list"
    :loading="loading"
  >
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="ko-receivable">
      <!-- #endif -->
      <!-- #ifdef MP -->
      <Notice />
      <!-- #endif -->

      <TopMenus :path="PageEnums.financeReceivable" />

      <view class="ko-basic-count__wrap" v-if="false">
        <UniRow :gutter="10" v-if="isPerm('FINANCE_RECEIVABLE_COUNT')">
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
        :max-input-wrap-height.sync="maxInputWrapHeight"
      >

        <template #extra>
          <button
            class="ko-basic-button__card ko-supplier__switch"
            @click="onSwitchStyle"
            style="margin-right: 6px;"
          >
            <uni-icons color="#fff" :type="!sApStyle ? 'list' : 'tune-filled'" />
          </button>
        </template>

        <view class="ko-basic-search">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <UniEasyinput
                :cursorSpacing="maxInputWrapHeight"
                v-model="queryList.orderCode"
                placeholder="请输入编号"
              />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput
                :cursorSpacing="maxInputWrapHeight - 50"
                v-model="queryList['customer.name']"
                placeholder="请输入客户/供应商名称"
              />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput
                v-model="queryList['user.nickName']"
                placeholder="请输入下单用户名称"
                :cursorSpacing="maxInputWrapHeight - 100"
              />
            </UniCol>
            <UniCol :span="24">
              <UniEasyinput
                v-model="queryList.orderAddress"
                placeholder="请输入地址"
                :cursorSpacing="maxInputWrapHeight - 150"
              />
            </UniCol>
            <UniCol :span="24">
              <PickerCalendars
                placeholder="请选择开始结束时间"
                mode="range"
                @confirm="onCalendarConfirm"
                ref="PCRef"
              />
            </UniCol>
            <UniCol :span="24">
              <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
                <button
                  style="width: 35%;"
                  class="ko-basic-button__card"
                  @click.stop="onResetList(true)"
                >
                  重置
                </button>
                <button
                  style="width: 35%;"
                  class="ko-basic-button__card"
                  @click.stop="getList(true)"
                >
                  搜索
                </button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </HistoryBar>

      <view class="ko-receivable__row">
        <!-- #ifdef MP -->
        <view>
          <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
            <view v-for="(item, index) of list" :key="index" style="padding: 5px 10px">
              <OrderCard
                @click="onJumpDetails(item, 'receivable')"
                :item="item"
                is-finance
                is-new
                show-order-type
              >
                <template #operate>
                  <view
                    v-if="!GET_PAGE_MENU_FUNC"
                    style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
                  >
                    <button
                      v-if="['PAID'].includes(item.status) &&  isPerm('FINANCE_RECEIVABLE_FINISH')"
                      class="ko-basic-button__card"
                      @click.stop="onConfirm(item, index)"
                    >
                      确认清帐
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onAddedTicket(item, index)"
                      v-if="['WAIT_PAY', 'CREATED'].includes(item.status) && (isPerm('FINANCE_ADD_PAID_ORDER') || isPerm('FINANCE_PAID_ORDER'))"
                    >
                      添加单据
                    </button>
                    <button
                      class="ko-basic-button__card"
                      @click.stop="onCancel(item, index)"
                      v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_RECEIVABLE_CANCEL')"
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
            :columns="columns"
            :data="list"
            empty-text="暂无数据"
            stripe
            @row-click="onJumpDetails($event, 'receivable')"
            :no-more="noMore"
            no-refresh
          >
            <template #operate="{item, index}">
              <view
                v-if="!GET_PAGE_MENU_FUNC"
                style="display: flex; align-items: center; justify-content: center;"
              >
                <button
                  v-if="['PAID'].includes(item.status) &&  isPerm('FINANCE_RECEIVABLE_FINISH')"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item, index)"
                >
                  确认清帐
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onAddedTicket(item, index)"
                  v-if="['WAIT_PAY', 'CREATED'].includes(item.status) && (isPerm('FINANCE_ADD_PAID_ORDER') || isPerm('FINANCE_PAID_ORDER'))"
                >
                  添加单据
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onCancel(item, index)"
                  v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_RECEIVABLE_CANCEL')"
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
      <!-- #ifndef H5 -->
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
  </KoList>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-receivable {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 60px);
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

.ko-supplier__switch {
  width: 30px;
  height: 30px;
  display: flex;
  padding: 0;
  align-items: center;
  justify-content: center;
  margin: 2px;
}
</style>
