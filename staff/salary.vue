<!-- 员工工资 -->
<script>
import {
  getMyMonthListApi,
  getMySalaryApi,
  getMySettledListApi,
  getMyWorkingListApi,
  getWaitMyConfirmListApi,
} from "@/api/erp/produce";
import { _deepCopy, _get, _groupBy, _isEmpty, _isEqual } from "@/utils";
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

      // #ifdef H5
      const top = _deepCopy(this.$refs?.WrapRef?.scrollTop);
      // #endif

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

          // #ifdef H5
          this.$nextTick(() => {
            this.$refs.WrapRef.scrollTop = top;
          });
          // #endif
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
          width: 60,
        },
        {
          label: "名称",
          prop: "name",
        },
        {
          label: "图片",
          prop: "images",
          render(h, {row}) {
            return h(
              UvAvatar,
              {
                props: {
                  src: _this.getImageUrl(row.images),
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
          render(h, {row}) {
            return h("span", {class: "ko-basic-money"}, [_this.toYuan(row.price)]);
          },
        },
        {
          label: "数量",
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
          label: "描述",
          prop: "description",
          render(h, {row}) {
            return h("span", [row.description]);
          },
        },
      ];
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
        "--ko-basic-table-grid-col": "auto ".repeat([4, 5, 6][this.GET_PAGE_MENU_FUNC]).trim(),
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
  <!-- #ifdef H5 -->
  <view
    class="ko-salary__H5"
    v-infinite-scroll="onRequestNextPage"
    infinite-scroll-immediate
    :infinite-scroll-delay="200"
    :infinite-scroll-disabled="noMore"
    :infinite-scroll-distance="200"
    :key="tableKey"
    ref="WrapRef"
  >
    <!-- #endif -->

    <view class="ko-salary">
      <TopMenus :tabs="TabList" :path="PageEnums.salary" />

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

      <!-- #ifdef MP -->
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

                  <view class="ko-basic-table--th" v-if="GET_PAGE_MENU_FUNC === 0">员工</view>

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

                    <view class="ko-basic-table--cell" v-if="GET_PAGE_MENU_FUNC === 0">
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
                  </block>
                </view>
              </uni-section>
            </block>
          </view>
        </KoList>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view class="ko-factory__table-wrap">
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
              :loading="loading"
              :columns="getColumns"
              :data="child"
              stripe
            />
          </uni-section>
        </block>

        <view v-if="!list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">暂无数据</view>
        <view v-if="noMore && list.length" style="text-align: center; padding: 20px; color: #c7c9ce;">
          没有更多数据了
        </view>
      </view>
      <!-- #endif -->

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

    <!-- #ifdef H5 -->
  </view>
  <!-- #endif -->
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

  // #ifdef H5
  &__H5 {
    height: calc(100vh - 50px);
    overflow-y: auto;
  }

  .ko-basic-count__wrap {
    width: 1024px;
    margin: 0 auto;
  }

  // #endif
}
</style>
