<script>
import { getPurchaseHistoryListApi, getPurchaseListApi, getPurchaseWaitPaymentListApi } from "@/api/erp/purchase";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import OrderCard from "./components/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/components/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import Pay from "@/components/Pay/Pay.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import TopMenus from "./components/TopMenus.vue";
import purchase from "./purchase";
import PurchaseMixins from "@/purchase/PurchaseMixins";

export default {
  name: "OrderList",
  components: {
    PickerCalendars,
    Pay,
    UniCol,
    UniEasyinput,
    UniRow,
    KoList,
    KoMovable,
    PrintList,
    UvActionSheet,
    OrderCard,
    HistoryBar,
    LoadMore,
    TopMenus,
  },
  mixins: [purchase, PurchaseMixins],
  data() {
    const _this = this;

    return {
      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
        orderAddress: "",
      },
      loading: false,
      noMore: false,

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
          width: 210,
        },
        {
          label: "日期",
          prop: "updateTime",
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
        /* {
          label: "产品详情",
          prop: "details",
          render: (h, {row}) => {
            return h("div", row.details);
          },
        }, */
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
          minWidth: 120,
        },
        {
          label: "操作",
          slot: "operate",
          width: 480,
        },
      ],
      // #endif
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
      if (reset && !this.noRefresh) {
        this.tableKey = +new Date();
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && !this.isReturn && this.list.length && (!this.isNewList || this.GET_PAGE_MENU_FUNC === 0)) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = [getPurchaseListApi, getPurchaseWaitPaymentListApi, getPurchaseHistoryListApi][this.GET_PAGE_MENU_FUNC];
      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;
          this.isReturn = false;
          this.isNewList = false;

          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 重置数据
    onResetList() {
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.getList(true);
    },
  },
  computed: {},
};
</script>

<template>
  <view class="ko-purchase-order">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->

    <TopMenus :path="PageEnums.purchase" />

    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"
      @change="onResetList(false)"
      is-show-search
      ref="SearchRef"
    >
      <template #extra>
        <button
          class="ko-basic-button__card ko-purchase-order__switch"
          @click="onSwitchStyle"
        >
          <uni-icons color="#fff" :type="!sPurchase ? 'list' : 'tune-filled'" />
        </button>
      </template>

      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <UniEasyinput v-model="queryList.orderCode" placeholder="请输入编号" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入供应商名称" />
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
        <view style="padding: 10px;" v-for="(item, index) of list" :key="item.id">
          <OrderCard
            is-purchase
            :item="item"
            @click="onJumpDetails(item, 'purchase')"
            is-new
            :is-custom-status-name="isEqual(item.status, 'WAIT_PAY')"
            custom-status-name="待付款"
          >
            <template #operate>
              <view style="display: flex; align-items: center; justify-content: flex-end;">
                <button
                  class="ko-basic-button__card"
                  v-if="item.orderType !== 'CUSTOMIZED' && isPerm('PURCHASE_PRINT')"
                  @click.stop="onPrint(item, index)"
                >
                  打印单据
                </button>

                <button
                  v-if="['WAIT_PAY'].includes(item.status) && (isPerm('PURCHASE_ADD_RETURNED_ORDER') || isPerm('PURCHASE_RETURNED_ORDER'))"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item, index)"
                >
                  付款
                </button>

                <button
                  v-if="['CREATED'].includes(item.status) && isPerm('PURCHASE_CONFIRM')"
                  class="ko-basic-button__card"
                  @click.stop="submitPurchase(item, index)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item, index)"
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
    <view style="padding: 10px; flex: 1; overflow: hidden">
      <KoTable
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onRowClick"
        @load-next="RequestNextPage"
        :no-more="noMore || loading"
        :no-refresh="noRefresh"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              v-if="isPerm('PURCHASE_PRINT') && item.orderType !== 'CUSTOMIZED'"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'purchase')"
            >
              打印单据
            </button>
            <button
              v-if="['WAIT_PAY'].includes(item.status) && (isPerm('PURCHASE_ADD_RETURNED_ORDER') || isPerm('PURCHASE_RETURNED_ORDER'))"
              class="ko-basic-button__card"
              @click.stop="onAddedDocuments(item, index)"
            >
              付款
            </button>
            <button
              v-if="['CREATED'].includes(item.status)  && isPerm('PURCHASE_CONFIRM')"
              class="ko-basic-button__card"
              @click.stop="submitPurchase(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              提交订单
            </button>

            <button
              v-if="['WAIT_PAY'].includes(item.status)  && isPerm('PURCHASE_QUICK_IN') && isEqual(GET_PAGE_MENU_FUNC, 1)"
              class="ko-basic-button__card"
              @click.stop="onQuickIn(item, index)"
            >
              快捷入库
            </button>

            <button
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'purchase', {isA4: 'true'})"
              v-if="!['CUSTOMIZED'].includes(item.orderType) && isPerm('PURCHASE_PRINT')"
            >
              打印采购单(A4)
            </button>

            <button
              class="ko-basic-button__card"
              @click.stop="onGenerateSale(item)"
              v-if="['CUSTOMIZED'].includes(item.orderType) && !['CANCELLED'].includes(item.status) && false"
            >
              生成销售单
            </button>

            <button
              v-if="['FINISHED'].includes(item.status) && !['CUSTOMIZED'].includes(item.orderType) && isPerm('PURCHASE_RETURN_ADD')"
              class="ko-basic-button__card"
              @click.stop="onReturn(item, index)"
            >
              申请退货
            </button>

            <button
              v-if="['CREATED'].includes(item.status) && isPerm('PURCHASE_CANCEL')"
              class="ko-basic-button__card"
              @click.stop="cancelPurchase(item, index)"
            >
              取消订单
            </button>

            <button
              class="ko-basic-button__card"
              @click.stop="onJump(item, index)"
              v-if="['CREATED', 'WAIT_PAY'].includes(item.status) && isEditorButton(item)"
            >
              编辑
            </button>

            <button
              class="ko-basic-button__card"
              @click.stop="removePurchase(item, index)"
              :loading="item.__r_loading__"
              :disabled="item.__r_loading__"
              v-if="['CANCELLED', 'CREATED'].includes(item.status) && isPerm('PURCHASE_DELETE')"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      @click="onTrigger"
      v-if="isShowMovable"
      :content="GET_MOVABLE_LIST"
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

    <Pay
      ref="TPRef"
      @close="updateList(true); noRefresh = false"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase-order {
  padding-top: 10px;
  width: 100%;

  &__switch {
    width: 30px;
    height: 30px;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }

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
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  // #endif
}
</style>
