<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import QiunDataCharts from "./qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import { _flattenDeep, _get, _groupBy, _keys } from "@/utils";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { getProduceStatisticsApi } from "@/api/erp/produce";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "ViewVersion",
  components: {UniSection, UniCol, UvCountTo, UniRow, QiunDataCharts, UniGridItem, UniGrid},
  mixins: [mixins],
  data: () => ({
    CountList: [
      {
        label: "已生产单数",
        key: "producedProduceCount",
        color: "#2979ff",
        unit: "单",
        // #ifdef H5
        span: 6,
        // #endif
      },
      {
        label: "待生产单数",
        key: "pendingProduceCount",
        color: "#2979ff",
        unit: "单",
        // #ifdef H5
        span: 6,
        // #endif
      },
      {
        label: "商品存量",
        key: "productStock",
        color: "#2979ff",
        // #ifdef H5
        span: 6,
        // #endif
      },
      {
        label: "产品库存预警",
        key: "productStockWarning",
        color: "#e43d33",
        unit: "",
        func: "onJumpWarning",
        // #ifdef H5
        span: 6,
        // #endif
      },
    ],
    loading: false,
    data: {
      "productStock": 0,
      "productStockWarning": 0,
      "pendingProduceCount": 0,
      "producedProduceCount": 0,
      "warningTrend": [],
      "halfYearProduce": [],
    },

    halfYearProduce: {},
    warningTrend: {},
  }),
  methods: {
    getList() {
      this.loading = true;
      getProduceStatisticsApi()
        .then(res => {
          const data = res.data;
          this.data = data;
          this.halfYearProduce = {};
          this.warningTrend = {};

          const obj = {
            categories: (data.halfYearProduce || []).map(v => v.name),
            series: [],
          };

          const list = _flattenDeep((data.halfYearProduce || [])?.map(v => v?.amountsWithName));
          const group = _groupBy(list, (v) => v.name);
          _keys(group).forEach(key => {
            obj.series.push({
              name: key,
              data: _flattenDeep((data.halfYearProduce || [])
                .map(v => {
                  const list = v.amountsWithName || [];
                  return list.find(j => j.name === key)?.amount || 0;
                })),
            });
          });

          if (obj.series.length === 0) {
            obj.series.push({name: "", data: []});
          }

          this.halfYearProduce = obj;

          const obj1 = {
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


          (data.warningTrend || [])?.forEach(item => {
            obj1.categories.push(item.name);
            obj1.series[0].data.push(_get(item, "amounts.0") || 0);
            obj1.series[1].data.push(_get(item, "amounts.1") || 0);
          });

          this.warningTrend = obj1;

          // this.supplierRank = this.getEcData(data.supplierRank);

        })
        .finally(() => {
          this.loading = false;
        });
    },

    getServerData() {
      //模拟从服务器获取数据时的延时
      setTimeout(() => {
        let res = {
          categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
          series: [
            {
              name: "成交量A",
              data: [{value: 35, color: "#000"}, 8, 25, 37, 4, 20],
            },
          ],
        };
        this.chartData = JSON.parse(JSON.stringify(res));
      }, 500);
    },

    // 跳转到库存预警页面
    onJumpWarning() {
      uni.navigateTo({
        url: "/erp/stock/warning",
      });
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
        ...this.getBasicChartsOptions(this.warningTrend),
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

      <UniSection title="近半年生产情况" type="line">
        <QiunDataCharts
          type="line"
          :opts="getBasicChartsOptions(halfYearProduce)"
          :chart-data="halfYearProduce"
        />
      </UniSection>

      <UniSection title="库存预警趋势" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions"
          :chart-data="warningTrend"
        />
      </UniSection>

    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-view-version {
  //padding: 10px;
  margin-top: 10px;

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
