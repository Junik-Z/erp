<script>
import UniEcCanvas from "./uni-ec-canvas/uni-ec-canvas.vue";
import * as echarts from "./uni-ec-canvas/echarts";
import { _deepCopy } from "@/utils";

export default {
  name: "TrendChart",
  data() {
    return {
      options: {
        grid: {
          top: "7%",
          right: "4%",
          left: "4%",
          bottom: "10%",
        },
        xAxis: [
          {
            type: "category",
            color: "#59588D",
            data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            axisPointer: {
              type: "line",
            },
            axisLine: {
              lineStyle: {
                color: "#272456",
              },
            },
            axisLabel: {
              color: "#59588D",
              textStyle: {
                fontSize: 10,
              },
            },
          },
        ],
        yAxis: [
          {
            axisLabel: {
              show: false,
              formatter: "{value}%",
              color: "#59588D",
            },
            axisLine: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: "#272456",
              },
            },
          },
        ],
        series: [
          {
            type: "bar",
            data: [100, 90, 10, 90, 90, 20, 56, 89, 20, 56, 89, 89],
            barWidth: "14px",
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#41E1D4", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#10A7DB", // 100% 处的颜色
                  },
                ], false),
                barBorderRadius: [30, 30, 0, 0],
                shadowColor: "rgba(0,255,225,1)",
                shadowBlur: 1,
              },
            },
            label: {
              normal: {
                show: true,
                lineHeight: 30,
                position: ["-8", "-20"],
                distance: 1,
                formatter: ["{a|{c}%}"].join(""),
                rich: {
                  a: {
                    color: "#333",
                    align: "center",
                  },
                },
              },
            },
          },
        ],
      },
    };
  },
  components: {
    UniEcCanvas,
  },
  methods: {
    initChart(canvas, width, height, canvasDpr) {
      this.chart = echarts.init(
        canvas,
        null,
        {
          width: width,
          height: height,
          devicePixelRatio: canvasDpr,
        },
      );

      // #ifndef H5
      canvas.setChart(this.chart);
      // #endif

      this.chart.setOption(this.options);
      // 添加节点的点击事件
      this.chart.on("click", this.onClickTreeNode);
      return this.chart;
    },

    // 设置图表内容
    setCanvasNode(flag = false) {
      const opt = _deepCopy(this.options);

      // _set(opt, "series.0.data", []);

      try {
        this.chart.setOption(opt);
      } catch (e) {
        setTimeout(() => {
          this.setCanvasNode(flag);
        }, 600);
      }
    },

    // 点击事件
    onClickTreeNode() {
    },
  },
  mounted() {
    setTimeout(() => {
      this.$nextTick(() => {
        this.$refs.canvas.init(this.initChart);
        this.$nextTick(() => {
          this.setCanvasNode(true);
        });
      });
    }, 30);
  },
};
</script>

<template>
  <UniEcCanvas
    ref="canvas"
    :ec="{lazyLoad: true}"
    id="uni-ec-canvas"
    canvas-id="uni-ec-canvas"
    class="uni-ec-canvas"
  />
</template>

<style scoped lang="scss">

</style>
