<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";

export default {
  name: "ViewVersion",
  components: {
    UvCountTo,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
    UniGridItem,
    UniGrid,
  },
  data: () => ({
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
  }),
  mounted() {
    this.getServerData();
  },
  methods: {
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
};
</script>

<template>
  <view class="ko-view-version">
    <UniGrid :column="2" :square="false" :show-border="false">
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>发件数</view>
          <view>
            <UvCountTo :start-val="30" :end-val="500" color="#2979ff" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>收件数</view>
          <view>
            <UvCountTo :start-val="30" :end-val="500" color="#e43d33" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>本月发出件数</view>
          <view>
            <UvCountTo :start-val="30" :end-val="500" color="#2979ff" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
      <UniGridItem>
        <view class="ko-view-version__item">
          <view>待处理件数</view>
          <view>
            <UvCountTo :start-val="30" :end-val="500" color="#2979ff" />
            <text>件</text>
          </view>
        </view>
      </UniGridItem>
    </UniGrid>

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

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }

  .ko-basic-button__card {
    margin: 5px;
  }
}
</style>
