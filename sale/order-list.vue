<script>
import TopMenus from "./components/TopMenus.vue";
import { getCustomerAddressListApi, getCustomerListApi, getSaleList2Api } from "@/api/erp/sale";
import { _deepCopy, _isEmpty, _isEqual } from "@/utils";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniSkeletons from "@/uni_modules/uv-skeletons/components/uv-skeletons/uv-skeletons.vue";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import sale from "./sale";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import KoMovable from "@/components/Movable/index.vue";
import GenerateCode from "./components/GenerateCode.vue";
import Pay from "./components/Pay/Pay.vue";
import PrintList from "./components/PrintList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { PageEnums } from "@/utils/config";

// 索引列表
const IndexMenus = () => "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default {
  name: "OrderList",
  mixins: [sale],
  components: {
    BasicCard,
    GenerateCode,
    KoMovable,
    PickerCalendars,
    UniSkeletons,
    TopMenus,
    UvAvatar,
    UvLoadingIcon,
    KoList,
    OrderCard,
    HistoryBar,
    UniRow,
    UniCol,
    UniEasyinput,
    Pay,
    PrintList,
    UvActionSheet,
  },
  data() {
    return {
      rootId: null,
      cQuery: {
        pageNum: 0,
        pageSize: 20,
        nameIndex: "",
      },
      cList: [],
      cMore: false,
      cLoading: false,

      aId: null,
      aQuery: {
        pageNum: 0,
        pageSize: 20,
      },
      aList: [],
      aMore: false,
      aLoading: false,

      oList: [],
      oMore: false,
      oLoading: false,
      oQuery: {
        pageNum: 0,
        pageSize: 20,
      },

      ViewID: null,
      AViewId: null,

      isSearch: false,
      sLoading: false,
      sMore: false,
      sList: [],
      sQuery: {
        pageNum: 0,
        pageSize: 20,
        orderCode: "",
        "user.nickName": "",
      },
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getCNode(item) {
      return {
        ...item,
        value: item.id,
        label: item.name,
        logo: item.logo,
      };
    },
    // 获取客户列表
    getList(reset) {
      if (reset) {
        this.cList = [];
        this.cQuery.pageNum = 0;
        this.aId = null;
        this.rootId = null;
        this.aList = [];
        this.aQuery = _deepCopy(this.$options.data().aQuery);
      }
      this.cLoading = true;
      getCustomerListApi(this.cQuery)
        .then(res => {
          const list = (res.data || []).map(this.getCNode);
          this.cList = this.onMergeArrays(this.cList, list, "id");
          this.cMore = _isEmpty(list) || list.length < this.cQuery.pageSize;

          if (!this.rootId && list?.[0]?.value) {
            this.rootId = list[0]?.value;
            this.getAddressList(true);
          }
        })
        .finally(() => {
          this.cLoading = false;
        });
    },

    // 取消客户搜索
    onClientCancel() {
      this.cQuery = _deepCopy(this.$options.data().cQuery);
      this.getList(true);
    },

    // 折叠组件触发
    onRootChange(node) {
      if (_isEqual(node.value, this.rootId)) {
        // this.rootId = null;
        return false;
      }
      // 重置搜索列表
      this.onSReset();

      this.rootId = node.value;
      this.getAddressList(true);

      this.toRootItem();
    },

    // 定位到客户
    toRootItem() {
      this.rTime && clearTimeout(this.rTime);
      this.ViewID = null;

      this.rTime = setTimeout(() => {
        this.ViewID = `root-${this.rootId}`;
      }, 400);
    },

    // 定位到地址
    toDzItem() {
      this.dTime && clearTimeout(this.dTime);
      this.AViewId = null;

      this.dTime = setTimeout(() => {
        this.AViewId = `dz-${this.aId}`;
      }, 400);
    },

    // 取消地址搜索
    onAddressCancel() {
      if (this.isSearch) {
        this.getSList(true);
        return false;
      }

      this.aQuery = _deepCopy(this.$options.data().aQuery);
      this.getAddressList(true);
    },

    // 获取相应的地址
    getAddressList(reset) {
      if (this.isSearch) {
        this.getSList();
        return false;
      }

      if (reset) {
        this.aList = [];
        this.aQuery.pageNum = 0;
      }

      this.aLoading = true;

      getCustomerAddressListApi({id: this.rootId, ...this.aQuery, queryNoAddress: true})
        .then(res => {
          const data = res.data;
          this.aList = this.onMergeArrays(this.aList, data, "id");
          this.aMore = _isEmpty(data) || data.length < this.aQuery.pageSize;
          this.aId = this.aList?.[0]?.id || null;

          if (this.aId) {
            this.getOrderList(true);
          }
        })
        .catch(() => {
          this.aMore = true;
        })
        .finally(() => {
          this.aLoading = false;
        });
    },
    // 点击地址
    onAChange(dz) {
      if (_isEqual(dz.id, this.aId)) {
        this.aId = null;
        return false;
      }

      this.aId = dz.id;
      this.getOrderList(true);
    },

    // 获取订单列表
    getOrderList(reset) {
      if (reset) {
        this.oList = [];
        this.oQuery.pageNum = 0;
      }

      this.oLoading = true;

      const dz = this.aList.find(v => _isEqual(v.id, this.aId));
      // const Func = [getSaleListApi, getSaleWaitPaymentListApi, getSaleHistoryApi][this.GET_PAGE_MENU_FUNC];
      getSaleList2Api({
        ...this.oQuery,
        supplierId: this.rootId,
        queryNoAddress: _isEqual(dz.id, "1"),
        orderAddress: _isEqual(dz.id, "1") ? "" : dz.address,
      })
        .then(res => {
          const data = res.data;
          this.oList = this.onMergeArrays(this.oList, data);
          this.oMore = _isEmpty(data) || data.length < this.oQuery.pageSize;
        })
        .finally(() => {
          this.oLoading = false;
          this.toDzItem();
        });
    },

    // 获取下一页的订单列表
    onNextOrderList() {
      if (this.oMore || this.oLoading) return false;
      this.oQuery.pageNum += 1;
      this.getOrderList();
    },

    // 获取下一页的客户
    onLowerClient() {
      if (this.cMore || this.cLoading) return false;
      this.cQuery.pageNum += 1;
      this.getList();
    },

    // 重置搜索列表
    onResetList() {
      this.oQuery = _deepCopy(this.$options.data().oQuery);
      // #ifdef MP
      this.$refs.SearchRef && this.$refs?.SearchRef?.forEach(item => item?.onShowSearch?.(false));
      this.$refs.PCRef && this.$refs.PCRef?.forEach(item => item?.clearable?.());
      // #endif
      // #ifdef H5
      this.$refs.SearchRef && this.$refs?.SearchRef?.onShowSearch?.(false);
      this.$refs.PCRef && this.$refs.PCRef?.clearable?.();
      // #endif

      this.getOrderList(true);
    },

    // 确定开始结束时间了
    onCalendarConfirm(event) {
      if (event) {
        const r = event.range || {};
        this.sQuery.startTime = r.before ? r.before + " 00:00:00" : "";
        this.sQuery.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.sQuery.startTime = "";
        this.sQuery.endTime = "";
      }
    },

    // 处理索引搜索
    onNameIndexSearch(index) {
      if (_isEqual(this.cQuery.nameIndex, index)) {
        this.cQuery.nameIndex = "";
      } else
        this.cQuery.nameIndex = index;

      this.getList(true);
    },

    // 加载下一页地址列表
    onLowerAddress() {
      if (this.aMore || this.aLoading) return false;
      this.aQuery.pageNum += 1;

      this.getAddressList();
    },

    // 开启搜索
    onOpenSearch() {
      this.isSearch = !this.isSearch;

      if (this.isSearch) {
        this.aQuery.address = "";
        this.sQuery = _deepCopy(this.$options.data().sQuery);
        this.$refs.PCRef && this.$refs.PCRef.clearable();
      }
    },

    // 重置列表
    onSReset() {
      this.sQuery = _deepCopy(this.$options.data().sQuery);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.aQuery.address = "";
      this.sList = [];
      this.isSearch = false;
    },

    // 处理下一页数据
    onSNext() {
      if (this.sMore) return false;
      this.sQuery.pageNum += 1;
      this.getSList();
    },

    // 获取搜索列表
    getSList(reset) {
      if (reset) {
        this.sList = [];
        this.sQuery.pageNum = 0;
      }

      this.sLoading = true;

      // const Func = [getSaleListApi, getSaleWaitPaymentListApi, getSaleHistoryApi][this.GET_PAGE_MENU_FUNC];
      getSaleList2Api({
        ...this.sQuery,
        supplierId: this.rootId,
        orderAddress: this.aQuery.address,
      })
        .then(res => {
          const data = res.data;
          this.sList = this.onMergeArrays(this.sList, data);
          this.sMore = _isEmpty(data) || data.length < this.sQuery.pageSize;
        })
        .finally(() => {
          this.sLoading = false;
        });
    },

    // 开单
    toPlaceAnOrder(dz) {
      const query = `?supplierId=${this.rootId}&isFast=true` + (_isEqual(dz.id, "1") ? "" : `&address=${dz.address}`);
      const path = !this.sBill ? (PageEnums.NewSale + query) : (PageEnums.shopping + `${query}&PAGE_TYPE=SALE`);
      uni.navigateTo({url: path});
    },
  },
  computed: {
    skeleton() {
      return [
        {
          type: "flex",
          num: 1,
          style: "padding: 10px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 8px; height: 32px; width: 32px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 1,
              style: ["marginTop: 5px; width: 200px; height: 20px;"],
            },
          ],
        },
        {
          type: "flex",
          num: 1,
          style: "padding: 10px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 8px; height: 32px; width: 32px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 1,
              style: ["marginTop: 5px; width: 200px; height: 20px;"],
            },
          ],
        },
        {
          type: "flex",
          num: 1,
          style: "padding: 10px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 8px; height: 32px; width: 32px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 1,
              style: ["marginTop: 5px; width: 200px; height: 20px;"],
            },
          ],
        },
      ];
    },

    IndexList: IndexMenus,

    // #ifdef H5 | MP
    // 获取选中的客户
    cRoot() {
      return (this.cList || [])?.find(v => _isEqual(v.value, this.rootId)) || {};
    },

    // 获取选中的客户地址
    gOrder() {
      return ((this.cRoot || {})?.aList || []).find(v => _isEqual(v.id, this.aId)) || {};
    },
    // #endif

    // 订单操作
    /* actionList() {
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
          name: "生成订单二维码",
          func: "onGenerateCode",
        },
        {
          name: "打印单据",
          func: "onPrint",
          perm: "SALE_PRINT",
          status: ["FINISHED", "CREATED"],
        },
        {
          name: "付款",
          func: "onAddedDocuments",
          status: ["FINISHED"],
        },
        {
          name: "提交订单",
          func: "submitSale",
          status: ["CREATED"],
          perm: ["SALE_SUBMIT"],
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
          if (_isEqual(item.func, "onGenerateCode")) return true;

          const isStatus = item.status?.includes?.(node.status);

          if (_isEqual(item.func, "onAddedDocuments")) return isStatus && !node.confirmable && (this.isPerm("SALE_ADD_PAID_ORDER") || this.isPerm("SALE_PAID_ORDER"));

          if (_isEqual(item.func, "onJump")) {
            return this.isEditorButton(node) && isStatus;
          }

          const isPerm = this.isPerm(item.perm);

          if (_isEqual("onReturn", item.func)) {
            return isPerm && isStatus && !this.isProductionOrder(item.orderType);
          }

          if (_isEqual("onQuickOut", item.func)) {
            return isPerm && isStatus;
          }

          return isPerm && isStatus || (isPerm && _isEqual(item.openType, "share") && this.isProductionOrder(node.orderType));
        });
    }, */
  },
};
</script>

<template>
  <view class="ko-wrapper">
    <!-- #ifdef MP -->
    <scroll-view scroll-y class="ko-order-list">
      <Notice />
      <TopMenus :path="PageEnums.saleOrderList" />

      <!-- 内容 -->
      <view class="ko-sale">
        <view class="ko-sale__wrap">
          <view class="ko-sale__left">
            <view class="ko-client__search">
              <uni-search-bar
                v-model="cQuery.name"
                placeholder="请输入"
                @confirm="getList(true)"
                @cancel="onClientCancel"
                clear-button="none"
                style="flex: 1; overflow: hidden;"
                bg-color="transparent"
                border
              />
            </view>
            <view class="ko-client">
              <KoList
                :loading="cLoading"
                :no-more="cMore"
                :no-data="!cMore && !cLoading && !cList.length"
                :data="cList"
                @lower="onLowerClient"
                @load-next="onLowerClient"
                :scroll-into-view="ViewID"
              >
                <view class="ko-client__wrap">
                  <view
                    v-for="root of cList"
                    :key="root.value"
                    :class="{'is-root-active': isEqual(root.value, rootId)}"
                    class="ko-client__name"
                    @click.stop="onRootChange(root)"
                    :id="`root-${root.value}`"
                  >
                    <UvAvatar random-bg-color :text="root.label" :src="getImageUrl(root.logo)" size="32px" />
                    <view class="ko-client__name--wrap">
                      <text class="ko-client__name--text ko-text-wrap">{{ root.label }}</text>
                      <view class="ko-client__money">
                        <!--<block v-if="root.amount < 0">欠</block>-->
                        ¥{{ toYuan(Math.abs(root.amount || 0)) }}
                      </view>
                    </view>
                  </view>
                </view>
              </KoList>
            </view>
          </view>

          <view class="ko-sale__right">
            <view class="ko-address__search">
              <uni-search-bar
                v-model="aQuery.address"
                placeholder="请输入地址"
                @confirm="getAddressList(true)"
                @cancel="onAddressCancel"
                clear-button="none"
                style="flex: 1; overflow: hidden;"
                bg-color="transparent"
                border
              />

              <button
                class="ko-basic-button__card ko-client__switch"
                @click="onOpenSearch"
              >
                <uni-icons color="#fff" type="search" />
              </button>

              <button
                class="ko-basic-button__card ko-client__switch"
                @click="onSwitchStyle"
              >
                <uni-icons color="#fff" :type="!sSale ? 'list' : 'tune-filled'" />
              </button>
            </view>

            <view class="ko-search" :class="{'is-o-active': isSearch}">
              <UniRow :gutter="10">
                <UniCol :span="24">
                  <UniEasyinput v-model="sQuery.orderCode" placeholder="请输入编号" />
                </UniCol>
                <UniCol :span="24">
                  <UniEasyinput v-model="sQuery['user.nickName']" placeholder="请输入下单用户名称" />
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
                  <view
                    style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;"
                  >
                    <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onSReset">
                      重置
                    </button>
                    <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getSList(true)">
                      搜索
                    </button>
                  </view>
                </UniCol>
              </UniRow>
            </view>

            <view class="ko-address">
              <!-- 地址列表 -->
              <block v-if="!isSearch">
                <KoList
                  :loading="aLoading"
                  :no-more="aMore"
                  :no-data="!aMore && !aLoading && !aList.length"
                  :data="aList"
                  @lower="onLowerAddress"
                  @load-next="onLowerAddress"
                  no-more-text="该客户没有更多地址了"
                  :scroll-into-view="AViewId"
                >
                  <view class="ko-address__wrap">
                    <view
                      class="ko-address__item"
                      v-for="dz of aList"
                      :key="dz.id"
                      :class="{'is-a-active': isEqual(dz.id, aId)}"
                      :id="`dz-${dz.id}`"
                    >
                      <view
                        class="ko-address__name"
                        @click.stop="onAChange(dz, cRoot)"
                      >
                        <view class="ko-address__name--info ko-address__name--item" style="overflow: hidden;">
                          <view class="ko-text-wrap" style="flex: 1;">{{ dz.address }}</view>
                          <button class="ko-text-wrap__btn" @click.stop="toPlaceAnOrder(dz)">开单</button>
                        </view>
                        <view class="ko-address__name--item" style="margin-top: 2px;">
                          <view class="ko-address__name--total">
                            <view class="ko-address__name--num">
                              待处理: {{ dz.pendingQuantity }}
                            </view>
                            <view class="ko-address__name--num">
                              待付款: {{ dz.pendingPaymentQuantity }}
                            </view>
                            <view class="ko-address__name--num">
                              ¥{{ toYuan(dz.amount) }}
                            </view>
                          </view>

                          <view class="ko-address__item--down">
                            <uni-icons type="down" :size="18" color="#8f939c" />
                          </view>
                        </view>
                      </view>

                      <view class="ko-address__list">
                        <KoList
                          :data="oList"
                          :no-more="oMore"
                          :loading="oLoading"
                          :no-data="!oMore && !oLoading && !oList.length"
                          @lower="onNextOrderList"
                        >
                          <view style="padding-top: 6px;">
                            <view class="ko-address__list--item" v-for="item of oList" :key="item.id">
                              <OrderCard
                                :item="item"
                                @click="onToDetails(item, 'sale')"
                                is-sales
                                is-new
                                is-new-sale
                                :is-custom-status-name="isEqual(item.status, 'FINISHED')"
                                custom-status-name="待付款"
                                hide-order-address
                              >
                                <template #operate>
                                  <view class="ko-address__operate">
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
                          </view>
                        </KoList>
                      </view>
                    </view>
                  </view>
                </KoList>
              </block>

              <!-- 全局搜索 -->
              <block v-else>
                <KoList
                  :data="sList"
                  :no-more="sMore"
                  :loading="sLoading"
                  :no-data="!sMore && !sLoading && !sList.length"
                  @lower="onSNext"
                  @lower-next="onSNext"
                >
                  <view style="padding-top: 6px;">
                    <view class="ko-address__list--item" v-for="item of sList" :key="item.id">
                      <OrderCard
                        :item="item"
                        @click="onToDetails(item, 'sale')"
                        is-sales
                        is-new
                        is-new-sale
                        :is-custom-status-name="isEqual(item.status, 'FINISHED')"
                        custom-status-name="待付款"
                      >
                        <template #operate>
                          <view class="ko-address__operate">
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
                  </view>
                </KoList>
              </block>

            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 打印组件 -->
    <PrintList ref="PLRef" @submit="startPrint" />
    <!-- 更多操作 -->
    <UvActionSheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <div class="ko-order-list">
      <TopMenus :path="PageEnums.saleOrderList" />
      <div class="ko-order-list__wrap">
        <div class="ko-client">
          <view class="ko-client__search">
            <uni-search-bar
              v-model="cQuery.name"
              placeholder="请输入"
              @confirm="getList(true)"
              @cancel="onClientCancel"
              clear-button="none"
              style="flex: 1; overflow: hidden"
            />

            <button
              class="ko-basic-button__card ko-client__switch"
              @click="onSwitchStyle"
            >
              <uni-icons color="#fff" :type="!sSale ? 'list' : 'tune-filled'"></uni-icons>
            </button>
          </view>

          <!-- 索引列表 -->
          <view class="ko-client__index">
            <view
              class="ko-client__index--item"
              v-for="item of IndexList"
              :key="item"
              :class="{'is-i-active': isEqual(item, cQuery.nameIndex)}"
              @click.stop="onNameIndexSearch(item)"
            >
              {{ item }}
            </view>
          </view>

          <KoList
            class="ko-client__table"
            :loading="cLoading"
            :no-more="cMore"
            :no-data="!cMore && !cLoading && !cList.length"
            :data="cList"
            @lower="onLowerClient"
            @load-next="onLowerClient"
          >
            <div
              v-for="root of cList"
              :key="root.value"
              :class="{'is-root-active': isEqual(root.value, rootId)}"
              class="ko-client__name"
              @click.stop="onRootChange(root)"
            >
              <UvAvatar random-bg-color :text="root.label" :src="getImageUrl(root.logo)" size="32px" />
              <span style="padding-left: 8px">{{ root.label }}</span>
            </div>
          </KoList>
        </div>
        <div class="ko-address">
          <KoList
            class="ko-address__table"
            :loading="cRoot.aLoading"
            :no-data="!!((cRoot.aList || []).length && !cRoot.aLoading && !cRoot.aMore)"
            :no-more="cRoot.aMore"
            no-more-text="该客户没有更多地址了"
          >
            <div>
              <div
                v-for="dz of cRoot.aList"
                :key="dz.id"
                class="ko-address__name"
                @click.stop="onAChange(dz, cRoot)"
                :class="{'is-a-active': isEqual(dz.id, aId)}"
              >
                <uni-icons type="location-filled" :size="18" color="#8f939c" />
                <text style="padding-left: 4px">{{ dz.address }}</text>
              </div>
            </div>
          </KoList>
        </div>
        <div class="ko-order-table" :class="{'no-address': !aId}">
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
                  <UniEasyinput v-model="oQuery.orderCode" placeholder="请输入编号" />
                </UniCol>
                <UniCol :span="24">
                  <UniEasyinput v-model="oQuery['user.nickName']" placeholder="请输入下单用户名称" />
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
                  <view
                    style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
                    <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onResetList">
                      重置
                    </button>
                    <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getOrderList(true)">
                      搜索
                    </button>
                  </view>
                </UniCol>
              </UniRow>
            </view>
          </HistoryBar>

          <KoTable
            :loading="gOrder.loading"
            :no-more="gOrder.cMore || gOrder.loading"
            :columns="columns"
            :data="gOrder.list"
            empty-text="暂无数据"
            stripe
            @row-click="onRowClick"
            @next-load="RequestNextPage"
            class="ko-order-table__list"
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
                  v-if="['FINISHED'].includes(item.status) && isPerm('SALE_QUICK_OUT') && isEqual(item.status, 'FINISHED')"
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
        </div>
      </div>
    </div>
    <!-- #endif -->

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable"
      @click="onTrigger"
    />
    <!-- 提示库存不足 -->
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
    <!-- 处理支付 -->
    <Pay
      ref="TPRef"
      @close="updateList(true); noRefresh = false"
    />
    <!-- 生产二维码 -->
    <GenerateCode ref="GCRef" />
  </view>
</template>

<style scoped lang="scss">
.ko-wrapper {
  height: 100vh;
  width: 100vw;
}

// #ifdef MP
.ko-order-list {
  padding-top: 8px;
  width: 100vw;
  height: 100vh;
  background: #F3F4F6;
}

// 容器数据
.ko-sale {
  &__wrap {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  &__left {
    width: 36%;
    background: #fff;
    height: 100%;
    border-radius: 6px;
    overflow: hidden;
  }

  &__right {
    overflow: hidden;
    flex: 1;
    height: 100%;
    overflow-y: auto;
    margin-left: 8px;
    border-radius: 6px;
    background: #fff;
  }
}

// 客户列表
.ko-client {
  height: calc(100vh - 20px);

  &__name {
    display: flex;
    align-items: center;
    border: 1px solid #EFF1F3;
    border-radius: 6px;
    padding: 6px;
    margin-bottom: 8px;
    color: #170145;
    font-size: 14px;

    &.is-root-active {
      background: rgba(128, 174, 250, 0.1);
      border-color: #80AEFA;
    }

    &--wrap {
      padding-left: 8px;
      overflow: hidden;
    }
  }

  &__money {
    font-size: 12px;
    color: #8CA1B8;
  }

  &__wrap {
    padding: 0 8px;
  }

  &__search {
    //display: flex;
    //align-items: center;
    padding-right: 4px;
  }

  &__switch {
    width: 30px;
    height: 30px;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    margin: 2px;
  }
}

// 地址列表
.ko-address {
  height: calc(100vh - 20px);

  &__wrap {
    padding: 0 8px;
  }

  &__item {
    border: 1px solid #E9EDF3;
    border-radius: 6px;
    margin-bottom: 8px;

    &--down {
      transition: transform .3s;
    }

    &.is-a-active {
      .ko-address__item--down {
        transform: rotate(-180deg);
      }

      .ko-address__name {
        border-radius: 6px 6px 0 0;
      }

      .ko-address__list {
        padding-top: 2px;
        height: calc(100vh - 80px);
      }
    }
  }

  &__name {
    font-size: 14px;
    padding: 8px 6px 8px 8px;
    background: #EFF6FF;
    color: #4B5563;
    border-radius: 6px;
    transition: border-radius .3s;

    &--info {
      flex: 1;
      overflow: hidden;

      .ko-text-wrap {
        &__btn {
          margin-left: 6px;
          font-size: 12px;
          line-height: 1;
          padding: 3px 8px;
          border: 1px solid #2979ff;
          border-radius: 12px;
          background: #d4e4ff;
          color: #2979ff;
        }
      }
    }

    &--total {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin: -2px -2px;
      padding-right: 4px;
    }

    &--num {
      padding: 2px 8px;
      border-radius: 99px;
      background: #DBE9FE;
      color: #1D40AF;
      white-space: nowrap;
      font-size: 10px;
      margin: 2px;
    }

    &--item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__list {
    transition: height .3s, padding .3s;
    //height: calc(100vh - 20px);
    height: 0;

    &--item {
      margin-bottom: 8px;
    }
  }

  &__search {
    display: flex;
    align-items: center;
    padding-right: 8px;
  }

  &__operate {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;
    margin: -2px;

    .ko-basic-button__card {
      margin: 2px;
      padding: 6px 8px;
    }
  }
}

// 订单列表搜素样式
.ko-search {
  height: 0;
  padding: 0 8px;
  overflow: hidden;
  transition: padding .3s, height .3s;

  &.is-o-active {
    height: 200px;
    padding-bottom: 8px;
  }
}

/*.ko-order-list {
  padding-top: 10px;
  width: 100vw;
  height: 100vh;

  &__wrap {
    padding: 10px 16px 60px 0;
  }

  &__loading {
    height: 200px;
  }

  &__content {
    width: 100%;
  }

  &__search {
    padding-right: 10px;
  }
}

// 客户
.ko-client {
  border-bottom: 1rpx solid #e9e9eb;

  &__switch {
    width: 30px;
    height: 30px;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }

  &__name {
    padding: 8px 16px;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: color .3s, background-color .3s;
    border-radius: 6px;
  }

  &__icon {
    transition: all .3s;
  }

  .ko-address {
    height: 0;
    overflow: hidden;
  }

  // 选中的客户
  &.is-root-active {
    .ko-client {
      &__name {
        color: #2979FF;
        background: rgba(41, 121, 255, 0.1);
      }

      &__icon {
        transform: rotate(-180deg);
      }
    }

    .ko-address {
      min-height: 100px;
      height: auto;
      overflow-y: auto;
    }
  }
}

// 地址列表
.ko-address {
  min-height: 0;

  &__row {

    &.is-a-active {
      .ko-order-table {
        padding-top: 10px;
        height: 100vh;
      }

      .ko-address {
        &__icon {
          transform: rotate(-180deg);
        }

        &__name {
          box-shadow: 0 1px 8px 1px rgba($color: #a5a5a5, $alpha: 0.2)
        }
      }
    }
  }

  &__name {
    padding: 8px 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #8f939c;
  }


  &__icon {
    transition: all .3s;
  }
}

// 订单列表
.ko-order-table {
  height: 0;
  overflow: hidden;
  transition: height .3s;
}

// 订单容器
.ko-order-wrap {
  padding: 10px 0;
}

// 右侧索引列表
.ko-index {
  position: fixed;
  top: 14%;
  right: 8px;
  transition: all .3s;

  &.hide {
    right: -30px;
  }

  &__item {
    font-size: 14px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .3s;

    &.is-i-active {
      background: #007AFF;
      color: #fff;
    }
  }
}*/

// #endif

// #ifdef H5
.ko-wrapper {
  height: calc(100vh - 45px);
  width: 100vw;
}

.ko-order-list {
  padding-top: 10px;
  height: calc(100vh - 54px);
  display: flex;
  flex-direction: column;

  &__wrap {
    flex: 1;
    overflow: hidden;
    display: flex;
  }
}

// 客户列表
.ko-client {
  height: 100%;
  width: 250px;
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9e9eb;

  &__search {
    display: flex;
    align-items: center;
  }

  &__switch {
    width: 30px;
    height: 30px;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }

  &__name {
    padding: 8px 16px;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    transition: color .3s, background-color .3s;
    border-radius: 6px;
    border-bottom: 1rpx solid #e9e9eb;

    // 选中的客户
    &.is-root-active {
      color: #2979FF;
      background: rgba(41, 121, 255, 0.1);
    }
  }

  &__table {
    flex: 1;
    overflow: hidden;
    padding-right: 16px;
  }

  &__index {
    position: absolute;
    top: 20%;
    right: 4px;
    z-index: 99;

    &--item {
      font-size: 14px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      transition: all .3s;

      &.is-i-active {
        background: #007AFF;
        color: #fff;
      }
    }
  }
}

// 地址
.ko-address {
  width: 180px;
  height: 100%;
  border-right: 1px solid #e9e9eb;

  &__table {
    height: 100%;
  }

  &__name {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    transition: color .3s, background-color .3s;
    border-bottom: 1rpx solid #e9e9eb;

    &.is-a-active {
      color: #2979FF;

      .uni-icons.uniui-location-filled {
        color: #2979FF !important;
      }
    }
  }
}

.ko-order-table {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  padding-top: 5px;

  ::v-deep .ko-history {
    width: auto;
  }

  &__list {
    flex: 1;
    overflow: hidden;
  }

  &.no-address {
    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 999;
      background: rgba(255, 255, 255, .4);
    }

  }
}

// #endif
</style>
