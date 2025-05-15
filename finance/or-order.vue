<script>
import { _deepCopy, _isEmpty, _isEqual, _keys, _pick } from "@/utils";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import KoList from "@/components/List/List.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import TopMenus from "./components/TopMenus.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import orMixins from "./or-mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import {
  financeCustomerAddressListApi,
  financeSupplierAddressListApi,
  getReceivableCheckApi,
  getReceivableDetailApi,
  getUnpaidCustomerApi,
  getUnpaidSupplierApi,
} from "@/api/erp/finance";
import Pay from "./components/Pay/Pay.vue";
import PrintList from "@/purchase/components/PrintList.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";

export default {
  name: "OrOrder",
  components: {
    UvActionSheet,
    PrintList,
    Pay, HistoryBar, UniEasyinput, OrderCard, UniCol, TopMenus, UvAvatar, KoList, PickerCalendars, UniRow,
  },
  mixins: [orMixins],
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

      PAGE_MENU: [
        {
          label: "客户",
          func: 0,
          perm: "CUSTOMER_LIST",
        },
        {
          label: "供应商",
          func: 1,
          perm: "SUPPLIER_LIST",
        },
      ],

      value: 0,
    };
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
      const Func = [getUnpaidCustomerApi, getUnpaidSupplierApi][this.GET_PAGE_MENU_FUNC];

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
      if (this.isSearch) {
        this.getSList();
        return false;
      }

      if (reset) {
        this.aList = [];
        this.aQuery.pageNum = 0;
      }

      this.aLoading = true;
      const Func = [financeCustomerAddressListApi, financeSupplierAddressListApi][this.GET_PAGE_MENU_FUNC];

      // payableOrReceivable: true 应付；false: 应收
      Func({id: this.rootId, ...this.aQuery, payableOrReceivable: false, queryNoAddress: true})
        .then(res => {
          const data = res.data;
          this.aList = this.onMergeArrays(this.aList, data, "id");
          this.aMore = _isEmpty(data) || data.length < this.aQuery.pageSize;

          if (data.length === 1) this.aId = this.aList?.[0]?.id || null;

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
      getReceivableCheckApi({
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

    // 获取下一页的供应商
    onLowerSupplier() {
      if (this.cMore || this.cLoading) return false;
      this.cQuery.pageNum += 1;
      this.getList();
    },

    // 重置搜索列表
    onResetList() {
      this.cQuery = _deepCopy(this.$options.data().cQuery);

      // #ifdef H5 | MP
      this.$refs.SearchRef && this.$refs?.SearchRef?.onShowSearch?.(false);
      this.$refs.PCRef && this.$refs.PCRef?.clearable?.();
      // #endif

      this.getList(true);
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
      getReceivableCheckApi({
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
      getReceivableDetailApi({id: node.id})
        .then(res => {
          console.log(res);
          this.$set(this.sList, index, _pick(res.data, _keys(node)));
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
  },
};
</script>

<template>
  <view class="ko-or-order">
    <!-- #ifdef MP -->
    <scroll-view scroll-y class="ko-list">
      <Notice />
      <view style="background: #fff;">
        <TopMenus :path="PageEnums.financeOrOrder" />

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
                <uni-icons color="#fff" :type="!sOrStyle ? 'list' : 'tune-filled'" />
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
                        <view class="ko-text-wrap">{{ dz.address }}</view>

                        <view class="ko-address__name--total" style="margin-top: 4px;">
                          <view class="ko-address__name--num">
                            待清帐: {{ dz.pendingQuantity }}
                          </view>
                          <view class="ko-address__name--num">
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
                          <view class="ko-address__list--item" v-for="item of oList" :key="item.id">
                            <OrderCard
                              :item="item"
                              @click="onJumpDetails(item, 'receivable')"
                              is-new
                              is-finance
                              is-new-sale
                              hide-order-address
                              show-order-type
                            >
                              <template #operate>
                                <view class="ko-address__operate">
                                  <button
                                    v-if="['CREATED'].includes(item.status) && item.confirmable && isPerm('FINANCE_RECEIVABLE_FINISH')"
                                    class="ko-basic-button__card"
                                    @click.stop="onConfirm(item, index)"
                                  >
                                    确认清帐
                                  </button>
                                  <button
                                    class="ko-basic-button__card"
                                    @click.stop="onAddedTicket(item, index)"
                                    v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_ADD_PAID_ORDER') || isPerm('FINANCE_PAID_ORDER')"
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
                  <view class="ko-address__list--item" v-for="item of sList" :key="item.id">
                    <OrderCard
                      :item="item"
                      @click="onJumpDetails(item, 'receivable')"
                      is-new
                      is-finance
                      is-new-sale
                      hide-order-address
                      show-order-type
                    >
                      <template #operate>
                        <view class="ko-address__operate">
                          <button
                            v-if="['CREATED'].includes(item.status) && item.confirmable && isPerm('FINANCE_RECEIVABLE_FINISH')"
                            class="ko-basic-button__card"
                            @click.stop="onConfirm(item, index)"
                          >
                            确认清帐
                          </button>
                          <button
                            class="ko-basic-button__card"
                            @click.stop="onAddedTicket(item, index)"
                            v-if="['CREATED'].includes(item.status) && isPerm('FINANCE_ADD_PAID_ORDER') || isPerm('FINANCE_PAID_ORDER')"
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

    <Pay ref="TPRef" @close="onSuccess" />
  </view>
</template>

<style scoped lang="scss">
.ko-or-order {
  height: 100vh;
  width: 100vw;
}

// #ifdef MP
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

// 供应商列表
.ko-supplier {
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

// #endif
</style>
