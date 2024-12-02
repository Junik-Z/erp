<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import UCountTo from "@/uni_modules/uview-ui/components/u-count-to/u-count-to.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";

export default {
  name: "ViewVersion",
  components: {QiunDataCharts, UCountTo, UniGridItem, UniGrid},
  data: () => ({
    chartData: {},
    //您可以通过修改 config-ucharts.js 文件中下标为 ['column'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
    opts: {
      color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
      padding: [15, 15, 0, 5],
      enableScroll: false,
      legend: {},
      xAxis: {
        disableGrid: true,
      },
      yAxis: {
        data: [
          {
            min: 0,
          },
        ],
      },
      extra: {
        column: {
          type: "group",
          width: 30,
          activeBgColor: "#000000",
          activeBgOpacity: 0.08,
        },
      },
    },
  }),
  mounted() {
    this.getServerData();
  },
  methods: {
    getServerData() {
      //模拟从服务器获取数据时的延时
      setTimeout(() => {
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
          categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
          series: [
            {
              name: "目标值",
              data: [35, 36, 31, 33, 13, 34],
            },
            {
              name: "完成量",
              data: [18, 27, 21, 24, 6, 28],
            },
          ],
        };
        this.chartData = JSON.parse(JSON.stringify(res));

        console.log(this.chartData);
      }, 500);
    },

  },
};
</script>

<template>
  <view class="ko-view-version">
    <UniGrid :column="2" :square="false" :show-border="false">
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>计划出库</view>
          <view>
            <UCountTo :start-val="30" :end-val="500" color="#2979ff" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>库存预警</view>
          <view>
            <UCountTo :start-val="30" :end-val="500" color="#e43d33" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
    </UniGrid>

    <view class="ko-view-version__row">
      <QiunDataCharts
        type="column"
        :opts="opts"
        :chartData="chartData"
      />
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
