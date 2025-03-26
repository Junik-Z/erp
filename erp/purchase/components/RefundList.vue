<script>
import {
  getPurchaseReturnDetailApi,
  getPurchaseReturnHistoryListApi,
  getPurchaseReturnListApi,
  getPurchaseReturnWaitPaymentListApi,
  quickOutApi,
  returnPrintPurchaseApi,
} from "@/api/erp/purchase";
import BasicMixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _isString, _keys, _pick, CustomToast } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/erp/components/PrintList/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG } from "@/utils/config";
import PurchaseMixins from "../PurchaseMixins";
import KoList from "@/components/List/List.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import Pay from "@/erp/components/Pay/Pay.vue";

const PageMenu = [
  {
    label: "待处理",
    perm: "PURCHASE_RETURN_LIST",
    func: 0,
  },
  {
    label: "待付款",
    perm: "PURCHASE_RETURN_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "PURCHASE_RETURN_HISTORY",
    func: 2,
  },
];

export default {
  name: "RefundList",
  components: {
    Pay,
    UniEasyinput,
    UniCol,
    UniRow,
    KoList,
    KoMovable,
    PrintList,
    UvActionSheet,
    OrderCard,
    HistoryBar,
  },
  mixins: [BasicMixins, PurchaseMixins],
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
          label: "退货单号",
          prop: "orderCode",
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
          label: "地址",
          prop: "orderAddress",
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
      tableKey: +new Date(),

      node: {},
      nodeIndex: null,

      noRefresh: false,
      isReturn: false,
      isNewList: false,

      PAGE_MENU: _deepCopy(PageMenu),

      visible: false,
      inadequate: [],
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

      if (this.noRefresh && info && this.list.length && (!this.isNewList || this.GET_PAGE_MENU_FUNC === 0)) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = [getPurchaseReturnListApi, getPurchaseReturnWaitPaymentListApi, getPurchaseReturnHistoryListApi][this.GET_PAGE_MENU_FUNC];
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
      this.jumpAddedReturnPurchase({id: item.id});
    },
    onTrigger(event) {
      this.noRefresh = true;
      this.isNewList = true;
      if ("uni") {
        this.jumpAddedReturnPurchase();
        return false;
      }

      const {path} = event.item || {};

      if (path) {
        uni.navigateTo({url: path});
      }
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;
      this.jumpDocumentsTicket({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount", "orderType"]),
        FORM: "PURCHASE_RETURN",
        noUnable: true,
      });
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      returnPrintPurchaseApi(data)
        .then(() => {
          CustomToast({
            title: "请求成功",
          });
        });

    },

    onResetList(flag) {
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
    },

    // 更新列表数据
    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getPurchaseReturnDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data, isPayment);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 快捷出库
    onQuickOut(item, index) {
      this.inadequate = [];
      uni.showModal({
        title: "温馨提示",
        content: `请核对订单号 ${item.orderCode} 的各产品数量是否准确，确认后扣除库存。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            quickOutApi(item)
              .then((resp) => {
                const list = _deepCopy(_groupBy(resp.data, (item) => item.className));
                this.inadequate = _keys(list).map(key => ({
                  key,
                  children: list[key],
                }));

                if (_isEmpty(resp.data)) {
                  uni.showToast({title: "出库成功"});
                  // this.list.splice(index, 1);
                } else {
                  this.visible = true;
                }
              });
          }
        },
      });
    },
  },
  computed: {
    actionList() {
      const node = this.node || {};
      return [
        {
          name: "取消订单",
          func: "cancelReturnPurchase",
          status: ["CREATED"],
          perm: "PURCHASE_RETURN_CANCEL",
        },
        {
          name: "快捷出库",
          func: "onQuickOut",
          status: ["FINISHED"],
          perm: "PURCHASE_RETURN_QUICK_OUT",
          color: "#e43d33",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
          perm: "PURCHASE_RETURN_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removeReturnPurchase",
          status: ["CANCELLED", "CREATED"],
          perm: "PURCHASE_RETURN_DELETE",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);
          const isStatus = item?.status?.includes?.(node.status);

          if (_isEqual(item.func, "cancelReturnPurchase")) {
            return isStatus && isPerm;
          }

          if (_isEqual(item.func, "onJump")) {
            if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) return item.status.includes(node.status) && this.isPerm("PURCHASE_RETURN_RE_ORDER");

            return (_isEqual(this.GET_PAGE_MENU_FUNC, 0) && item.status.includes(node.status)) && isPerm;
          }

          if (_isEqual("onQuickOut", item.func)) {
            return isPerm && isStatus && _isEqual(this.GET_PAGE_MENU_FUNC, 1);
          }

          return item.status.includes(node.status) && isPerm;
        });
    },
  },
};
</script>

<template>
  <view class="ko-purchase-refund-list">
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
            is-show-total-amount
            @click="onJumpDetails(item, 'purchaseReturn')"
            is-new

            :is-custom-status-name="isEqual(GET_PAGE_MENU_FUNC, 1)"
            custom-status-name="待付款"
          >
            <template #operate>
              <view
                style="display: flex; align-items: center; justify-content: flex-end;"
              >
                <button
                  class="ko-basic-button__card"
                  v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('PURCHASE_PRINT')"
                  @click.stop="onPrint(item, index)"
                >
                  打印单据
                </button>
                <button
                  v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('PURCHASE_RETURN_ADD_PAID_ORDER') || isPerm('PURCHASE_RETURN_PAID_ORDER'))"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item, index)"
                >
                  付款
                </button>
                <button
                  v-if="['CREATED'].includes(item.status) && isPerm('PURCHASE_RETURN_CONFIRM')"
                  class="ko-basic-button__card"
                  @click.stop="submitReturnPurchase(item, index)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item, index)"
                  v-if="GET_PAGE_MENU_FUNC === 2 ? item.totalAmount === 0 : true"
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
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJumpDetails($event, 'purchaseReturn')"
        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
      >
        <template #operate="{item, index}">
          <view
            style="display: flex; align-items: center; justify-content: center;"
          >
            <button
              v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('PURCHASE_PRINT')"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'purchaseReturn')"
            >
              打印单据
            </button>
            <button
              v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('PURCHASE_RETURN_ADD_PAID_ORDER') || isPerm('PURCHASE_RETURN_PAID_ORDER'))"
              class="ko-basic-button__card"
              @click.stop="onAddedDocuments(item, index)"
            >
              付款
            </button>
            <button
              v-if="['CREATED'].includes(item.status) && isPerm('PURCHASE_RETURN_CONFIRM')"
              class="ko-basic-button__card"
              @click.stop="submitReturnPurchase(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              提交订单
            </button>

            <button
              v-if="['FINISHED'].includes(item.status) && isPerm('PURCHASE_RETURN_QUICK_OUT') && isEqual(GET_PAGE_MENU_FUNC, 1)"
              class="ko-basic-button__card"
              @click.stop="onQuickOut(item, index)"
            >
              快捷出库
            </button>

            <button
              v-if="['CREATED'].includes(item.status) && isPerm('PURCHASE_RETURN_CANCEL')"
              class="ko-basic-button__card"
              @click.stop="cancelReturnPurchase(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              取消订单
            </button>
            <button
              v-if="['CREATED', 'CANCELLED', 'FINISHED'].includes(item.status) && GET_PAGE_MENU_FUNC !== 2 && ((isEqual(GET_PAGE_MENU_FUNC, 0) && isPerm('PURCHASE_RETURN_UPDATE')) || (isEqual(GET_PAGE_MENU_FUNC, 2) && isPerm('PURCHASE_RETURN_RE_ORDER')))"
              class="ko-basic-button__card"
              @click.stop="onJump(item, index)"
            >
              编辑
            </button>
            <button
              v-if="['CREATED', 'CANCELLED'].includes(item.status) && isPerm('PURCHASE_RETURN_DELETE')"
              class="ko-basic-button__card"
              @click.stop="removeReturnPurchase(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      v-if="isPerm('PURCHASE_RETURN_ADD')"
      @click="onTrigger('')"
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

    <BasicPopup :visible.sync="visible" title="库存不足">
      <view class="ko-purchase-refund-list__popup">
        <view v-for="(item, key) of inadequate" :key="key">
          <uni-section :title="item.key" type="line">
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
          </uni-section>
        </view>
      </view>
      <template #footer>
        <view style="padding: 0 10% 10px;">
          <button class="ko-basic-button__card" @click="visible = false">确认</button>
        </view>
      </template>
    </BasicPopup>

    <Pay
      ref="TPRef"
      @success="updateList(true)"
      @close="noRefresh = false"
    />
  </view>
</template>

<style lang="scss">
.ko-purchase-refund-list {
  padding-top: 10px;

  width: 100%;
  // #ifdef MP
  padding-bottom: 80px;
  // #endif

  :deep(.uni-list-item__container ) {
    display: block;
  }

  // #ifdef H5
  height: calc(100vh - 56px - 60px);
  display: flex;
  flex-direction: column;
  // #endif

  &__popup {
    // #ifdef MP
    width: 98vw;
    // #endif
    padding: 16px;
  }
}
</style>
