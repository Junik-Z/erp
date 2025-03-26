<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import TrendChart from "./components/TrendChart.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import PickerDate from "./components/PickerDate.vue";
import { getReportAssetsApi, getReportRecentApi, getReportTrendApi } from "@/api/erp/finance";
import Dayjs from "@/utils/dayjs";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { PageEnums } from "@/utils/config";

import advancedFormat from "./advancedFormat";
import weekOfYear from "./weekOfYear";

Dayjs.extend(weekOfYear);
Dayjs.extend(advancedFormat);

let timeConstant = "Week";

// #ifdef H5
timeConstant = "Day";
// #endif

export default {
  name: "Reports",
  mixins: [mixins],
  data() {
    return {
      loading: false,
      noMore: false,
      list: [],

      current: 0,

      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      TrendQuery: {
        date: Dayjs().format("YYYY-MM-DD HH:mm:ss"),
        timeConstant: timeConstant,
      },

      radioList: [
        {
          label: "年",
          value: "Year",
        },
        {
          label: "季",
          value: "Quarter",
        },
        {
          label: "月",
          value: "Month",
        },
        {
          label: "周",
          value: "Week",
        },
        {
          label: "天",
          value: "Day",
        },
      ],

      assets: {
        "totalStockValue": 0,
        "totalFixedAssetsValue": 0,
        "totalReceivables": 0,
        "totalPayables": 0,
      },

      tableKey: +new Date(),

      trend: {},
      tLoading: false,

      isZoom: false,
    };
  },
  onLoad() {
    this.getList();
    this.getReportAssets();
    this.getReportTrend();
  },
  components: {
    KoList,
    BasicCard,
    TrendChart,
    UvCountTo,
    OrderCard,
    PickerDate,
  },
  methods: {
    // 请求下一页数据
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 获取资产统计
    getReportAssets() {
      if (!this.isPerm("FINANCE_REPORT_ASSETS")) return false;
      getReportAssetsApi()
        .then(res => {
          this.assets = res.data;
        });
    },

    // 获取收支趋势
    getReportTrend() {
      if (!this.isPerm("FINANCE_REPORT_TREND")) return false;

      this.tLoading = true;
      getReportTrendApi(this.TrendQuery)
        .then(res => {
          this.trend = res.data;
        })
        .finally(() => {
          this.tLoading = false;
        });
    },

    // 获取最近交易列表
    getList(reset) {
      if (!this.isPerm("FINANCE_REPORT_RECENT")) return false;

      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
        this.tableKey = +new Date();
      }

      // #ifdef H5
      const top = _deepCopy(this.$refs?.WrapRef?.scrollTop) || 0;
      // #endif

      this.loading = true;
      getReportRecentApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize || true;
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

    // 切换趋势请求类型
    onAskTrend(item) {
      this.TrendQuery.timeConstant = item.value;
      this.getReportTrend();
    },

    // 切换日期触发
    onTrendQuery() {
      this.getReportTrend();
    },

    // 跳转到详情
    onJumpLately() {
      uni.navigateTo({
        url: PageEnums.financeLately,
      });
    },
  },
  mounted() {
  },
  computed: {
    // 获取统计数据
    getTabsList() {
      return [
        {
          label: "固定资产",
          money: this.toYuan(_get(this.assets, "totalFixedAssetsValue") || 0),
        },
        {
          label: "库存总额",
          money: this.toYuan(_get(this.assets, "totalStockValue") || 0),
        },
        {
          label: "应收总额",
          money: this.toYuan(_get(this.assets, "totalReceivables") || 0),
        },
        {
          label: "应付总额",
          money: this.toYuan(_get(this.assets, "totalPayables") || 0),
        },
      ];
    },

    // 获取统计表格的样式
    getCountStyle() {
      let columns = "50% 50%";

      // #ifdef H5
      columns = "25% 25% 25% 25%";
      // #endif

      return {
        "grid-template-columns": columns,
      };
    },

    // 支出收入统计
    statistics() {
      const T = _deepCopy(this.trend);

      return [
        {
          title: "收入",
          money: this.toYuan(T.income),
          color: "#388E3C",
        },
        {
          title: "支出",
          money: this.toYuan(T.expense),
          color: "#D32F2F",
        },
        {
          title: "净利润",
          money: this.toYuan(T.profit),
          color: "#303F9F",
        },
      ];
    },

    // 获取时间选择器的选择类型
    getPickDateMode() {
      return {
        Year: "year",
        Quarter: "year-month",
        Month: "year-month",
        Week: "date",
        Day: "date",
      }[this.TrendQuery.timeConstant] || "date";
    },

    // 获取时间格式化
    getFormatType() {
      return {
        Year: "YYYY",
        Quarter: "YYYY年Q季度",
        Month: "YYYY-MM",
        Week: "YYYY年ww周",
        Day: "YYYY-MM-DD",
      }[this.TrendQuery.timeConstant];
    },

    // 表格头部
    // #ifdef H5
    columns() {
      const col = [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "订单编号",
          prop: "orderCode",
        },
        {
          label: "类型",
          prop: "orderType",
          render: (h, {row}) => {
            return h("div", {}, `${this.ORDER_TYPE_ENUMS(row.orderType)}`);
          },
        },
        {
          label: "日期",
          prop: "updateTime",
          width: 180,
        },
        {
          label: "客户/供应商",
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
                      src: this.getImageUrl(_get(row, "customer.logo")),
                      size: 42,
                      text: _get(row, "customer.name") || this.GET_SHOP_NAME,
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
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #388E3C;"}, ` ${this.toYuan(row.totalAmount)}`);
          },
        },
        {
          label: "成本(元)",
          prop: "costAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #D32F2F;"}, ` ${this.toYuan(row.costAmount)}`);
          },
        },
        {
          label: "利润(元)",
          prop: "profitAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money", style: "color: #303F9F;"}, ` ${this.toYuan(row.profitAmount)}`);
          },
        },
        {
          label: "地址",
          prop: "orderAddress",
        },
        {
          label: "备注",
          prop: "remark",
        },
      ];

      return col;
    },
    // #endif
  },
};
</script>

<template>
  <!-- #ifdef H5 -->
  <view
    class="ko-reports__h5"
    v-infinite-scroll="RequestNextPage"
    infinite-scroll-immediate
    :infinite-scroll-delay="200"
    :infinite-scroll-distance="200"
    ref="WrapRef"
    :key="tableKey"
  >
    <!-- #endif -->
    <view class="ko-reports">
      <view
        v-if="isPerm('FINANCE_REPORT_ASSETS')"
        class="ko-basic-table ko-basic-table__not-border"
        style="padding: 0 5px 10px;"
        :style="[getCountStyle]"
      >
        <view v-for="(item, index) of getTabsList" :key="index" style="padding: 5px;">
          <view class="ko-basic-count">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info" style="color: #2979ff;">
              <text style="padding-right: 2px;">¥</text>
              <UvCountTo
                separator=","
                :start-val="0"
                bold
                :end-val="item.money"
                color="#2979ff"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="ko-reports__trend" v-if="isPerm('FINANCE_REPORT_TREND')">
        <view class="ko-reports__title">
          收支趋势
        </view>

        <view class="ko-reports__search">
          <view class="ko-reports__radio" style="margin-right: 10px;">
            <view
              class="ko-reports__radio--item"
              v-for="item of radioList"
              :key="item.value"
              :class="[{'checked': isEqual(item.value, TrendQuery.timeConstant)}]"
              @click="onAskTrend(item)"
            >
              {{ item.label }}
            </view>
          </view>
          <view class="ko-reports__search--input">
            <PickerDate
              :mode="getPickDateMode"
              :show-format="getFormatType"
              v-model="TrendQuery.date"
              @change="onTrendQuery"
            />
          </view>
        </view>

        <BasicCard not-padding>
          <view class="ko-reports__trend--ec">
            <TrendChart :trend="trend" :loading="tLoading" :is-zoom.sync="isZoom" />
          </view>
          <view
            style="font-size: 8px; text-align: center; color: #c7c9ce; padding-bottom: 8px;"
            v-if="isZoom"
          >
            左右滑动显示更多数据
          </view>
        </BasicCard>

        <view class="ko-reports__statistics">
          <view
            class="ko-basic-table ko-basic-table__not-border"
            style="grid-template-columns: 33% 33% 33%; margin: 0 -5px; padding-top: 6px;"
          >
            <view class="ko-reports__trend--item" v-for="(item, index) of statistics" :key="index">
              <BasicCard>
                <view class="ko-reports__trend--item--title">{{ item.title }}</view>
                <view class="ko-reports__trend--item--money" :style="[{color: item.color}]">
                  <text>¥</text>
                  <!-- #ifdef MP -->
                  <UvCountTo
                    separator=","
                    :start-val="0"
                    :decimals="0"
                    decimal="."
                    bold
                    :end-val="item.money"
                    :color="item.color"
                    :font-size="16"
                  />
                  <!-- #endif -->
                  <!-- #ifdef H5 -->
                  <UvCountTo
                    separator=","
                    :start-val="0"
                    :decimals="0"
                    decimal="."
                    bold
                    :end-val="item.money"
                    :color="item.color"
                    :font-size="24"
                  />
                  <!-- #endif -->
                </view>
                <view v-if="false" class="ko-reports__trend--item--scale" style="color: #e43d33;">
                  <uni-icons type="arrow-up" color="#e43d33" size="10" />
                  {{ item.scale }}%
                </view>
              </BasicCard>
            </view>
          </view>
        </view>
      </view>

      <view class="ko-reports__trade" v-if="isPerm('FINANCE_REPORT_RECENT')">
        <view
          class="ko-reports__title"
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;"
        >
          最近交易
          <button
            @click="onJumpLately"
            class="ko-basic-button__card"
            style="font-weight: normal;"
            v-if="isPerm('FINANCE_REPORT_RECENT_LIST')"
          >
            查看全部
          </button>
        </view>

        <!-- #ifdef MP -->
        <view>
          <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
            <view
              v-for="(item, index) of list"
              :key="index"
              style="padding: 5px"
            >
              <OrderCard
                :item="item"
                is-reports
                is-new
                show-order-type
                is-hide-status
                is-hide-user
              />
            </view>
          </KoList>
        </view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px; height: 100%; overflow: hidden;">
          <KoTable
            :loading="loading"
            :columns="columns"
            :data="list"
            empty-text="暂无数据"
            stripe
            no-more
          />
        </view>
        <!-- #endif -->
      </view>


      <view
        class="ko-not-perm"
        v-if="!(isPerm('FINANCE_REPORT_ASSETS') && isPerm('FINANCE_REPORT_TREND') && isPerm('FINANCE_REPORT_RECENT'))"
      />
    </view>
    <!-- #ifdef H5 -->
  </view>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-reports {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;

  &__search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;

    &--input {
      width: 40%;
    }
  }

  // #endif

  // #ifdef H5
  &__h5 {
    height: calc(100vh - 56px - 10px);
    overflow-y: auto;
  }

  &__search {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 10px;

    &--input {
      width: 260px;
    }
  }

  // #endif


  // #ifndef H5
  &__title {
    font-size: 14px;
    font-weight: bold;
  }

  // #endif

  // #ifdef H5
  &__title {
    font-size: 18px;
    font-weight: bold;
  }

  &__statistics {
    width: 1024px;
    margin: 0 auto;
  }

  // #endif

  &__trend {
    padding: 0 10px 10px;

    // #ifndef H5
    &--ec {
      margin-top: 10px;
      height: 280px;
    }

    &--item {
      padding: 5px;

      &--title {
        font-size: 12px;
        color: #8f939c;
      }

      &--money {
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        font-size: 12px;
      }

      &--scale {
        margin-top: 4px;
        font-size: 10px;
      }
    }

    // #endif

    // #ifdef H5
    &--ec {
      margin-top: 10px;
      height: 480px;

      ::v-deep .uni-ec-canvas {
        height: 480px;
      }
    }

    &--item {
      padding: 10px;

      &--title {
        padding: 10px 10px 0;
        font-size: 16px;
        color: #8f939c;
      }

      &--money {
        margin-top: 10px;
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        font-size: 16px;
        padding: 0 10px 16px;
      }

      &--scale {
        margin-top: 4px;
        font-size: 12px;
      }
    }

    // #endif
  }

  // 最近交易
  &__trade {
    padding: 10px;
  }

  &__radio {
    display: flex;
    align-items: center;
    border-radius: 6px;
    //border: 1px solid #e9e9eb;
    color: #8f939c;
    font-weight: normal;

    &--item {
      text-align: center;
      font-size: 12px;
      border-radius: 6px;
      padding: 4px 10px;
      position: relative;
      transition: background .3s, color .3s;

      &::before {
        content: "|";
        color: #e9e9eb;
        position: absolute;
        right: -1px;
        top: 50%;
        transform: translateY(-50%);

      }

      &.checked {
        color: #fff;
        background: #256EFF;

        &::before {
          display: none;
        }
      }

      &:last-child {
        &::before {
          display: none;
        }
      }
    }

    // #ifdef H5
    &--item {
      cursor: pointer;
      font-size: 14px;
    }

    // #endif
  }

}
</style>
