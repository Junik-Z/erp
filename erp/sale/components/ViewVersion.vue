<script>
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import { getStatisticsApi } from "@/api/erp/sale";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _get } from "@/utils";

export default {
  name: "ViewVersion",
  components: {UniCol, UniRow, UvCountTo, QiunDataCharts},
  mixins: [mixins],
  data() {
    return {
      chartData: {},
      //您可以通过修改 config-ucharts.js 文件中下标为 ['column'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
      opts: {
        color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
        padding: [15, 10, 0, 15],
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow",
          },
        },
      },

      loading: false,
      data: {
        "supplierCount": 0,
        "totalSignCount": 0,
        "totalSignAmount": 0,
        "productStockWarning": 0,
        "marginRate": 0,
        "supplierRank": [],
        "productPurchaseRank": [],
      },

      CountList: [
        {
          label: "销售总额",
          key: "totalSignAmount",
          color: "#2979ff",
          unit: "元",
          span: 24,
        },
        {
          label: "供应商总数",
          key: "supplierCount",
          color: "#2979ff",
          unit: "个",
        },
        {
          label: "总签单数",
          key: "totalSignCount",
          color: "#2979ff",
          unit: "单",
        },
        {
          label: "产品毛利率",
          key: "marginRate",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "产品库存预警",
          key: "productStockWarning",
          color: "#e43d33",
          unit: "",
        },
      ],
    };
  },
  mounted() {
    this.getServerData();
  },
  methods: {
    getList() {
      this.loading = true;
      getStatisticsApi()
        .then(res => {
          const data = res.data;
          this.data = data;

          // 供应商排名
          console.log("供应商排名", data.supplierRank);
          // 产品排名
          console.log("产品排名", data.productPurchaseRank);

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
              data: [35, 8, 25, 37, 4, 20],
            },
            {
              name: "成交量B",
              data: [70, 40, 65, 100, 44, 68],
            },
            {
              name: "成交量C",
              data: [100, 80, 95, 150, 112, 132],
            },
          ],
        };
        this.chartData = JSON.parse(JSON.stringify(res));
      }, 500);
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
      <QiunDataCharts
        type="line"
        :opts="opts"
        :chartData="chartData"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-view-version {
  margin-top: 10px;

  &__row {
    margin-top: 16px;
  }
}
</style>
