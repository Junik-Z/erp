<script>
import {
  getPurchaseDetailApi,
  getPurchaseHistoryListApi,
  getPurchaseListApi,
  getPurchaseWaitPaymentListApi,
  printA4PurchaseApi,
  printPurchaseApi,
} from "@/api/erp/purchase";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import BasicMixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _isString, _pick, CustomToast } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/erp/components/PrintList/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import PurchaseMixins from "../PurchaseMixins";
import KoList from "@/components/List/List.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import Pay from "@/erp/components/Pay/Pay.vue";

const PageMenu = [
  {
    label: "待处理",
    perm: "PURCHASE_LIST",
    func: 0,
  },
  {
    label: "待付款",
    perm: "PURCHASE_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "PURCHASE_HISTORY",
    func: 2,
  },
];

export default {
  name: "OrderList",
  components: {
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
  },
  mixins: [BasicMixins, PurchaseMixins],
  data() {
    const _this = this;

    return {
      content: [
        // #ifdef MP
        {
          text: "分享",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.editPurchase,
            query: {
              PAGE_TYPE: "ADDED_PURCHASE",
            },
          },
          perm: "PURCHASE_SHARE",
        },
        // #endif

        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx&FORM=PURCHASE",
          perm: "PURCHASE_CUSTOMIZED_ADD",
        },
        // #endif

        {
          text: "新增",
          iconfont: "icon-tianjia",
          path: PageEnums.editPurchase,
          perm: "PURCHASE_ADD",
        },
      ],

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
      tableKey: +new Date(),

      node: {},
      nodeIndex: null,

      noRefresh: false,
      // 退货申请a
      isReturn: false,

      isNewList: false,

      PAGE_MENU: _deepCopy(PageMenu),
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

    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;

      if (_isEqual(item.orderType, "CUSTOMIZED")) {
        // #ifdef MP
        uni.showModal({
          title: "温馨提示",
          content: "定制表格，请在电脑端进行编辑。",
          showCancel: false,
        });

        this.noRefresh = false;
        // #endif

        // #ifndef MP
        uni.navigateTo({url: PageEnums.produceWork + `?ADDED_TYPE=xlsx&FORM=PURCHASE&id=${item.orderCode}`});
        // #endif
      } else {
        this.jumpAddedPurchase({id: item.id});
      }
    },

    onTrigger(event) {
      this.noRefresh = true;
      const {path} = event.item || {};

      if (path) {
        this.isNewList = true;
        uni.navigateTo({url: path});
      }
    },

    // 申请退货
    onReturn(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      this.isReturn = true;
      this.jumpAddedReturnPurchase({order_id: item.id});
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;
      this.jumpDocumentsTicket({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount", "orderType"]),
        FORM: "PURCHASE",
        noUnable: true,
      });
    },

    onRowClick(row) {
      this.onJumpDetails(row, "purchase");
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex, "footer");
    },

    // 开启打印
    onPrint(item, index, type) {
      this.$refs.PLRef.open({orderId: item.id, type});
    },
    // 开始打印
    startPrint(data) {
      if (_isEqual(data.type, "footer")) {
        printA4PurchaseApi(data)
          .then(() => {
            CustomToast({
              title: "请求成功",
            });
          });
      } else {
        printPurchaseApi(data)
          .then(() => {
            CustomToast({
              title: "请求成功",
            });
          });
      }
    },

    // 重置数据
    onResetList() {
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
    },

    // 更新列表数据
    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getPurchaseDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data, isPayment);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // #ifdef H5
    // 生成销售单
    onGenerateSale(item) {
      uni.navigateTo({url: PageEnums.produceWork + `?ADDED_TYPE=xlsx&FORM=PURCHASE&id=${item.orderCode}&isGenerateSales=true`});
    },
    // #endif
  },
  computed: {
    actionList() {
      const node = this.node;
      return [
        {
          name: "打印采购单(A4)",
          func: "onPrint",
          perm: "PURCHASE_PRINT",
          status: [],
        },
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
          perm: "PURCHASE_RETURN_ADD",
        },
        {
          name: "取消订单",
          func: "cancelPurchase",
          status: ["CREATED"],
          perm: "PURCHASE_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
          perm: "PURCHASE_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removePurchase",
          status: ["CANCELLED", "CREATED"],
          perm: "PURCHASE_DELETE",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);
          const isStatus = item?.status?.includes(node.status);

          if (_isEqual(item.func, "onPrint")) {
            return isPerm && !_isEqual(node.orderType, "CUSTOMIZED");
          }

          if (_isEqual(item.func, "onJump")) {
            return this.isEditorButton(node) && isStatus;
          }

          return isStatus;
        });
    },

    // 判断是不是要显示编辑按钮
    isEditorButton() {
      return (node) => {
        if (_isEqual(this.GET_PAGE_MENU_FUNC, 0) && _isEqual(node.orderType, "CUSTOMIZED")) {
          return this.isPerm("PURCHASE_CUSTOMIZED_UPDATE");
        }

        if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) {
          // 待付款生产工单不能编辑
          if (_isEqual(node.orderType, "CUSTOMIZED")) {
            return false;
          }

          // 是否可以重新下单
          return this.isPerm("PURCHASE_UPDATE");
        }

        return !_isEqual(this.GET_PAGE_MENU_FUNC, 2) && this.isPerm("PURCHASE_UPDATE");
      };
    },
  },
};
</script>

<template>
  <view class="ko-purchase-order">
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
            <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入供应商名称" />
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

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 10px;" v-for="(item, index) of list" :key="item.id">
          <OrderCard
            is-purchase
            :item="item"
            @click="onJumpDetails(item, 'purchase')"
            is-new
            :is-custom-status-name="isEqual(GET_PAGE_MENU_FUNC, 1)"
            custom-status-name="待付款"
          >
            <template #operate>
              <view style="display: flex; align-items: center; justify-content: flex-end;">
                <button
                  class="ko-basic-button__card"
                  v-if="['FINISHED', 'CREATED'].includes(item.status) && item.orderType !== 'CUSTOMIZED' && isPerm('PURCHASE_PRINT')"
                  @click.stop="onPrint(item, index)"
                >
                  打印单据
                </button>

                <button
                  v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('PURCHASE_ADD_RETURNED_ORDER') || isPerm('PURCHASE_RETURNED_ORDER'))"
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
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onRowClick"
        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
        :no-refresh="noRefresh"
      >
        <template #operate="{item, index}">
          <view style="display: flex; align-items: center; justify-content: center;">
            <button
              v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('PURCHASE_PRINT')"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'purchase')"
            >
              打印单据
            </button>
            <button
              v-if="['FINISHED'].includes(item.status) && !item.confirmable&& (isPerm('PURCHASE_ADD_RETURNED_ORDER') || isPerm('PURCHASE_RETURNED_ORDER'))"
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
              v-if="['CREATED', 'CANCELLED', 'FINISHED'].includes(item.status) && isEditorButton(item)"
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
      @success="updateList(true)"
      @close="noRefresh = false"
    />
  </view>
</template>

<style lang="scss">
.ko-purchase-order {
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

  // #ifdef H5
  height: calc(100vh - 56px - 60px);
  display: flex;
  flex-direction: column;
  // #endif
}
</style>
