<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import QiunDataCharts from "@/erp/components/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UvCountTo from "../../components/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _deepCopy, _get, _maxBy, _round } from "@/utils";
import { getCountSupplierApi } from "@/api/erp/purchase";
import mixins from "@/mixins/mixins";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import { PageEnums } from "@/utils/config";

export default {
  name: "ViewVersion",
  mixins: [mixins],
  components: {UniSection, UniCol, UvCountTo, UniRow, QiunDataCharts, UniGrid},
  data: () => ({
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

    supplierRank: {},
    productPurchaseRank: {},

    CountList: [
      {
        label: "签单总金额",
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
    productPurchaseRankLoading: false,
  }),
  mounted() {
  },
  methods: {
    getList() {
      this.loading = true;
      getCountSupplierApi()
        .then(res => {
          const data = res.data;
          this.data = data;

          // 产品排名
          console.log("产品排名", data.productPurchaseRank);

          const obj = {
            categories: [],
            series: [],
          };

          const maxAmounts = _maxBy((data.productPurchaseRank || []), (v) => v?.amounts?.length)?.amounts || [];

          obj.series = maxAmounts?.map((v, i) => ({
            name: ["成交价", "上次成交价"][i],
            data: [],
          }))

          ;(data.productPurchaseRank || []).forEach((item) => {
            obj.categories.push(item.name);
            obj.series = obj.series.map((v, i) => {
              v.data.push(this.toYuan(_get(item, `amounts.${i}`) || 0));
              return v;
            });
          });

          this.productPurchaseRank = _deepCopy(obj);

          // 供应商排名
          // console.log("供应商排名", data.supplierRank);
          this.supplierRank = this.getEcData(data.supplierRank);

          this.$nextTick(() => {
            this.$refs.PPRRef.mixinDatacomLoading = false;
            this.$refs.PPRRef.showchart = true;

            this.$refs.SRRef.mixinDatacomLoading = false;
            this.$refs.SRRef.showchart = true;
          });
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
          obj.categories.push(item.name);
          obj.series[0].data.push(this.toYuan(item.amount || 0));
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
        const v = item.unit === "元" ? this.toYuan(value) : item.unit === "%" ? _round(value, 2) : value;
        return isNaN(v) ? 0 : v;
      };
    },

    getOptions() {
      return (data) => {
        const opt = this.getBasicChartsOptions(data);
        return {
          ...opt,
          height: "300px",
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
      <UniSection title="产品采购排行" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions(productPurchaseRank)"
          :chart-data="productPurchaseRank"
          ref="PPRRef"
        />
      </UniSection>

      <UniSection title="供应商排名" type="line">
        <QiunDataCharts
          type="bar"
          :opts="getOptions(supplierRank)"
          :chart-data="supplierRank"
          ref="SRRef"
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
