<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import {
  getSaleReturnDetailApi,
  getSaleReturnHistoryApi,
  getSaleReturnListApi,
  getSaleReturnWaitPaymentApi,
  returnPrintSaleApi,
} from "@/api/erp/sale";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _isString, _pick, CustomToast } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/erp/components/PrintList/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import SaleMixins from "../SaleMixins";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import Pay from "@/erp/components/Pay/Pay.vue";

const PageMenu = [
  {
    label: "待处理",
    perm: "SALE_RETURN_LIST",
    func: 0,
  },
  {
    label: "待退款",
    perm: "SALE_RETURN_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "SALE_RETURN_HISTORY",
    func: 2,
  },
];

export default {
  name: "RefundList",
  components: {
    Pay,
    UniEasyinput,
    KoList,
    KoMovable,
    PrintList,
    UvActionSheet,
    OrderCard,
    HistoryBar,
    LoadMore,
    UniCol,
    UniRow,
    BasicCard,
  },
  mixins: [mixins, SaleMixins],
  created() {
    this.PAGE_MENU = _deepCopy(PageMenu);
  },
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
            title: "填写信息",
            content: "邀请您填写信息，方便下次联系。",
            path: PageEnums.saleRefund,
          },
        },
        // #endif
        {
          text: "新增",
          iconfont: "icon-tianjia",
          path: PageEnums.saleRefund,
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
      isNewList: false,
      values: [
        "待处理",
        "待退款",
        "已完成",
      ],
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

      console.log(info, "新增数据");

      if (this.noRefresh && info && this.list.length && (!this.isNewList || this.GET_PAGE_MENU_FUNC === 0)) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = [getSaleReturnListApi, getSaleReturnWaitPaymentApi, getSaleReturnHistoryApi][this.GET_PAGE_MENU_FUNC];

      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
          console.log(res);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;
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
      this.jumpSaleReturn({id: item.id});
    },

    onResetList() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.getList(true);
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;

      this.jumpSaleAddedDocuments({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount", "orderType"]),
        FORM: "SALE_RETURN",
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
      returnPrintSaleApi(data)
        .then(() => {
          CustomToast({
            title: "请求成功",
          });
        });
    },

    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      getSaleReturnDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data, isPayment);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });

    },
  },
  computed: {
    actionList() {
      const node = this.node;
      return [
        {
          name: "取消订单",
          func: "cancelRefundSale",
          status: ["CREATED", "FINISHED"],
          perm: "SALE_RETURN_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
          perm: "SALE_RETURN_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removeRefundSale",
          status: ["CANCELLED", "CREATED"],
          perm: "SALE_RETURN_DELETE",
        },
      ]
        .filter(item => {
          const isPerm = this.isPerm(item.perm);

          if (_isEqual(item.func, "cancelRefundSale")) {
            return (["CREATED"].includes(node.status) || (["FINISHED"].includes(node.status) && node.totalAmount === 0)) && isPerm;
          }

          if (_isEqual(item.func, "onJump")) {
            if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) return item.status.includes(node.status) && this.isPerm("SALE_RETURN_RE_ORDER");

            return (_isEqual(this.GET_PAGE_MENU_FUNC, 0) && item.status.includes(node.status)) && isPerm;
          }

          return item.status.includes(node.status) && isPerm;
        });
    },
  },
};
</script>

<template>
  <view class="ko-client">
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
            is-sales
            :item="item"
            @click="onJumpDetails(item, 'saleReturn')"
            is-show-total-amount
            is-new
            :is-custom-status-name="isEqual(GET_PAGE_MENU_FUNC, 1)"
            custom-status-name="待退款"
          >
            <template #operate>
              <view
                style="display: flex; align-items: center; justify-content: flex-end;"
              >
                <button
                  class="ko-basic-button__card"
                  @click.stop="onPrint(item, index)"
                  v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('SALE_PRINT')"
                >
                  打印单据
                </button>
                <button
                  v-if="['CREATED'].includes(item.status) && isPerm('SALE_RETURN_CONFIRM')"
                  class="ko-basic-button__card"
                  @click.stop="submitRefundSale(item, index)"
                  :disabled="item.__s_loading__"
                  :loading="item.__s_loading__"
                >
                  提交订单
                </button>

                <button
                  v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('SALE_RETURN_ADD_RETURNED_ORDER') || isPerm('SALE_RETURN_RETURNED_ORDER'))"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item, index)"
                >
                  退款
                </button>

                <button
                  class="ko-basic-button__card"
                  @click.stop="onActionClick(item, index)"
                  v-if="GET_PAGE_MENU_FUNC !== 2"
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
    <view style="padding: 10px;flex: 1;overflow: hidden">
      <KoTable
        :key="tableKey"
        :loading="loading"
        :columns="columns"
        :data="list"
        empty-text="暂无数据"
        stripe
        @row-click="onJumpDetails($event, 'saleReturn')"

        @next-load="onRequestNextPage"
        :no-more="noMore || loading"
        :no-refresh="noRefresh"
      >
        <template #operate="{item, index}">
          <view
            style="display: flex; align-items: center; justify-content: center;"
          >
            <button
              v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('SALE_PRINT')"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'saleReturn')"
            >
              打印单据
            </button>
            <button
              v-if="['CREATED'].includes(item.status) && isPerm('SALE_RETURN_CONFIRM')"
              class="ko-basic-button__card"
              @click.stop="submitRefundSale(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              提交订单
            </button>
            <button
              v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('SALE_RETURN_ADD_RETURNED_ORDER') || isPerm('SALE_RETURN_RETURNED_ORDER'))"
              class="ko-basic-button__card"
              @click.stop="onAddedDocuments(item, index)"
            >
              退款
            </button>


            <button
              v-if="['CREATED'].includes(item.status) && isPerm('SALE_RETURN_CANCEL')"
              class="ko-basic-button__card"
              @click.stop="cancelRefundSale(item, index)"
            >
              取消订单
            </button>

            <button
              v-if="['FINISHED', 'CREATED', 'CANCELLED'].includes(item.status) && (isEqual(GET_PAGE_MENU_FUNC, 1) && isPerm('SALE_RETURN_RE_ORDER') || isEqual(GET_PAGE_MENU_FUNC, 0) && isPerm('SALE_RETURN_UPDATE'))"
              class="ko-basic-button__card"
              @click.stop="onJump(item, index)"
            >
              编辑
            </button>

            <button
              v-if="['CANCELLED', 'CREATED'].includes(item.status) && isPerm('SALE_RETURN_DELETE')"
              class="ko-basic-button__card"
              @click.stop="removeRefundSale(item, index)"
            >
              删除
            </button>

          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      v-if="isPerm('SALE_RETURN_ADD')"
      @click="jumpSaleReturn({})"
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

<style scoped lang="scss">
.ko-client {
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
