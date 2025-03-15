<script>
import UniEcCanvas from "./uni-ec-canvas/uni-ec-canvas.vue";
import * as echarts from "./uni-ec-canvas/echarts";
import { _deepCopy, _get, _isEmpty, _set } from "@/utils";
import mixins from "@/mixins/mixins";

const maxShowLength = 8;

let barWidth = 14;

// #ifdef H5
barWidth = 24;
// #endif

const ChartBasicOptions = {
  legend: {
    right: 2,
    top: 2,
    textStyle: {
      color: "#c7c9ce",
      fontSize: 10,
    },
    itemWidth: 10,
    itemHeight: 6,
  },
  grid: {
    top: "10%",
    right: "4%",
    left: "4%",
    bottom: "10%",
  },
  xAxis: {
    type: "category",
    color: "#59588D",
    data: [],
    axisLine: {
      lineStyle: {
        color: "#8f939c",
      },
    },
    axisTick: {show: false},
    axisLabel: {
      color: "#59588D",
      textStyle: {
        fontSize: 10,
      },
    },
  },
  barGap: 0,
  yAxis: {
    axisTick: {show: false},
    axisLabel: {show: false},
    axisLine: {show: false},
    splitLine: {
      lineStyle: {
        color: "#e9e9eb",
      },
    },
  },
  series: [
    {
      name: "收入",
      type: "bar",
      data: [],
      barWidth,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#9cf4a0", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#388E3C", // 100% 处的颜色
            },
          ], false),
          barBorderRadius: [30, 30, 0, 0],
        },
      },
      label: {
        normal: {
          show: true,
          position: "top",
          distance: 1,
          fontSize: 8,
          formatter: ["{a|{c}}"].join(""),
          rich: {
            a: {
              color: "#388E3C",
              align: "center",
            },
          },
        },
      },
    },
    {
      name: "支出",
      type: "bar",
      data: [],
      barWidth,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "#ec6969", // 0% 处的颜色
            },
            {
              offset: 1,
              color: "#D32F2F", // 100% 处的颜色
            },
          ], false),
          barBorderRadius: [30, 30, 0, 0],
        },
      },
      label: {
        normal: {
          show: true,
          position: "top",
          distance: 1,
          formatter: ["{a|{c}}"].join(""),
          fontSize: 8,
          rich: {
            a: {
              color: "#D32F2F",
              align: "center",
            },
          },
        },
      },
    },
  ],
};

export default {
  name: "TrendChart",
  data() {
    return {
      options: {},
    };
  },
  mixins: [mixins],
  props: {
    trend: {
      type: Object,
      default() {
        return {};
      },
    },
    loading: Boolean,
    isZoom: Boolean,
  },
  watch: {
    trend: {
      handler() {
        this.TVM && clearTimeout(this.TVM);
        this.TVM = setTimeout(() => {
          this.setCanvasNode();
        }, 300);
      },
      deep: true,
      immediate: true,
    },
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

      return this.chart;
    },

    // 设置图表内容
    setCanvasNode() {
      const opt = _deepCopy(ChartBasicOptions);
      const data = _deepCopy(this.trend) || {};

      const xAxis = _get(data, "xaxis") || [];
      const series = _get(data, "series") || [];

      _set(opt, "xAxis.data", xAxis);
      // 获取数据
      series.map((item, index) => {
        const data = item.map(v => this.toYuan(v));
        _set(opt, `series.${index}.data`, data);
      });

      if (_isEmpty(xAxis) && _isEmpty(series)) {
        _set(
          opt,
          "title",
          {
            text: "暂无数据", // 提示信息
            left: "center",
            top: "center",
            textStyle: {
              fontSize: 16,
              fontWeight: "normal",
              color: "#999",
            },
          },
        );
      }


      // #ifdef MP
      const end = maxShowLength / _get(data, "xaxis.length") * 100;
      const isZoom = end > 0 && end < 100 && _get(data, "xaxis.length") > maxShowLength;
      this.$emit("update:is-zoom", isZoom);
      if (isZoom) {
        _set(opt, "dataZoom", [
          {
            type: "inside", // 内置型 dataZoom，支持手势缩放和平移
            zoomLock: false, // 是否锁定选择区域的大小，false 表示可以缩放
            start: 0,
            end,
          },
        ]);
      }
      // #endif

      try {
        this.chart.setOption(opt, true);
      } catch (e) {
        setTimeout(() => {
          this.setCanvasNode();
        }, 600);
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.$nextTick(() => {
        this.$refs.canvas.init(this.initChart);
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
