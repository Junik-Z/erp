<script>
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _isString } from "@/utils";
import {
  getMyReturnSaleListApi,
  getMySaleListApi,
  getMyStatisticsApi,
  getSaleDetailApi,
  getSaleReturnDetailApi,
} from "@/api/erp/sale";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "./components/OrderCard.vue";
import { CONFIG, PageEnums } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import KoMovable from "@/components/Movable/index.vue";
import SaleMixins from "./SaleMixins";
import TopMenus from "@/sale/components/TopMenus.vue";

const PageMenu = [
  {
    label: "销售",
    perm: "SALE_MY",
    func: 0,
  },
  {
    label: "销售退货",
    perm: "SALE_RETURN_MY",
    func: 1,
  },
];

export default {
  name: "MyOrderList",
  components: {
    TopMenus,
    KoMovable,
    UvActionSheet,
    OrderCard,
    KoList,
    HistoryBar,
    UniRow,
    UniCol,
    UvCountTo,
  },
  mixins: [mixins, SaleMixins],
  data() {
    const _this = this;
    return {
      CountList: [
        {
          label: "未结金额",
          key: "totalSignAmount",
          color: "#2979ff",
          unit: "元",
          span: 12,
        },
        {
          label: "未结订单",
          key: "totalSignCount",
          color: "#2979ff",
        },
      ],
      data: {},

      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
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
      PAGE_MENU: _deepCopy(PageMenu),

      MOVABLE_LIST: [
        // #ifdef H5
        {
          text: "定制",
          iconfont: "icon-dingzhishengchan",
          path: PageEnums.produceWork + "?ADDED_TYPE=xlsx&FORM=SALE&isClient=true",
          perm: "SALE_PRODUCE_ADD",
        },
        // #endif
        {
          text: "板材",
          iconfont: "icon-ziyuanicon",
          path: PageEnums.produceWork + "?ADDED_TYPE=packing&FORM=SALE&isClient=true",
          perm: "CNC_ADD_CUSTOMIZED_BOARD",
        },
        {
          text: "新增",
          iconfont: "icon-tianjia",
          path: PageEnums.NewSale + "?PAGE_TYPE=ADDED_SALE&isNormal=true",
          perm: "SALE_ADD",
        },
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
  created() {
    this.getCount();
  },
  methods: {
    getCount() {
      if (this.isPerm("SALE_MY_STATISTICS")) {
        getMyStatisticsApi()
          .then(res => {
            console.log(res.data);
            this.data = res.data;
          });
      }
    },

    getList(reset = false) {
      if (reset && !this.noRefresh) {
        this.tableKey = +new Date();
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (info && this.noRefresh && !this.isReturn && this.list.length) {
        this.updateList();
        return false;
      }

      this.loading = true;
      const Func = [getMySaleListApi, getMyReturnSaleListApi][this.GET_PAGE_MENU_FUNC];

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
          this.isReturn = false;

          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 处理添加修改
    onJumpEditor(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif
      this.noRefresh = true;
      if (_isEqual(this.GET_PAGE_MENU_FUNC, 1)) {
        this.jumpSaleReturn({
          PAGE_TYPE: "ADDED_REFUND_SALE",
          isNormal: true,
          ...(item?.id ? {id: item.id} : {}),
        });
      } else {
        if (this.isProductionOrder(item.orderType)) {
          this.noRefresh = true;
          uni.navigateTo({
            url: PageEnums.produceWork + `?id=${item.orderCode}&ADDED_TYPE=packing&FORM=SALE&isClient=true`,
          });
          return false;
        }

        this.jumpAddedSale({
          PAGE_TYPE: "ADDED_SALE",
          isNormal: true,
          ...(item?.id ? {id: item.id} : {}),
        });
      }
    },
    onActionClick(item, index) {
      this.nodeIndex = index;
      this.node = item;
      this.$refs.UASRef.open();
    },
    // 处理调用底部弹出的按钮
    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nodeIndex);
    },

    // 提交销售订单
    onSubmit(item, index) {
      const Func = this.GET_PAGE_MENU_FUNC ? this.submitRefundSale : this.submitSale;
      Func(item, index);
    },
    // 删除订单
    onRemove(item, index) {
      const Func = this.GET_PAGE_MENU_FUNC ? this.removeRefundSale : this.removeSale;
      Func(item, index);
    },
    // 取消订单
    onCancel(item, index) {
      const Func = this.GET_PAGE_MENU_FUNC ? this.cancelRefundSale : this.cancelSale;
      Func(item, index, true);
    },
    // 申请退货
    onReturn(item, index) {
      // #ifdef H5
      this.node = item;
      this.nodeIndex = index;
      // #endif

      this.noRefresh = true;
      this.isReturn = true;

      this.jumpSaleReturn({
        order_id: item.id,
        PAGE_TYPE: "ADDED_REFUND_SALE",
      });
    },

    updateList() {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? (_isString(info) ? info : info.id) : this.node.id;

      const Func = this.GET_PAGE_MENU_FUNC ? getSaleReturnDetailApi : getSaleDetailApi;

      Func({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });

    },

    // 处理添加
    onTrigger(event) {
      const {path} = event.item || {};
      if (path) {
        this.noRefresh = true;
        this.isNewList = true;

        uni.navigateTo({url: path});
      }
    },
  },
  computed: {
    getCountValue() {
      return (node) => {
        const value = _get(this.data, node.key);
        return node.unit === "元" ? this.toYuan(value) : value;
      };
    },

    actionList() {
      const node = this.node || {};
      return [
        {
          name: "申请退货",
          func: "onReturn",
          status: ["FINISHED"],
          perm: "SALE_RETURN_ADD",
        },
        {
          name: "取消订单",
          func: "onCancel",
          status: ["CREATED"],
          perm: "SALE_CANCEL",
          rPerm: "SALE_RETURN_CANCEL",
        },
        {
          name: "编辑",
          func: "onJumpEditor",
          status: ["CREATED", "CANCELLED"],
          perm: "SALE_UPDATE",
          rPerm: "SALE_RETURN_UPDATE",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
          status: ["CANCELLED", "CREATED"],
          perm: "SALE_DELETE",
          rPerm: "SALE_RETURN_DELETE",
        },
      ]
        .filter(item => {
          const isStatus = item?.status.includes(node.status);

          if (_isEqual(this.GET_PAGE_MENU_FUNC, 0)) {

            if (_isEqual("onReturn", item.func)) {
              return isStatus && this.isPerm(item.perm) && !this.isProductionOrder(node.orderType);
            }

            return isStatus && this.isPerm(item.perm);
          } else {
            return !_isEqual(item.func, "onReturn") && isStatus && this.isPerm(item.rPerm);
          }

        });
    },
  },
};
</script>

<template>
  <!-- #ifdef H5 -->
  <KoList
    class="ko-my-order-list"
    :no-more="noMore"
    hide-tips
    @load-next="RequestNextPage"
    @lower="RequestNextPage"
    :data="list"
    :loading="loading"
  >
    <!-- #endif -->

    <!-- #ifdef MP -->
    <view
      class="ko-my-order-list"
    >
      <!-- #endif -->
      <!-- #ifdef MP -->
      <Notice />
      <!-- #endif -->

      <TopMenus :path="PageEnums.saleMyList" />

      <view class="ko-basic-count__wrap">
        <UniRow :gutter="10" v-if="isPerm('SALE_MY_STATISTICS')">
          <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
            <view class="ko-basic-count">
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

        @change="getList(true)"
      />

      <view class="ko-my-order-list__wrap">
        <!-- #ifdef MP -->
        <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
          <view style="padding: 5px 10px">
            <OrderCard
              v-for="(item, index) of list"
              :key="item.id"
              :item="item"
              @click="onJumpDetails(item, GET_PAGE_MENU_FUNC ? 'saleReturn' : 'sale')"
              is-sales
              :spacing="10"
              is-new
            >
              <template #operate>
                <view style="display: flex; align-items: center; justify-content: flex-end;">
                  <!--<button
                    v-if="['CREATED'].includes(item.status)"
                    class="ko-basic-button__card"
                    @click.stop="onSubmit(item)"
                    :disabled="item.__s_loading__"
                    :loading="item.__s_loading__"
                  >
                    提交订单
                  </button>-->

                  <button
                    class="ko-basic-button__card"
                    @click.stop="onActionClick(item, index)"
                    v-if="[GET_PAGE_MENU_FUNC ? '' : 'FINISHED', 'CREATED', 'CANCELLED'].includes(item.status)"
                  >
                    更多
                  </button>
                </view>
              </template>
            </OrderCard>
          </view>
        </KoList>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <KoTable
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpDetails($event, GET_PAGE_MENU_FUNC ? 'saleReturn' : 'sale')"

          :no-more="noMore"
          no-refresh
        >
          <template #operate="{item, index}">
            <view style="display: flex; align-items: center; justify-content: center;">
              <button
                v-if="['FINISHED'].includes(item.status) && !GET_PAGE_MENU_FUNC && isPerm('SALE_RETURN_ADD')"
                class="ko-basic-button__card"
                @click.stop="onReturn(item, index)"
              >
                申请退货
              </button>

              <button
                class="ko-basic-button__card"
                @click.stop="onJumpEditor(item, index)"
                v-if="['CREATED', 'CANCELLED'].includes(item.status) && ((isEqual(GET_PAGE_MENU_FUNC, 0) && isPerm('SALE_UPDATE')) || (isEqual(GET_PAGE_MENU_FUNC, 1) && isPerm('SALE_RETURN_UPDATE')))"
              >
                修改
              </button>
              <button
                class="ko-basic-button__card"
                @click.stop="onCancel(item, index)"
                v-if="['CREATED'].includes(item.status) && ((isEqual(GET_PAGE_MENU_FUNC, 0) && isPerm('SALE_CANCEL')) || (isEqual(GET_PAGE_MENU_FUNC, 1) && isPerm('SALE_RETURN_CANCEL')))"
              >
                取消订单
              </button>
              <button
                class="ko-basic-button__card"
                @click.stop="onRemove(item, index)"
                :loading="item.__r_loading__"
                :disabled="item.__r_loading__"
                v-if="['CANCELLED', 'CREATED'].includes(item.status) && ((isEqual(GET_PAGE_MENU_FUNC, 0) && isPerm('SALE_DELETE')) || (isEqual(GET_PAGE_MENU_FUNC, 1) && isPerm('SALE_RETURN_DELETE')))"
              >
                删除
              </button>
            </view>
          </template>
        </KoTable>
        <!-- #endif -->
      </view>

      <KoMovable
        :content="GET_MOVABLE_LIST"
        @click="onTrigger"
        v-if="!GET_PAGE_MENU_FUNC && isShowMovable"
      />

      <!-- #ifdef MP -->
      <UvActionSheet
        ref="UASRef"
        :actions="actionList"
        safe-area-inset-bottom
        round="10"
        cancel-text="取消"
        @select="onSelect"
      />

    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
  </KoList>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-my-order-list {
  margin-top: 10px;

  // #ifdef H5
  height: calc(100vh - 64px - 50px);

  /*.ko-history {
    width: 500px;
  }*/

  // #endif
}
</style>
