<script>
import QiunDataCharts from "./components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import { getCountApi } from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _get, _pick } from "@/utils";
import mixins from "@/mixins/mixins";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { PageEnums } from "@/utils/config";
import TopMenus from "./components/TopMenus.vue";

export default {
  name: "ViewVersion",
  components: {TopMenus, UniSection, UniCol, UvCountTo, UniRow, QiunDataCharts},
  mixins: [mixins],
  data() {
    return {
      loading: false,

      data: {
        "totalStock": 0,
        "totalValue": 0,
        "productStockWarning": 0,
        "warningTrend": {},
        "stockRank": {},
      },

      CountList: [
        // #ifndef H5
        {
          label: "库存总价值",
          key: "totalValue",
          color: "#2979ff",
          unit: "元",
          span: 24,
        },
        {
          label: "库存总量",
          key: "totalStock",
          color: "#2979ff",
        },
        {
          label: "库存预警",
          key: "productStockWarning",
          color: "#e43d33",
          unit: "",
          func: "onJumpWarning",
        },
        // #endif
        // #ifdef H5
        {
          label: "库存总量",
          key: "totalStock",
          color: "#2979ff",
          span: 6,
        },
        {
          label: "库存总价值",
          key: "totalValue",
          color: "#2979ff",
          unit: "元",
          span: 12,
        },
        {
          label: "库存预警",
          key: "productStockWarning",
          color: "#e43d33",
          unit: "",
          func: "onJumpWarning",
          span: 6,
        },
        // #endif
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
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      getCountApi()
        .then(res => {
          const data = res.data;
          this.data = _pick(data, ["totalStock", "totalValue", "productStockWarning"]);

          // 预警趋势 [预警库存, 现有库存]
          const warningTrend = {
            categories: [],
            series: [
              {
                name: "预警库存",
                color: "#EE6666",
                data: [],
              },
              {
                name: "现有库存",
                color: "#1890FF",
                data: [],
              },
            ],
          };

          ;(data.warningTrend || [])?.forEach(item => {
            const N = (item.name || "");

            let name = N.substring(0, 15) || "";

            if (N.length > name.length) {
              name = `${name}...`;
            }

            warningTrend.categories.push(name);

            // warningTrend.categories.push(item.name);
            warningTrend.series[0].data.push(_get(item, "amounts.0") || 0);
            warningTrend.series[1].data.push(_get(item, "amounts.1") || 0);
          });

          this.data.warningTrend = warningTrend;

          // 存量类别排名
          const stockRank = {
            categories: [],
            series: [
              {
                name: "排名",
                data: [],
              },
            ],
          };
          ;(data.stockRank || [])?.forEach(item => {
            stockRank.categories.push(item.name);
            stockRank.series[0].data.push(item.amount || 0);
          });
          this.data.stockRank = stockRank;
        })
        .catch(() => {
          this.data.warningTrend = {};
          this.data.stockRank = {};
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 跳转到库存预警页面
    onJumpWarning() {
      if (this.isPerm("STOCK_WARNING_LIST")) {
        uni.navigateTo({
          url: PageEnums.stockWarning,
        });
      }
    },

    onFunc(item) {
      console.log(item);

      if (item.func) {
        this[item.func](item);
      }
    },
  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.data, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },

    getOptions() {
      return {
        ...this.getBasicChartsOptions(this.data.warningTrend),
        height: 500,
        padding: [10, 30, 10, 0],
        xAxis: {
          boundaryGap: "justify",
          disableGrid: false,
          min: 0,
          axisLine: false,
          fontsize: 10,
        },
        yAxis: {
          boundaryGap: "justify",
          disableGrid: false,
          axisLine: false,
        },
        extra: {
          bar: {
            // type: "stack",
            width: 20,
            meterBorde: 1,
            activeBgOpacity: 0.08,
            linearType: "none",
            barBorderCircle: true,
            seriesGap: 0,
            categoryGap: 2,
          },
        },
      };
    },
  },
};
</script>

<template>
  <view class="ko-view-version">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->

    <TopMenus :path="PageEnums.stockView"/>

    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count" @click.stop="onFunc(item)">
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

    <view class="ko-view-version__row">
      <UniSection title="库存预警趋势" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions"
          :chart-data="data.warningTrend"
        />
      </UniSection>

      <UniSection title="存量类别排名" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getBasicChartsOptions(data.stockRank)"
          :chart-data="data.stockRank"
        />
      </UniSection>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-view-version {
  margin-top: 10px;
  padding-bottom: 80px;

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
  }
}
</style>
