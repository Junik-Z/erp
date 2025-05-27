<script>
import {
  cancelOutboundApi,
  confirmOutboundApi,
  getOutboundHistoryListApi,
  getOutboundListApi,
  printA4OutboundApi,
} from "@/api/erp/stock";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _groupBy, _isEmpty, _keys, CustomToast } from "@/utils";
import PrintList from "@/components/PrintList.vue";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import TopMenus from "./components/TopMenus.vue";
import reLogin from "@/mixins/re-login";

const PageMenu = [
  {
    label: "待处理",
    perm: "STOCK_OUTBOUND_LIST",
    func: 0,
  },
  {
    label: "已完成",
    perm: "STOCK_OUTBOUND_HISTORY",
    func: 1,
  },
  // #ifdef H5
  {
    label: "已取消",
    perm: "STOCK_OUTBOUND_CANCEL",
    func: 2,
  },
  // #endif
];

export default {
  name: "OUT",
  components: {
    TopMenus,
    PickerCalendars,
    UvAvatar,
    UniSection,
    BasicCard,
    BasicPopup,
    UniRow, UniCol,
    UniEasyinput,
    KoList,
    PrintList,
    OrderCard,
    HistoryBar,
  },
  mixins: [mixins, reLogin],
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

      inadequate: [],

      visible: false,

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
          label: "日期",
          prop: "createTime",
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
          width: 300,
          slot: "operate",
        },

      ],
      // #endif

      tableKey: +new Date(),

      values: [
        "待处理",
        "已完成",
        // #ifdef H5
        "已取消",
        // #endif
      ],
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
  methods: {
    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      const params = _deepCopy(this.queryList);

      this.loading = true;
      const Func = [getOutboundListApi, getOutboundHistoryListApi, getOutboundHistoryListApi][this.GET_PAGE_MENU_FUNC];

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
    onJump() {
      uni.navigateTo({
        url: "/erp/stock/verify",
      });
    },
    onCancel(item, index) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelOutboundApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                // this.getList(true);
                this.list.splice(index, 1);
              });
          }
        },
      });
    },
    onConfirm(item, index) {
      this.inadequate = [];
      uni.showModal({
        title: "温馨提示",
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后扣除库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            confirmOutboundApi(item)
              .then((resp) => {
                const list = _deepCopy(_groupBy(resp.data, (item) => item.className));
                this.inadequate = _keys(list).map(key => ({
                  key,
                  children: list[key],
                }));

                if (_isEmpty(resp.data)) {
                  uni.showToast({title: "出库成功"});
                  this.list.splice(index, 1);
                  // this.getList(true);
                } else {
                  this.visible = true;
                }
              });
          }
        },
      });
    },

    onRowClick(row) {
      this.onJumpDetails(row, "outbound");
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      printA4OutboundApi(data)
        .then(() => {
          CustomToast({
            title: "请求成功",
          });
        });
    },

    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.getList(true);
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
  },
  created() {
    this.PAGE_MENU = _deepCopy(PageMenu);
  },
};
</script>

<template>
  <view class="ko-out">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :path="PageEnums.stockOut"/>

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
            <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户名称" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
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
        <view style="padding: 10px;">
          <block v-for="(item, index) of list" :key="index">
            <OrderCard
              :item="item"
              @click="onJumpDetails(item, 'outbound')"
              is-new
              show-order-type
              :spacing="10"
            >
              <template #operate>
                <view style="display: flex; align-items: center; justify-content: flex-end;">
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onPrint(item)"
                    v-if="isPerm('STOCK_PRINT')"
                  >
                    打印出库单(A4)
                  </button>
                  <button
                    v-if="['CREATED'].includes(item.status) && false"
                    class="ko-basic-button__card"
                    @click.stop="onCancel(item, index)"
                  >
                    取消出库
                  </button>
                  <button
                    v-if="['CREATED', 'CANCELLED'].includes(item.status) && isPerm('STOCK_OUTBOUND_CONFIRM')"
                    class="ko-basic-button__card"
                    @click.stop="onConfirm(item, index)"
                  >
                    确认出库
                  </button>
                </view>
              </template>
            </OrderCard>
          </block>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view style="padding: 10px; flex: 1; overflow: hidden;">
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onRowClick"
        @next-load="RequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'outbound')"
              v-if="isPerm('STOCK_PRINT')"
            >
              打印出库单(A4)
            </button>
            <!--<button
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'outbound3')"
            >
              打印单据
            </button>-->
            <button
              v-if="['CREATED'].includes(item.status) && false"
              class="ko-basic-button__card"
              @click.stop="onCancel(item, index)"
            >
              取消出库
            </button>
            <button
              v-if="['CREATED', 'CANCELLED'].includes(item.status) && isPerm('STOCK_OUTBOUND_CONFIRM')"
              class="ko-basic-button__card"
              @click.stop="onConfirm(item, index)"
            >
              确认出库
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <PrintList ref="PLRef" @submit="startPrint" />
    <!-- #endif -->

    <BasicPopup :visible.sync="visible" title="库存不足">
      <view class="ko-out__popup">
        <view v-for="(item, key) of inadequate" :key="key">
          <UniSection :title="item.key" type="line">
            <BasicCard>
              <view
                v-for="child of item.children" :key="child.id"
                style="display: flex; align-items: center; font-size: 12px; padding: 5px 0;"
              >
                <view style="flex: 1;">
                  <label class="ko-basic-label">名称：</label>
                  <text>{{ child.name }}</text>
                </view>
                <!-- <view style="padding: 0 10px">
                   <label class="ko-basic-label">库存：</label>
                   <text class="ko-basic-money">{{ child.sequence }}</text>
                 </view>-->
                <view style="padding: 0 10px">
                  <label class="ko-basic-label">数量：</label>
                  <text class="ko-basic-money">{{ child.productQuantity }}</text>
                </view>
                <view style="width: 40px;">
                  <UvAvatar
                    v-if="child.images"
                    :src="getImageUrl(child.images)"
                    shape="square"
                  />
                </view>
              </view>
            </BasicCard>
          </UniSection>
          <!--<ProductCard :node="item" is-warning readonly />-->
        </view>
      </view>
      <template #footer>
        <view style="display: flex; justify-content: center; align-items: center">
          <button style="width: 120px;" class="ko-basic-button__card" @click="visible = false">确认</button>
        </view>
      </template>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-out {
  padding-top: 10px;
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

  &__popup {
    // #ifdef MP
    width: 94vw;
    // #endif
    padding: 16px;
  }
}

/* #ifdef H5 */
.ko-out {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);

  .uni-group {
    display: flex;
    align-items: center;
  }
}

/* #endif */
</style>
