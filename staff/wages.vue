<script>
import { getSalaryListApi } from "@/api/erp/produce";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import PickerSheet from "./components/PickerSheet.vue";
import CraftCard from "./components/CraftCard.vue";
import WageCard from "./components/WageCard.vue";
import KoMovable from "@/components/Movable/index.vue";
import SubsidyPopup from "./components/SubsidyPopup.vue";
import WagePopup from "./components/WagePopup.vue";
import SettlePopup from "./components/SettlePopup.vue";
import PickerCalendars from "@/staff/components/uv-calendars/PickerCalendars.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";

export default {
  name: "Wages",
  components: {
    PickerCalendars,
    KoMovable,
    CraftCard,
    PickerSheet,
    KoList,
    WageCard,

    SubsidyPopup,
    WagePopup,
    SettlePopup,

    UniRow,
    UniCol,

    UniIcons,
  },
  data() {
    return {
      queryList: {
        pageSize: 20,
        pageNum: 0,
        "staffId": "",
      },

      list: [],
      loading: false,
      noMore: false,

      // 不需要任何的操作
      isNoOperate: false,

      // 添加
      MOVABLE_LIST: [
        {
          text: "补贴",
          iconfont: "icon-caiwubaobiao1",
          perm: "STAFF_ADD_SUBSIDY",
          func: "onSubsidy",
        },
        {
          text: "工资",
          iconfont: "icon-qitashouru",
          perm: "COST_ADD",
          func: "onWage",
        },
      ],

      option: {},
    };
  },
  mixins: [mixins],
  onLoad(option) {
    this.option = option;
    this.queryList["staffId"] = option.id;
    this.isNoOperate = _isEqual(option["no-operate"], "true");

    this.getList(true);
  },
  // #ifdef MP
  onReachBottom() {
    this.onRequestNextPage();
  },
  // #endif
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      getSalaryListApi(this.queryList)
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

    // 添加补贴
    onEditor(item) {
      const isEdit = !_isEmpty(item);

      // 新增修改补贴
      if (_isEqual(item.type, "SubsidyAndBonus"))
        this.$refs.SPRef.open(
          isEdit,
          {
            ...(item || {}),
            amount: this.toYuan(Math.abs((item || {}).amount)),
            staffId: this.queryList.staffId,
          },
        );

      if (_isEqual(item.type, "ClearAnAccount"))
        this.$refs.WPRef.open(isEdit, {
          ...(item || {}),
          amount: this.toYuan(Math.abs((item || {}).amount)),
          staffId: this.queryList.staffId,
        });

    },

    // 删除补贴金额
    onRemove(item, index) {
      // 删除补贴
      if (_isEqual(item.type, "SubsidyAndBonus")) this.$refs.SPRef.onRemove(item, index);
      // 删除工资
      if (_isEqual(item.type, "ClearAnAccount")) this.$refs.WPRef.onRemove(item, index);
      // 删除结算
      if (_isEqual(item.type, "ProductionSettlement")) this.$refs.SettlePRef.onRemove(item, index);
    },

    // 添加按钮
    onTrigger({item}) {
      // 补贴
      if (_isEqual(item.func, "onSubsidy"))
        this.$refs.SPRef.open(false, {
          amount: 0,
          staffId: this.queryList.staffId,
        });

      // 工资
      if (_isEqual(item.func, "onWage"))
        this.$refs.WPRef.open(false, {staffId: this.queryList.staffId});
    },

    // 添加结算
    onAddSettle(child) {
      this.$refs.SettlePRef.open({...(child?.[0] || {}), staffId: this.queryList.staffId});
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

    // 重置列表
    onResetList() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.queryList.staffId = _deepCopy(this.option.id);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();

      this.getList(true);
    },
  },
  computed: {
    getPrice() {
      return item => ["commission", "priceCommission"].includes(item.pricingMethod) ? item.price / 10000 : this.toYuan(item.price);
    },

    // 获取数量
    getQuantity() {
      return item => _isEqual("priceCommission", item.pricingMethod) ? this.toYuan(item.quantity) : item.quantity;
    },

    // 获取客户名称
    getCustomerName() {
      return child => _get(child, `0.customer.name`) || "";
    },

    // 获取订单地址
    getOrderAddress() {
      return child => _get(child, `0.orderAddress`) || "";
    },

    // 是否显示操作按钮
    isShowOperate() {
      return (item) => {
        // 除了取消结算的都需要显示操作按钮
        return !_isEqual(item.type, "CancelSettlement");
      };
    },

    // 是否显示修改按钮
    isShowEdit() {
      return (item) => {
        // 补贴
        if (_isEqual(item.type, "SubsidyAndBonus")) return this.isPerm("STAFF_EDIT_SUBSIDY");
        // 工资
        if (_isEqual(item.type, "ClearAnAccount")) return this.isPerm("COST_UPDATE");

        return false;
      };
    },

    // 获取分类列表
    getGroupList() {
      return _groupBy(this.list, (item) => item.orderCode);
    },

    // #ifdef H5
    getTypeEnum() {
      return (type) => ({
        ProductionSettlement: "生产结算",
        ClearAnAccount: "工资/补贴/奖金",
        SubsidyAndBonus: "补贴/奖金",
        CancelSettlement: "取消结算",
      })[type];
    },


    getPricingPrice() {
      return node => {
        const {pricingMethod, amount} = node || {};
        if (pricingMethod) {
          if (_isEqual(pricingMethod, "none")) return amount ? `${this.toYuan(Math.abs(amount || 0))}` : "";
          if (_isEqual(pricingMethod, "commission")) return `× ${this.getPrice(node)}`;
          return `${this.getPrice(node)} × ${this.getQuantity(node)}`;
        }
        return "";
      };
    },

    getColumns() {
      const _this = this;
      return [
        {
          label: "序号",
          type: "index",
          width: 60,
        },
        {
          label: "名称",
          prop: "name",
        },
        {
          label: "类型",
          prop: "type",
          render: (h, {row}) => {
            return h("span", {
              style: {
                color: {
                  ProductionSettlement: "#16a34a",
                  ClearAnAccount: "#d97706",
                  SubsidyAndBonus: "#0284c7",
                  CancelSettlement: "#dc2626",
                } [row.type],
              },
            }, [this.getTypeEnum(row.type)]);
          },
        },
        {
          label: "计价方式",
          prop: "pricingMethod",
          render(h, {row}) {
            return h("span", [PRICING_METHOD[row.pricingMethod]]);
          },
        },
        {
          label: "计价",
          prop: "price",
          render: (h, {row}) => {
            return h("span", {class: "ko-basic-money"}, [this.getPricingPrice(row)]);
          },
        },
        {
          label: "结算",
          prop: "finalAmount",
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(Math.abs(row.amount))]);
          },
        },
        {
          label: "日期",
          prop: "updateTime",
        },
        {
          label: "操作",
          width: 160,
          slot: "operate",
        },
      ];
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-wages">
    <HistoryBar
      :values="['工资']"
      :is-show-search="true"
      ref="SearchRef"
    >
      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <PickerUser
              style="width: 100%;"
              placeholder="请选择员工"
              is-input
              title="选择员工"
              v-model="queryList.staffId"
              type="staff"
              is-confirm
              ref="UserRef"
              no-safe-bottom
            />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput v-model="queryList.orderCode" placeholder="请输入编号" />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput v-model="queryList['customer.name']" placeholder="请输入客户名称" />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput v-model="queryList.orderAddress" placeholder="请输入地址" />
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
            <view style="display: flex;align-items: center;justify-content: space-around; padding-top: 10px;">
              <button
                style="width: 35%;"
                class="ko-basic-button__card"
                @click.stop="onResetList(true)"
              >
                重置
              </button>
              <button
                style="width: 35%;"
                class="ko-basic-button__card"
                @click.stop="getList(true)"
              >
                搜索
              </button>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </HistoryBar>

    <view class="ko-wages__wrap">
      <!-- #ifdef MP -->
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view>
          <block v-for="(child, key) of getGroupList" :key="key">
            <uni-section :title="key" type="line">
              <template #title>
                <view style="display: flex; align-items: center; justify-content: space-between;">
                  <view>
                    <view style="font-size: 16px; font-weight: bold;">{{ key }}</view>
                    <view style="font-weight: normal; font-size: 11px; display: flex; align-items: center">
                      <view v-if="getCustomerName(child)">
                        <uni-icons type="person" size="12" />
                        {{ getCustomerName(child) }}
                      </view>
                      <view style="margin-left: 20px;" v-if="getOrderAddress(child)">
                        <uni-icons type="location" size="12" />
                        {{ getOrderAddress(child) }}
                      </view>
                    </view>
                  </view>

                  <button
                    class="ko-basic-button__card"
                    v-if="isEqual(GET_FUNC(child, '0.type'), 'ProductionSettlement') && isPerm('STAFF_ADD_SUBSIDY') && !isNoOperate"
                    @click.stop="onAddSettle(child)"
                  >
                    结算
                  </button>
                </view>
              </template>

              <view style="padding: 0 10px;">
                <WageCard
                  v-for="(item, index) of child"
                  :key="item.id"
                  :node="item"
                >
                  <template #operate v-if="!isNoOperate && isShowOperate(item)">
                    <view style="display: flex; align-items: center;">
                      <button class="ko-basic-button__card" @click.stop="onRemove(item, index)">删除</button>
                      <button
                        class="ko-basic-button__card"
                        @click.stop="onEditor(item, index)"
                        v-if="isShowEdit(item)"
                      >
                        修改
                      </button>
                    </view>
                  </template>
                </WageCard>
              </view>
            </uni-section>
          </block>
        </view>
      </KoList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <KoList
        :no-more="noMore"
        hide-tips
        @load-next="onRequestNextPage"
        @lower="onRequestNextPage"
        :data="list"
        :loading="loading"
      >
        <block v-for="(child, key) of getGroupList" :key="key">
          <uni-section :title="key" type="line">
            <template #title>
              <view style="display: flex; align-items: center; justify-content: space-between;">
                <view>
                  <view style="font-size: 16px; font-weight: bold;">{{ key }}</view>
                  <view style="font-weight: normal; font-size: 14px; display: flex; align-items: center">
                    <view v-if="getCustomerName(child)">
                      <uni-icons type="person" size="14" />
                      {{ getCustomerName(child) }}
                    </view>
                    <view style="margin-left: 20px;" v-if="getOrderAddress(child)">
                      <uni-icons type="location" size="14" />
                      {{ getOrderAddress(child) }}
                    </view>
                  </view>
                </view>

                <button
                  class="ko-basic-button__card"
                  v-if="isEqual(GET_FUNC(child, '0.type'), 'ProductionSettlement') && isPerm('STAFF_ADD_SUBSIDY')"
                  @click.stop="onAddSettle(child)"
                >
                  结算
                </button>
              </view>
            </template>

            <KoTable
              :columns="getColumns"
              :data="child"
              stripe
              no-refresh
            >
              <template #operate="{item, index}" v-if="!isNoOperate">
                <view style="display: flex; align-items: center; justify-content: center;" v-if="isShowOperate(item)">
                  <button class="ko-basic-button__card" @click.stop="onRemove(item, index)">删除</button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onEditor(item, index)"
                    v-if="isShowEdit(item)"
                  >
                    修改
                  </button>
                </view>
              </template>
            </KoTable>
          </uni-section>
        </block>

        <view v-if="!list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">暂无数据</view>
        <view v-if="noMore && list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">
          没有更多数据了
        </view>
      </KoList>
      <!-- #endif -->
    </view>

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable  && !isNoOperate"
      @click="onTrigger"
    />

    <!-- 补贴操作 -->
    <SubsidyPopup ref="SPRef" @success="getList(true)" @remove="getList(true)" />

    <!-- 工资操作 -->
    <WagePopup ref="WPRef" @success="getList(true)" @remove="getList(true)" />

    <!-- 订单结算 -->
    <SettlePopup ref="SettlePRef" @success="getList(true)" @remove="getList(true)" />
  </view>
</template>

<style scoped lang="scss">
.ko-wages {
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  &__wrap {
    flex: 1;
    overflow: hidden;
  }
}

// #ifdef H5
.ko-wages {
  height: calc(100vh - 50px);
}

// #endif
</style>
