<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import { getCountApi } from "@/api/erp/stock";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _get, _pick } from "@/utils";
import mixins from "@/mixins/mixins";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";

export default {
  name: "ViewVersion",
  components: {UniSection, UniCol, UvCountTo, UniRow, QiunDataCharts, UniGridItem, UniGrid},
  mixins: [mixins],
  data() {
    return {
      loading: false,

      data: {
        "totalStock": 0,
        "totalValue": 0,
        "warningTrend": {},
        "stockRank": {},
      },

      CountList: [
        {
          label: "库存总量",
          key: "totalStock",
          color: "#2979ff",
        },
        {
          label: "库存总价值",
          key: "totalValue",
          color: "#2979ff",
          unit: "元",
        },
      ],
    };
  },
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      getCountApi()
        .then(res => {
          const data = res.data;
          this.data = _pick(data, ["totalStock", "totalValue"]);

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
            warningTrend.categories.push(item.name);
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
  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.data, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },
  },
};
</script>

<template>
  <view class="ko-view-version">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="20">
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

    <view class="ko-view-version__row">
      <UniSection title="库存预警趋势" type="line">
        <QiunDataCharts
          type="column"
          :opts="getBasicChartsOptions(data.warningTrend)"
          :chart-data="data.warningTrend"
        />
      </UniSection>

      <UniSection title="存量类别排名" type="line">
        <QiunDataCharts
          type="column"
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
