<script>
import { _deepCopy, _get, _isEmpty, _isEqual, _keys, _pick } from "@/utils";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import KoList from "@/components/List/List.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import TopMenus from "./components/TopMenus.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import {
  financeCustomerAddressListApi,
  financeSupplierAddressListApi,
  getPayableCheckApi,
  getPayableDetailApi,
} from "@/api/erp/finance";
import Pay from "@/components/Pay/Pay.vue";
import apMixins from "@/finance/ap-mixins";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import { getCustomerListApi } from "@/api/erp/sale";
import { getSupplierListApi } from "@/api/erp/purchase";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";

export default {
  name: "ApOrder",
  components: {
    UniSearchBar,
    UvActionSheet,
    Pay, HistoryBar, UniEasyinput, OrderCard, UniCol, TopMenus, UvAvatar, KoList, PickerCalendars, UniRow,
  },
  mixins: [apMixins],
  data() {
    const _this = this;
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

      PAGE_MENU: [
        {
          label: "供应商",
          func: 1,
          perm: "SUPPLIER_LIST",
        },
        {
          label: "客户",
          func: 0,
          perm: "CUSTOMER_LIST",
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
    };
  },
  onLoad() {
    // #ifdef H5
    this.getList(true);
    // #endif
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
    // 获取供应商列表
    getList(reset) {
      if (reset) {
        this.cList = [];
        this.cQuery.pageNum = 0;
        this.aId = null;
        this.rootId = null;
        this.aList = [];
        this.aQuery = _deepCopy(this.$options.data().aQuery);
        this.onSReset();
      }
      this.cLoading = true;
      const Func = [getCustomerListApi, getSupplierListApi][this.GET_PAGE_MENU_FUNC];

      Func(this.cQuery)
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

    // 取消供应商搜索
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
      this.aId = null;
      this.getAddressList(true);

      this.toRootItem();
    },

    // 定位到供应商
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
      // #ifdef MP
      if (this.isSearch) {
        this.getSList();
        return false;
      }
      // #endif

      // #ifdef H5
      if (!this.rootId) return false;
      // #endif

      if (reset) {
        this.aList = [];
        this.aQuery.pageNum = 0;
      }

      this.aLoading = true;

      const Func = [financeCustomerAddressListApi, financeSupplierAddressListApi][this.GET_PAGE_MENU_FUNC];
      // payableOrReceivable: true 应付；false: 应收
      Func({id: this.rootId, ...this.aQuery, payableOrReceivable: true, queryNoAddress: true})
        .then(res => {
          const data = res.data;
          this.aList = this.onMergeArrays(this.aList, data, "id");
          this.aMore = _isEmpty(data) || data.length < this.aQuery.pageSize;

          // #ifdef MP
          if (data.length === 1) this.aId = this.aList?.[0]?.id || null;
          // #endif

          // #ifdef H5
          this.aId = this.aList?.[0]?.id || null;
          // #endif

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
        // #ifdef MP
        this.aId = null;
        // #endif
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

      const dz = this.aList.find(v => _isEqual(v.id, this.aId)) || {};
      getPayableCheckApi({
        ...this.oQuery,
        supplierId: this.rootId,
        queryNoAddress: _isEqual(dz.id, "1"),
        addressId: (_isEqual(dz.id, "1") ? "" : dz.id) || "",
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

    // 获取下一页的供应商
    onLowerSupplier() {
      if (this.cMore || this.cLoading) return false;
      this.cQuery.pageNum += 1;
      this.getList();
    },

    // 重置搜索列表
    onResetList() {
      this.cQuery = _deepCopy(this.$options.data().cQuery);

      // #ifdef H5
      this.oQuery = _deepCopy(this.$options.data().oQuery);
      // #endif

      // #ifdef H5 | MP
      this.$refs.SearchRef && this.$refs?.SearchRef?.onShowSearch?.(false);
      this.$refs.PCRef && this.$refs.PCRef?.clearable?.();
      // #endif

      this.getList(true);
    },


    // 确定开始结束时间了
    onCalendarConfirm(event) {
      // #ifdef MP
      if (event) {
        const r = event.range || {};
        this.sQuery.startTime = r.before ? r.before + " 00:00:00" : "";
        this.sQuery.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.sQuery.startTime = "";
        this.sQuery.endTime = "";
      }
      // #endif
      // #ifdef H5
      if (event) {
        const r = event.range || {};
        this.oQuery.startTime = r.before ? r.before + " 00:00:00" : "";
        this.oQuery.endTime = r.after ? r.after + " 23:59:59" : "";
      } else {
        this.oQuery.startTime = "";
        this.oQuery.endTime = "";
      }
      // #endif
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
      getPayableCheckApi({
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

    // 处理票据
    onSuccess() {
      const node = this.node;
      const index = this.nodeIndex;

      getPayableDetailApi({id: node.id})
        .then(res => {
          console.log(res);
          const item = _pick(res.data, _keys(node));

          this[this.isSearch ? "sList" : "oList"][index] && this.$set(this[this.isSearch ? "sList" : "oList"], index, item);

          this?.updateAddressNode?.(item);
        });
    },

    // 删除数据
    onRemoveList(index) {
      if (this.isSearch) {
        this.oList.splice(index, 1);
        return false;
      }
      this.oList.splice(index, 1);
    },

    // 更新地址列表
    updateAddressNode(node) {
      if (_isEmpty(node)) return false;
      if (_isEqual(this.rootId, node.supplierId)) {
        const orderAddress = node.orderAddress;

        const Func = [financeCustomerAddressListApi, financeSupplierAddressListApi][this.GET_PAGE_MENU_FUNC];
        Func({
          id: this.rootId,
          address: orderAddress || "",
          queryNoAddress: !orderAddress,
          payableOrReceivable: true,
        })
          .then(res => {
            console.log(res, node);
            const data = res.data;
            this.aList = this.onMergeArrays(this.aList, data, "id");

            if (this.aId && !this.oList.length) {
              this.getOrderList(true);
            }
          });
      }

      if (this.rootId) {
        const Func = [getCustomerListApi, getSupplierListApi][this.GET_PAGE_MENU_FUNC];

        Func({id: this.rootId})
          .then(res => {
            const list = (res.data || []).map(this.getCNode);
            this.cList = this.onMergeArrays(this.cList, list, "id");
            // console.log(this.cList);
          });
      }
    },
  },
};
</script>

<template>
  <view class="ko-or-order">
    <!-- #ifdef MP -->
    <scroll-view scroll-y class="ko-list">
      <Notice />

      <view style="background: #fff;">
        <TopMenus :path="PageEnums.financeApPay" />

        <view style="padding: 0 16px;">
          <HistoryBar
            v-model="PAGE_MENU_INDEX"
            :values="GET_PAGE_MENU"
            label-key="label"
            @change="onResetList(false)"
            ref="SearchRef"
          >
            <template #extra>
              <button
                class="ko-basic-button__card ko-supplier__switch"
                @click="onSwitchStyle"
              >
                <uni-icons color="#fff" :type="!sApStyle ? 'list' : 'tune-filled'" />
              </button>
            </template>
          </HistoryBar>
        </view>
      </view>

      <view class="ko-list__wrap">
        <view class="ko-list__left">
          <view class="ko-supplier__search">
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
          <view class="ko-supplier">
            <KoList
              :loading="cLoading"
              :no-more="cMore"
              :no-data="!cMore && !cLoading && !cList.length"
              :data="cList"
              @lower="onLowerSupplier"
              @load-next="onLowerSupplier"
              :scroll-into-view="ViewID"
            >
              <view class="ko-supplier__wrap">
                <view
                  v-for="root of cList"
                  :key="root.value"
                  :class="{'is-root-active': isEqual(root.value, rootId)}"
                  class="ko-supplier__name"
                  @click.stop="onRootChange(root)"
                  :id="`root-${root.value}`"
                >
                  <UvAvatar random-bg-color :text="root.label" :src="getImageUrl(root.logo)" size="32px" />
                  <view class="ko-supplier__name--wrap">
                    <text class="ko-supplier__name--text ko-text-wrap">{{ root.label }}</text>
                    <view class="ko-supplier__money">
                      <!--<block v-if="root.amount < 0">欠</block>-->
                      ¥{{ toYuan(Math.abs(root.amount || 0)) }}
                    </view>
                  </view>
                </view>
              </view>
            </KoList>
          </view>
        </view>
        <view class="ko-list__right">
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
              class="ko-basic-button__card ko-supplier__switch"
              @click="onOpenSearch"
            >
              <uni-icons color="#fff" type="search" />
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
                no-more-text="没有更多地址了"
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
                      class="ko-address__name ko-address__name--item"
                      @click.stop="onAChange(dz)"
                    >
                      <view class="ko-address__name--info">
                        <view class="ko-text-wrap" style="margin-bottom: 4px;" v-if="dz.address">
                          {{ dz.address }}
                        </view>

                        <view class="ko-address__name--total">
                          <view class="ko-address__name--num CREATED">
                            待付款: {{ dz.pendingQuantity }}
                          </view>
                          <view class="ko-address__name--num WAIT_PAY">
                            待确认: {{ dz.pendingPaymentQuantity }}
                          </view>
                          <view class="ko-address__name--num">
                            ¥{{ toYuan(dz.amount) }}
                          </view>
                        </view>
                      </view>

                      <view class="ko-address__item--down">
                        <uni-icons type="down" :size="18" color="#8f939c" />
                      </view>
                    </view>

                    <view class="ko-address__list">
                      <KoList
                        :data="oList"
                        :no-more="oMore"
                        :loading="oLoading"
                        :no-data="!oMore && !oLoading && !oList.length"
                        @lower="onNextOrderList"
                        v-if="isEqual(dz.id, aId)"
                      >
                        <view style="padding-top: 6px;">
                          <view class="ko-address__list--item" v-for="(item, index) of oList" :key="item.id">
                            <OrderCard
                              :item="item"
                              @click="onJumpDetails(item, 'payable')"
                              is-new
                              is-finance
                              is-new-sale
                              hide-order-address
                              show-order-type
                            >
                              <template #operate>
                                <view class="ko-address__operate">
                                  <button
                                    v-if="['PAID'].includes(item.status) && isPerm('FINANCE_PAYABLE_FINISH')"
                                    class="ko-basic-button__card"
                                    @click.stop="onConfirm(item, index)"
                                  >
                                    确认清帐
                                  </button>
                                  <button
                                    class="ko-basic-button__card"
                                    @click.stop="onAddedTicket(item, index)"
                                    v-if="['WAIT_PAY', 'CREATED'].includes(item.status) && (isPerm('FINANCE_ADD_RETURNED_ORDER') || isPerm('FINANCE_RETURNED_ORDER'))"
                                  >
                                    添加单据
                                  </button>

                                  <button
                                    v-if="['CREATED'].includes(item.status)"
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
                  <view class="ko-address__list--item" v-for="(item, index) of sList" :key="item.id">
                    <OrderCard
                      :item="item"
                      @click="onJumpDetails(item, 'payable')"
                      is-new
                      is-finance
                      is-new-sale
                      hide-order-address
                      show-order-type
                    >
                      <template #operate>
                        <view class="ko-address__operate">
                          <button
                            v-if="['PAID'].includes(item.status) && isPerm('FINANCE_PAYABLE_FINISH')"
                            class="ko-basic-button__card"
                            @click.stop="onConfirm(item, index)"
                          >
                            确认清帐
                          </button>
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onAddedTicket(item, index)"
                            v-if="['WAIT_PAY', 'CREATED'].includes(item.status) && (isPerm('FINANCE_ADD_RETURNED_ORDER') || isPerm('FINANCE_RETURNED_ORDER'))"
                          >
                            添加单据
                          </button>
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onCancel(item, index)"
                            v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_PAYABLE_CANCEL') && false"
                          >
                            取消订单
                          </button>

                          <button
                            v-if="['CREATED'].includes(item.status)"
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
    </scroll-view>

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
    <div class="ko-list">
      <TopMenus :path="PageEnums.financeApPay" />

      <view style="padding: 0 16px;">
        <HistoryBar
          v-model="PAGE_MENU_INDEX"
          :values="GET_PAGE_MENU"
          label-key="label"
          @change="onResetList(false)"
          ref="SearchRef"
        >
          <template #extra>
            <button
              class="ko-basic-button__card ko-supplier__switch"
              @click="onSwitchStyle"
            >
              <uni-icons color="#fff" :type="!sApStyle ? 'list' : 'tune-filled'" />
            </button>
          </template>
        </HistoryBar>
      </view>

      <div class="ko-list__wrap">
        <div class="ko-supplier">
          <div class="ko-supplier__search">
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
          </div>

          <!-- 索引列表 -->
          <view class="ko-supplier__index" v-if="false">
            <view
              class="ko-supplier__index--item"
              v-for="item of IndexList"
              :key="item"
              :class="{'is-i-active': isEqual(item, cQuery.nameIndex)}"
              @click.stop="onNameIndexSearch(item)"
            >
              {{ item }}
            </view>
          </view>

          <KoList
            class="ko-supplier__table"
            :loading="cLoading"
            :no-more="cMore"
            :no-data="!cMore && !cLoading && !cList.length"
            :data="cList"
            @lower="onLowerSupplier"
            @load-next="onLowerSupplier"
          >
            <div class="ko-supplier__wrap">
              <div
                v-for="root of cList"
                :key="root.value"
                :class="{'is-root-active': isEqual(root.value, rootId)}"
                class="ko-supplier__name"
                @click.stop="onRootChange(root)"
                :id="`root-${root.value}`"
              >
                <UvAvatar random-bg-color :text="root.label" :src="getImageUrl(root.logo)" :size="42" />
                <div class="ko-supplier__name--wrap">
                  <span class="ko-supplier__name--text ko-text-wrap">{{ root.label }}</span>
                  <div class="ko-supplier__money">
                    <!--<block v-if="root.amount < 0">欠</block>-->
                    ¥{{ toYuan(Math.abs(root.amount || 0)) }}
                  </div>
                </div>
              </div>
            </div>
          </KoList>
        </div>
        <div class="ko-address">
          <div class="ko-address__search">
            <uni-search-bar
              v-model="aQuery.address"
              placeholder="请输入地址"
              @confirm="getAddressList(true)"
              @cancel="onAddressCancel"
              clear-button="none"
              style="flex: 1;"
              bg-color="transparent"
              border
            />
          </div>

          <KoList
            class="ko-address__table"
            :loading="aLoading"
            :no-more="aMore"
            :no-data="!aMore && !aLoading && !aList.length"
            :data="aList"
            @lower="onLowerAddress"
            @load-next="onLowerAddress"
            no-more-text="该客户没有更多地址了"
            :scroll-into-view="AViewId"
          >
            <div style="padding: 8px;">
              <div
                v-for="dz of aList"
                :key="dz.id"
                class="ko-address__item"
              >
                <view
                  class="ko-address__name"
                  @click.stop="onAChange(dz)"
                  :class="{'is-a-active': isEqual(dz.id, aId)}"
                >
                  <view class="ko-address__name--info ko-address__name--item" style="overflow: hidden;">
                    <view class="ko-text-wrap" style="flex: 1;">{{ dz.address }}</view>
                  </view>
                  <view class="ko-address__name--item" style="margin-top: 8px;">
                    <view class="ko-address__name--total">
                      <view class="ko-address__name--num CREATED">
                        待付款: {{ dz.pendingQuantity }}
                      </view>
                      <view class="ko-address__name--num WAIT_PAY">
                        待确认: {{ dz.pendingPaymentQuantity }}
                      </view>
                      <view class="ko-address__name--num">
                        ¥{{ toYuan(dz.amount) }}
                      </view>
                    </view>
                  </view>
                </view>
              </div>
            </div>
          </KoList>
        </div>
        <div class="ko-order-table" :class="{'no-address': !aId}">
          <div class="ko-order-table__search">
            <div class="ko-order-table__search--item">
              <UniEasyinput v-model="oQuery.orderCode" placeholder="请输入编号" />
            </div>
            <div class="ko-order-table__search--item">
              <UniEasyinput v-model="oQuery['user.nickName']" placeholder="请输入下单用户名称" />
            </div>
            <div class="ko-order-table__search--item" style="width: 260px;">
              <PickerCalendars
                placeholder="请选择开始结束时间"
                mode="range"
                @confirm="onCalendarConfirm"
                ref="PCRef"
              />
            </div>

            <div style="display: flex; align-items: center;">
              <button class="ko-basic-button__card" @click.stop="onResetList">
                重置
              </button>
              <button class="ko-basic-button__card" @click.stop="getOrderList(true)">
                搜索
              </button>
            </div>
          </div>

          <KoTable
            :loading="oLoading"
            :no-more="oMore || oLoading"
            :columns="columns"
            :data="oList"
            empty-text="暂无数据"
            stripe
            @row-click="onJumpDetails($event, 'payable')"
            @next-load="onNextOrderList"
            class="ko-order-table__list"
          >

            <template #operate="{item, index}">
              <view style="display: flex; align-items: center; justify-content: center;">
                <button
                  v-if="['PAID'].includes(item.status) && isPerm('FINANCE_PAYABLE_FINISH')"
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item, index)"
                >
                  确认清帐
                </button>
                <button
                  class="ko-basic-button__card"
                  @click.stop="onAddedTicket(item, index)"
                  v-if="['CREATED', 'WAIT_PAY'].includes(item.status) && (isPerm('FINANCE_ADD_RETURNED_ORDER') || isPerm('FINANCE_RETURNED_ORDER'))"
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
        </div>
      </div>
    </div>
    <!-- #endif -->

    <Pay ref="TPRef" @close="onSuccess" />
  </view>
</template>

<style scoped lang="scss">
.ko-or-order {
  height: 100vh;
  width: 100vw;
}

.ko-list {
  padding-top: 8px;
  width: 100vw;
  height: 100vh;
  background: #F3F4F6;

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


// #ifdef H5
.ko-or-order {
  height: calc(100vh - 54px);
  width: 100vw;
}

.ko-list {
  padding-top: 10px;
  height: calc(100vh - 54px);
  background: #fff;
  display: flex;
  flex-direction: column;

  &__wrap {
    flex: 1;
    overflow: hidden;
    display: flex;
  }
}

// 供应商列表
.ko-supplier {
  height: 100%;
  width: 280px;
  position: relative;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9e9eb;

  &__table {
    width: 100%;
  }
}

// 地址
.ko-address {
  width: 260px;
  height: 100%;
  border-right: 1px solid #e9e9eb;
  overflow: hidden;

  &__table {
    height: 100%;
    width: 100%;
  }
}

.ko-order-table {
  &__list {
    width: 100%;
    flex: 1;
    overflow: hidden;
  }
}

// #endif
</style>
