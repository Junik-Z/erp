<script>
import {
  applySettleApi,
  completeCraftApi,
  getMyMonthListApi,
  getMySalaryApi,
  getMySettledListApi,
  getMyWorkingListApi,
  getWaitMyConfirmListApi,
} from "@/api/erp/produce";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual, CustomToast } from "@/utils";
import mixins from "@/mixins/mixins";
import { PRICING_METHOD } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import TopMenus from "./components/TopMenus.vue";
import { TabList } from "./define";
import UvCalendars from "./components/uv-calendars/uv-calendars.vue";
import dayjs from "@/utils/dayjs";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import PickerCalendars from "./components/uv-calendars/PickerCalendars.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
// #ifdef H5
import InProduct from "./components/InProduct.vue";
// #endif

const PageMenu = [
  {
    label: "生产中",
    perm: "CRAFT_MY_WORKING",
    func: 0,
  },
  {
    label: "待确认",
    perm: "CRAFT_WAIT_MY_CONFIRM",
    func: 1,
  },
  {
    label: "已确认",
    perm: "CRAFT_MY_SETTLED",
    func: 2,
  },
];

export default {
  name: "salary",
  components: {
    PickerCalendars,
    TopMenus,
    KoList,
    UvCalendars,
    UvAvatar,
    UvCountTo,
    UniRow,
    UniCol,
    // #ifdef H5
    InProduct,
    // #endif
  },
  data() {
    return {
      MySalary: 0,
      CountList: [
        {
          label: "我的工资",
          key: "MySalary",
          color: "#2979ff",
          unit: "元",
          span: 24,
        },
      ],

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      list: [],
      loading: false,
      noMore: false,

      node: {},
      nodeIndex: null,

      tableKey: +new Date(),

      MyMonth: [],

      MyMonthQuery: {
        year: dayjs().year(),
        month: dayjs().month() + 1,
      },

      groupList: {},

      PAGE_MENU: _deepCopy(PageMenu),

      maxInputWrapHeight: 100,
      sVisible: false,
      pLoading: false,
      sQuantity: null,
    };
  },
  mixins: [mixins],
  onLoad() {
    this.getMySalary();
    this.getMyMonth();
    this.getList(true);
  },
  // #ifdef MP
  onReachBottom() {
    this.onRequestNextPage();
  },
  // #endif
  methods: {
    // 获取我的工资
    getMySalary() {
      if (this.isPerm("CRAFT_MY_SALARY")) {
        getMySalaryApi()
          .then(res => {
            this.MySalary = res.data;
            console.log(res.data);
          });
      }
    },

    // 获取月工资
    getMyMonth() {
      if (this.isPerm("CRAFT_MY_MONTH")) {
        getMyMonthListApi(this.MyMonthQuery)
          .then(res => {
            this.MyMonth = res.data.map(item => {
              return {
                date: item.settleDate,
                info: this.toYuan(item.finalAmount),
              };
            });
          });
      }
    },

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
        // this.tableKey = +new Date();
        this.noMore = false;
        this.groupList = {};
      }

      this.loading = true;
      const Func = [getMyWorkingListApi, getWaitMyConfirmListApi, getMySettledListApi][this.GET_PAGE_MENU_FUNC];
      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.groupList = _groupBy(this.list, (item) => item.orderCode);

          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.$refs.SearchRef.onShowSearch(false);
      this.$refs.PCRef && this.$refs.PCRef.clearable();
      this.tableKey = +new Date();
      this.getList(true);
    },

    onSelect({func}) {
      this[func](_deepCopy(this.node), this.nodeIndex);
    },

    onActionClick(node, index) {
      this.node = node;
      this.nodeIndex = index;
      this.$refs.UASRef.open();
    },

    // 年月切换
    onMonthSwitch(date) {
      this.MyMonthQuery = date;
      this.getMyMonth();
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

    // 申请结算
    onApplySettle(row) {
      this.node = _deepCopy(row);
      this.sQuantity = null;
      this.sVisible = true;
    },

    // 结算
    onSettlementSubmit() {
      if (_isEmpty(this.node)) {
        CustomToast({
          title: "未匹配到流程，请重试。",
        });
        return false;
      }

      const quantity = +this.sQuantity;

      if (!["fixedPrice", "fixedPriceGroup"].includes(this.node.pricingMethod)) {
        if (isNaN(quantity)) {
          CustomToast({
            title: "请输入数字字符",
            icon: "none",
          });
          return false;
        }

        if (quantity < 0) {
          CustomToast({
            title: "数量不能少于1",
            icon: "none",
          });
          return false;
        }
      }

      this.pLoading = true;
      applySettleApi({...this.node, quantity})
        .then(() => {
          uni.showModal({
            title: "温馨提示",
            content: "请与厂长核对金额，核对无误后，待厂长确认，完成最终的确认结算流程。",
            showCancel: false,
          });
        })
        .finally(() => {
          this.sVisible = false;
          this.pLoading = false;
        });
    },
    // 完成工序
    onCompleteCraft(row) {
      uni.showModal({
        title: "温馨提示",
        content: ` 您是否已经完成该工序？`,
        success: (res) => {
          if (res.confirm) {
            completeCraftApi({id: row.id})
              .then(() => {
                this.$set(row, "status", "FINISHED");
                CustomToast({
                  title: "操作成功",
                });
              });

          }
        },
      });
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        return this.toYuan(this[item.key]);
      };
    },

    actionList() {
      return [];
    },

    // #ifdef H5
    getColumns() {
      const _this = this;
      return [
        {
          label: "序号",
          type: "index",
          width: 50,
        },
        {
          label: "名称",
          prop: "name",
        },
        {
          label: "图片",
          prop: "images",
          width: 60,
          render(h, {row}) {
            return h(
              UvAvatar,
              {
                props: {
                  src: _this.getImageUrl(row.images),
                  size: 32,
                },
              });
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
          label: "价格",
          prop: "price",
          width: 100,
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.price)]);
          },
        },
        {
          label: "数量",
          width: 100,
          prop: "quantity",
        },
        {
          label: "结算",
          prop: "finalAmount",
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.finalAmount)]);
          },
        },
        {
          label: "日期",
          prop: "createTime",
        },
        {
          label: "员工",
          prop: "staffList",
          render(h, {row}) {
            return h("div", {
                style: {
                  flex: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  "align-items": "center",
                  "justify-content": "center",
                },
              },
              _this.getStaffListLogo(row)
                .map(item => h(
                  "div",
                  {
                    style: {
                      padding: "5px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  },
                  [
                    h(
                      UvAvatar,
                      {
                        props: {
                          src: _this.getImageUrl(item.logo),
                          randomBgColor: true,
                          size: 24,
                          text: item.name,
                        },
                      }),
                    h("span", {
                      style: {fontSize: "10px", color: "#8f939c", paddingTop: "5px"},
                    }, [item.name]),
                  ],
                )),
            );
          },
        },
        {
          label: "描述",
          prop: "description",
          render(h, {row}) {
            return h("span", [row.description]);
          },
        },
        {
          label: "操作",
          prop: "operate",
          render(h, {row}) {
            return h("div", {style: {display: "flex", alignItems: "center"}}, [
              (_this.isPerm("CRAFT_APPLY_SETTLE") && h("button", {
                class: "ko-basic-button__card",
                on: {click: _this.onApplySettle.bind(_this, row)},
              }, ["申请结算"])),
              (_this.isPerm("CRAFT_COMPLETE") && h("button", {
                class: "ko-basic-button__card",
                on: {click: _this.onCompleteCraft.bind(_this, row)},
              }, ["完成"])),
            ]);
          },
        },
      ]
        .filter(item => {
          if (this.GET_PAGE_MENU_FUNC === 0) return !["quantity", "finalAmount"].includes(item.prop);

          if (this.GET_PAGE_MENU_FUNC !== 0) return !["operate", "staff"].includes(item.prop);

          return true;
        });
    },
    // #endif

    TabList() {
      return TabList;
    },

    // 获取计价方式
    getPricingMethod() {
      return key => PRICING_METHOD[key];
    },

    // 获取人员头像
    getStaffListLogo() {
      return (item) => _isEmpty(item?.staffs) ? (item.staff ? [item.staff] : []) : item?.staffs || [];
    },

    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "auto ".repeat([5, 5, 6][this.GET_PAGE_MENU_FUNC]).trim(),
      };
    },

    // 获取计价方式价格
    getPricingMethodPrice() {
      return row => {
        return _isEqual(row.pricingMethod, "commission") ? `${(row.price || 0) / 10000}%` : this.toYuan(row.price);
      };
    },

    // 获取客户名称
    getCustomerName() {
      return child => _get(child, `0.customer.name`) || "-";
    },

    // 获取订单地址
    getOrderAddress() {
      return child => _get(child, `0.orderAddress`) || "";
    },
  },
};
</script>

<template>
  <view class="ko-salary">
    <TopMenus :tabs="TabList" :path="PageEnums.salary" />

    <!-- #ifdef MP -->
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10" v-if="isPerm('CRAFT_MY_SALARY')">
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
    <view style="padding: 10px;" v-if="isPerm('CRAFT_MY_MONTH')">
      <UvCalendars
        :insert="true"
        :lunar="true"
        readonly
        :selected="MyMonth"
        @month-switch="onMonthSwitch"
      />
    </view>
    <HistoryBar
      v-model="PAGE_MENU_INDEX"
      :values="GET_PAGE_MENU"
      label-key="label"

      @change="onResetList(true)"
      :is-show-search="true"
      ref="SearchRef"
      :max-input-wrap-height.sync="maxInputWrapHeight"
    >
      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <uni-easyinput
              :cursorSpacing="maxInputWrapHeight"
              v-model="queryList.orderCode"
              placeholder="请输入编号"
            />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput
              v-model="queryList['customer.name']"
              placeholder="请输入客户名称"
              :cursorSpacing="maxInputWrapHeight - 50"
            />
          </UniCol>
          <UniCol :span="24" v-if="false">
            <uni-easyinput
              v-model="queryList['user.nickName']"
              placeholder="请输入下单用户名称"
              :cursorSpacing="maxInputWrapHeight - (50 * 2)"
            />
          </UniCol>
          <UniCol :span="24">
            <uni-easyinput
              :cursorSpacing="maxInputWrapHeight - (50 * 2)"
              v-model="queryList.orderAddress"
              placeholder="请输入地址"
            />
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
    <view>
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view :style="[getGridTemplateColumnsStyle]">
          <block v-for="(child, key) of groupList" :key="key">
            <uni-section :title="key" type="line">
              <template #title>
                <view>
                  <view>{{ key }}</view>
                  <view style="font-weight: normal; font-size: 11px; display: flex; align-items: center">
                    <view>
                      <uni-icons type="person" size="12" />
                      {{ getCustomerName(child) }}
                    </view>
                    <view style="margin-left: 20px;" v-if="getOrderAddress(child)">
                      <uni-icons type="location" size="12" />
                      {{ getOrderAddress(child) }}
                    </view>
                  </view>
                </view>
              </template>

              <view class="ko-basic-table">
                <view class="ko-basic-table--th">名称</view>
                <view class="ko-basic-table--th">计价方式</view>
                <view class="ko-basic-table--th">价格</view>

                <block v-if="GET_PAGE_MENU_FUNC !== 0">
                  <view class="ko-basic-table--th">数量</view>
                  <view class="ko-basic-table--th">结算</view>
                </block>

                <block v-if="GET_PAGE_MENU_FUNC > 1">
                  <view class="ko-basic-table--th">日期</view>
                </block>

                <block v-if="GET_PAGE_MENU_FUNC === 0">

                  <view class="ko-basic-table--th">员工</view>
                  <view class="ko-basic-table--th">操作</view>
                </block>

                <block v-for="item of child" :key="item.id">
                  <view class="ko-basic-table--cell">
                    {{ item.name }}
                  </view>
                  <view class="ko-basic-table--cell">
                    {{ getPricingMethod(item.pricingMethod) }}
                  </view>
                  <view class="ko-basic-table--cell">
                    {{ getPricingMethodPrice(item) }}
                  </view>

                  <block v-if="GET_PAGE_MENU_FUNC !== 0">
                    <view class="ko-basic-table--cell">{{ item.quantity }}</view>
                    <view class="ko-basic-table--cell">{{ toYuan(item.finalAmount) }}</view>
                  </block>

                  <block v-if="GET_PAGE_MENU_FUNC > 1">
                    <view class="ko-basic-table--cell">{{ item.updateTime }}</view>
                  </block>

                  <block v-if="GET_PAGE_MENU_FUNC === 0">
                    <view class="ko-basic-table--cell">
                      <view
                        style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;"
                      >
                        <view
                          style="padding: 2px; display: flex; flex-direction: column; justify-content: center;align-items: center;"
                          v-for="staff of getStaffListLogo(item)"
                          :key="staff.id"
                        >
                          <uv-avatar
                            :src="getImageUrl(staff.logo)"
                            random-bg-color
                            size="18"
                            :text="staff.name"
                          />
                          <text style="font-size: 10px; color: #8f939c;padding-top: 2px;">{{ staff.name }}</text>
                        </view>
                      </view>
                    </view>

                    <view class="ko-basic-table--cell">
                      <view style="display: flex; align-items: center;">
                        <button
                          class="ko-basic-button__card"
                          v-if="isPerm('CRAFT_APPLY_SETTLE')"
                          @click.stop="onApplySettle(item)"
                        >
                          申请结算
                        </button>
                        <button
                          class="ko-basic-button__card"
                          v-if="isPerm('CRAFT_COMPLETE')"
                          @click.stop="onCompleteCraft(item)"
                        >
                          完成
                        </button>
                      </view>
                    </view>
                  </block>

                </block>
              </view>
            </uni-section>
          </block>
        </view>
      </KoList>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="ko-salary__wrap">
      <view class="ko-salary__left">
        <view class="ko-basic-count__wrap">
          <UniRow :gutter="10" v-if="isPerm('CRAFT_MY_SALARY')">
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
        <view
          style="padding: 10px; border: 1px solid #EDEDED; border-radius: 6px; margin-bottom: 10px"
          v-if="isPerm('CRAFT_MY_MONTH')"
        >
          <UvCalendars
            :insert="true"
            :lunar="true"
            readonly
            :selected="MyMonth"
            @month-switch="onMonthSwitch"
          />
        </view>

        <InProduct class="ko-in-product" />
      </view>

      <view class="ko-salary__right">
        <HistoryBar
          v-model="PAGE_MENU_INDEX"
          :values="GET_PAGE_MENU"
          label-key="label"

          @change="onResetList(true)"
          :is-show-search="true"
          ref="SearchRef"
          :max-input-wrap-height.sync="maxInputWrapHeight"
        >
          <view class="ko-basic-search">
            <UniRow :gutter="10">
              <UniCol :span="24">
                <uni-easyinput
                  :cursorSpacing="maxInputWrapHeight"
                  v-model="queryList.orderCode"
                  placeholder="请输入编号"
                />
              </UniCol>
              <UniCol :span="24">
                <uni-easyinput
                  v-model="queryList['customer.name']"
                  placeholder="请输入客户名称"
                  :cursorSpacing="maxInputWrapHeight - 50"
                />
              </UniCol>
              <UniCol :span="24" v-if="false">
                <uni-easyinput
                  v-model="queryList['user.nickName']"
                  placeholder="请输入下单用户名称"
                  :cursorSpacing="maxInputWrapHeight - (50 * 2)"
                />
              </UniCol>
              <UniCol :span="24">
                <uni-easyinput
                  :cursorSpacing="maxInputWrapHeight - (50 * 2)"
                  v-model="queryList.orderAddress"
                  placeholder="请输入地址"
                />
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

        <KoList
          class="ko-salary__table"
          :no-more="noMore"
          hide-tips
          @load-next="onRequestNextPage"
          @lower="onRequestNextPage"
          :data="list"
          :loading="loading"
        >
          <block v-for="(child, key) of groupList" :key="key">
            <uni-section :title="key" type="line">
              <template #title>
                <div style="display: flex; align-items: center;">
                  <div>{{ key }}</div>
                  <div style="font-weight: normal; margin-left: 40px; font-size: 15px">
                  <span>
                    <uni-icons type="person" size="20" />
                    {{ getCustomerName(child) }}
                  </span>
                    <span style="margin-left: 20px;" v-if="getOrderAddress(child)">
                  <uni-icons type="location" size="20" />
                  {{ getOrderAddress(child) }}
                </span>
                  </div>
                </div>
              </template>

              <KoTable
                :columns="getColumns"
                :data="child"
                stripe
                no-refresh
                :no-more="noMore"
                hide-tips
              />
            </uni-section>
          </block>

          <view v-if="!list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">暂无数据</view>
          <view v-if="noMore && list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">
            没有更多数据了
          </view>
        </KoList>
      </view>
    </view>
    <!-- #endif -->

    <BasicPopup :visible.sync="sVisible" title="结算">
      <view class="ko-salary__popup">
        <view
          style="padding: 10px; font-size: 12px;color: #8f939c;"
        >
          计价方式：{{ getPricingMethod(node.pricingMethod) }}

          <text class="ko-basic-money" style="margin-left: 5px;" v-if="node.pricingMethod !== 'commission'">
            {{ toYuan(node.price) }}元
          </text>
          <text class="ko-basic-money" style="margin-left: 6px;" v-else>{{ node.price / 10000 }}%</text>
        </view>

        <uni-forms label-align="right" v-if="!['commission'].includes(node.pricingMethod)">
          <uni-forms-item
            label="数量"
            name="name"
            required
          >
            <uni-easyinput type="digit" v-model="sQuantity" placeholder="请输入数量" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-salary__popup--footer">
          <button
            class="ko-basic-button__card"
            @click="onSettlementSubmit"
            :loading="pLoading"
            :disabled="pLoading"
          >
            结算
          </button>
        </view>
      </template>
    </BasicPopup>

    <!-- #ifdef MP -->
    <uv-action-sheet
      ref="UASRef"
      :actions="actionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
$border-color: #e9e9eb;

.ko-salary {
  padding-top: 10px;

  ::v-deep .uv-calendar__header {
    height: 32px;
    padding-bottom: 10px;
  }

  ::v-deep .uv-calendar__backtoday {
    display: none;
  }

  .ko-basic-count__wrap {
    padding-bottom: 0;

    .ko-basic-count {
      padding: 0;
    }
  }

  &__info {
    font-size: 14px;
    color: $uni-base-color;
  }

  &__popup {
    padding: 10px;

    // #ifndef H5
    width: 98vw;
    // #endif

    // #ifdef H5
    width: 600px;
    // #endif

    &--footer {
      display: flex;
      align-items: center;
      justify-content: space-around;

      .ko-basic-button__card {
        width: 120px;
      }
    }
  }

  // #ifdef H5
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;

  &__wrap {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  &__left {
    width: 38%;
    height: 100%;
    padding: 0 0 10px 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .ko-basic-count__wrap {
      margin-bottom: 10px;

      .ko-basic-count {
        padding: 10px 0;
      }
    }

    .ko-in-product {
      flex: 1;
      overflow: hidden;
    }
  }

  &__right {
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-top: 5px;
  }

  &__table {
    flex: 1;
    overflow: hidden;
  }

  // #endif
}
</style>
