<script>
import QiunDataCharts from "./components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import { getStatisticsApi } from "@/api/erp/sale";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _deepCopy, _get, _round } from "@/utils";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { PageEnums } from "@/utils/config";
import TopMenus from "./components/TopMenus.vue";

export default {
  name: "ViewVersion",
  components: {
    UniSection,
    UniCol,
    UniRow,
    UvCountTo,
    QiunDataCharts,
    TopMenus,
  },
  mixins: [mixins],
  data() {
    return {
      supplierRank: {},
      productPurchaseRank: {},

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
          label: "客户总数",
          key: "supplierCount",
          color: "#2979ff",
          unit: "个",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "总签单数",
          key: "totalSignCount",
          color: "#2979ff",
          unit: "单",
          // #ifdef H5
          span: 6,
          // #endif
        },
        {
          label: "产品毛利率",
          key: "marginRate",
          unit: "%",
          decimals: 2,
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
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      getStatisticsApi()
        .then(res => {
          const data = res.data;
          this.data = data;

          // 产品排名
          // console.log("产品排名", data.productPurchaseRank);
          this.productPurchaseRank = this.getEcData(data.productPurchaseRank);

          // 供应商排名
          // console.log("供应商排名", data.supplierRank);
          this.supplierRank = this.getEcData(data.supplierRank);

        })
        .finally(() => {
          this.loading = false;
        });
    },

    getEcData(data = []) {
      const obj = {
        categories: [],
        series: [
          {
            name: "排名",
            data: [],
          },
        ],
      };
      _deepCopy(data)
        .forEach((item) => {
          const N = (item.name || "");

          let name = N.substring(0, 15) || "";

          if (N.length > name.length) {
            name = `${name}...`;
          }

          obj.categories.push(name);

          obj.series[0].data.push(this.toYuan(item.amount));
        });

      return obj;
    },

    // 跳转到库存预警页面
    onJumpWarning() {
      uni.navigateTo({
        url: PageEnums.stockWarning,
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
        const v = item.unit === "元" ? this.toYuan(value) : item.unit === "%" ? _round((value * 100), 2) : value;
        return isNaN(v) ? 0 : v;
      };
    },

    getOptions() {
      return (data) => {
        const opt = this.getBasicChartsOptions(data);
        return {
          ...opt,
          yAxis: {
            ...opt.yAxis,
            /*  gridType: "dash",
             dashLength: 2,
             showTitle: true,
             data: [
               {
                 position: "left",
                 title: "单位(元)",
               },
             ], */
          },
        };
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
    <TopMenus :path="PageEnums.saleView" />

    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count" @click.stop="onFunc(item)">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info">
              <UvCountTo
                :separator="item.unit === '元' ? ',' : ''"
                :start-val="0"
                :decimals="item.decimals ? !getCountValue(item) ? 0 : item.decimals : 0"
                decimal="."
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
      <UniSection title="产品排行" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions(productPurchaseRank)"
          :chart-data="productPurchaseRank"
          :loading="loading"
        />
      </UniSection>

      <UniSection title="客户排名" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions(supplierRank)"
          :chart-data="supplierRank"
          :loading="loading"
        />
      </UniSection>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-view-version {
  margin-top: 10px;
  padding-bottom: 80px;

  &__row {
    margin-top: 16px;
  }
}
</style>
