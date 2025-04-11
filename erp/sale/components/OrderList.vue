<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";
import {
  getSaleDetailApi,
  getSaleHistoryApi,
  getSaleListApi,
  getSaleWaitPaymentListApi,
  printSaleApi,
  quickOutApi,
} from "@/api/erp/sale";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, _isString, _keys, _pick, CustomToast } from "@/utils";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import PrintList from "@/erp/components/PrintList/PrintList.vue";
import KoMovable from "@/components/Movable/index.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import SaleMixins from "../SaleMixins";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import Pay from "../../components/Pay/Pay.vue";
import { getOrderCodeDetailApi } from "@/api/erp/produce";
import PickerCalendars from "../../components/uv-calendars/PickerCalendars.vue";

const PageMenu = [
  {
    label: "待处理",
    perm: "SALE_LIST",
    func: 0,
  },
  {
    label: "待付款",
    perm: "SALE_WAIT_PAYMENT",
    func: 1,
  },
  {
    label: "已完成",
    perm: "SALE_HISTORY",
    func: 2,
  },
];

export default {
  name: "OrderList",
  components: {
    PickerCalendars,
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
  mixins: [mixins, SaleMixins],
  data() {
    const _this = this;
    return {
      MOVABLE_LIST: [
        // #ifdef MP
        {
          text: "分享",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.editSale,
            query: {
              PAGE_TYPE: "ADDED_SALE",
            },
          },
          perm: "SALE_SHARE",
        },
        {
          text: "板材",
          iconfont: "icon-icon-test",
          path: "share",
          openType: "share",
          params: {
            title: `邀请您来下单啦！`,
            path: PageEnums.produceWork,
            query: {
              PAGE_TYPE: "ADDED_PRODUCE_PACKING",
              ADDED_TYPE: "packing",
              FORM: "SALE",
            },
          },
          perm: "SALE_SHARE",
        },
        // #endif
        /*  {
           text: "生产",
           iconfont: "icon-shengchan",
           path: PageEnums.produceWork + "?ADDED_TYPE=common&FORM=SALE",
         }, */
        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          perm: "SALE_PRODUCE_ADD",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx&FORM=SALE",
        },
        // #endif
        {
          text: "板材",
          iconfont: "icon-ziyuanicon",
          perm: "CNC_ADD_CUSTOMIZED_BOARD",
          path: PageEnums.produceWork + "?ADDED_TYPE=packing&FORM=SALE",
        },
        {
          text: "新增",
          iconfont: "icon-tianjia",
          perm: "SALE_ADD",
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

    getList(reset) {
      if (reset && !this.noRefresh) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && !this.isReturn && this.list.length && (!this.isNewList || this.GET_PAGE_MENU_FUNC === 0)) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = [getSaleListApi, getSaleWaitPaymentListApi, getSaleHistoryApi][this.GET_PAGE_MENU_FUNC];
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

    onResetList() {
      this.noRefresh = false;
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.getList(true);
    },

    onJump(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      if (this.isProductionOrder(item.orderType)) {
        uni.navigateTo({
          url: PageEnums.produceWork + `?id=${item.orderCode}&ADDED_TYPE=packing&FORM=SALE`,
        });
        return false;
      }

      this.jumpAddedSale({id: item.id}, this.nodeIndex);
    },

    onToDetails(item) {
      if (this.isProductionOrder(item.orderType)) {
        uni.setStorageSync("TO_DETAILS", true);

        uni.navigateTo({
          url: PageEnums.produceDetails + `?id=${item.orderCode}&FORM=SALE`,
        });
        return false;
      }
      this.onJumpDetails(item, "sale");
    },

    onTrigger(event) {
      const {path} = event.item || {};
      if (path) {
        this.noRefresh = true;
        this.isNewList = true;

        uni.navigateTo({url: path});
      }
    },

    // 添加单据
    onAddedDocuments(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.noRefresh = true;

      this.jumpSaleAddedDocuments({
        ..._pick(item, ["id", "orderCode", "supplierId", "purchaserId", "totalAmount"]),
        FORM: "SALE",
        noUnable: true,
      });
    },
    // 申请退货
    onReturn(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      this.isReturn = true;
      this.jumpSaleReturn({order_id: item.id});
    },

    onRowClick(row) {
      this.onToDetails(row, "sale");
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      item.func && this[item.func] && this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 开启打印
    onPrint(item) {
      this.$refs.PLRef.open({orderId: item.id});
    },
    // 开始打印
    startPrint(data) {
      printSaleApi(data)
        .then(() => {
          CustomToast({
            title: "请求成功",
          });
        });
    },

    // 更新列表数据
    updateList(isPayment = false) {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;
      const Func = _isEqual("customized", info?.produceType) ? getOrderCodeDetailApi : getSaleDetailApi;

      id && Func({id})
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
  computed: {
    actionList() {
      const node = this.node;
      return [
        {
          name: "分享订单",
          openType: "share",
          perm: "SHARE_ORDER",
          params: {
            title: `分享订单！`,
            path: PageEnums.produceWork,
            query: {
              PAGE_TYPE: "SHARE_ORDER",
              FORM: "SALE",
              queryList: node,
            },
          },
        },
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
          perm: "SALE_RETURN_ADD",
        },
        {
          name: "快捷出库",
          func: "onQuickOut",
          status: ["FINISHED"],
          perm: "SALE_QUICK_OUT",
          color: "#e43d33",
        },
        {
          name: "取消订单",
          func: "cancelSale",
          status: ["CREATED"],
          perm: "SALE_CANCEL",
        },
        {
          name: "编辑",
          func: "onJump",
          status: ["CREATED", "CANCELLED", "FINISHED"],
          perm: "SALE_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "removeSale",
          status: ["CANCELLED", "CREATED"],
          perm: "SALE_DELETE",
        },
      ]
        .filter(item => {
          const isStatus = item.status?.includes?.(node.status);

          if (_isEqual(item.func, "onJump")) {
            return this.isEditorButton(node) && isStatus;
          }

          const isPerm = this.isPerm(item.perm);

          if (_isEqual("onReturn", item.func)) {
            return isPerm && isStatus && !this.isProductionOrder(item.orderType);
          }

          if (_isEqual("onQuickOut", item.func)) {
            return isPerm && isStatus && _isEqual(this.GET_PAGE_MENU_FUNC, 1);
          }

          return isPerm && isStatus || (isPerm && _isEqual(item.openType, "share") && this.isProductionOrder(node.orderType));
        });
    },

    // 判断是不是要显示编辑按钮
    isEditorButton() {
      return (node) => {
        if (_isEqual(this.GET_PAGE_MENU_FUNC, 0) && this.isProductionOrder(node.orderType)) {
          return this.isPerm("SALE_PRODUCE_UPDATE");
        }

        if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) {
          // 待付款生产工单不能编辑
          if (this.isProductionOrder(node.orderType)) {
            return false;
          }

          // 是否可以重新下单
          return this.isPerm("SALE_RE_ORDER");
        }

        return !_isEqual(this.GET_PAGE_MENU_FUNC, 2) && this.isPerm("SALE_UPDATE");
      };
    },
  },
};
</script>

<template>
  <view class="ko-order">
    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"

      @change="onResetList()"
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
          <UniCol :span="24" v-if="false">
            <PickerCalendars
              placeholder="请选择开始结束时间"
              mode="range"
              @confirm="onCalendarConfirm"
              ref="PCRef"
            />
          </UniCol>
          <UniCol :span="24">
            <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onResetList()">重置</button>
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </HistoryBar>

    <!-- #ifdef MP -->
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="(item, index) of list" :key="item.id">
          <OrderCard
            :item="item"
            @click="onToDetails(item, 'sale')"
            is-sales
            is-new
            :is-custom-status-name="isEqual(GET_PAGE_MENU_FUNC, 1)"
            custom-status-name="待付款"
          >
            <template #operate>
              <view style="display: flex; align-items: center; justify-content: flex-end;">
                <button
                  v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('SALE_PRINT')"
                  class="ko-basic-button__card"
                  @click.stop="onPrint(item, index)"
                >
                  打印单据
                </button>
                <button
                  v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('SALE_ADD_PAID_ORDER') || isPerm('SALE_PAID_ORDER'))"
                  class="ko-basic-button__card"
                  @click.stop="onAddedDocuments(item, index)"
                >
                  付款
                </button>
                <button
                  v-if="['CREATED'].includes(item.status) && isPerm('SALE_SUBMIT')"
                  class="ko-basic-button__card"
                  @click.stop="submitSale(item, index)"
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
    <view style="padding: 10px;flex: 1;overflow: hidden;">
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
              v-if="['FINISHED'].includes(item.status) && !item.confirmable && (isPerm('SALE_ADD_PAID_ORDER') || isPerm('SALE_PAID_ORDER'))"
              class="ko-basic-button__card"
              @click.stop="onAddedDocuments(item, index)"
            >
              付款
            </button>
            <button
              v-if="['FINISHED'].includes(item.status) && !isProductionOrder(item.orderType)"
              class="ko-basic-button__card"
              @click.stop="onReturn(item, index)"
            >
              申请退货
            </button>
            <button
              v-if="['FINISHED', 'CREATED'].includes(item.status) && isPerm('SALE_PRINT')"
              class="ko-basic-button__card"
              @click.stop="onJumpPrint(item, 'sale')"
            >
              打印单据
            </button>
            <button
              v-if="['FINISHED'].includes(item.status) && isPerm('SALE_QUICK_OUT') && isEqual(GET_PAGE_MENU_FUNC, 1)"
              class="ko-basic-button__card"
              @click.stop="onQuickOut(item, index)"
            >
              快捷出库
            </button>
            <button
              v-if="['CREATED'].includes(item.status) && isPerm('SALE_SUBMIT')"
              class="ko-basic-button__card"
              @click.stop="submitSale(item, index)"
              :disabled="item.__s_loading__"
              :loading="item.__s_loading__"
            >
              提交订单
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="onJump(item, index)"
              v-if="['CREATED', 'CANCELLED', 'FINISHED'].includes(item.status) && isEditorButton(item) && isPerm('SALE_UPDATE')"
            >
              修改
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="cancelSale(item, index)"
              v-if="['CREATED'].includes(item.status) && isPerm('SALE_CANCEL')"
            >
              取消
            </button>
            <button
              class="ko-basic-button__card"
              @click.stop="removeSale(item, index)"
              :loading="item.__r_loading__"
              :disabled="item.__r_loading__"
              v-if="['CANCELLED', 'CREATED'].includes(item.status) && isPerm('SALE_DELETE')"
            >
              删除
            </button>
          </view>
        </template>
      </KoTable>
    </view>
    <!-- #endif -->

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable"
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

    <BasicPopup :visible.sync="visible" title="库存不足">
      <view class="ko-order__popup">
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
        <view style="display: flex;justify-content: center;align-items: center;">
          <button style="width: 120px" class="ko-basic-button__card" @click="visible = false">确认</button>
        </view>
      </template>
    </BasicPopup>

    <Pay
      ref="TPRef"
      @close="updateList(true); noRefresh = false"
    />
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

  &__popup {
    // #ifdef MP
    width: 98vw;
    // #endif
    padding: 16px;
  }
}
</style>
