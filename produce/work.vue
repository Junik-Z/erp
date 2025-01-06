<script>
import UniDatetimePicker from "./components/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { _deepCopy, showToast } from "@/utils";
import { addedProduceApi, getProduceDetailApi, updateProduceApi } from "@/api/erp/produce";
import PickerProduct from "./components/PickerProduct/PickerProduct.vue";
import mixins from "@/mixins/mixins";
import dayjs from "@/utils/dayjs";
import UvSteps from "./components/uv-steps/components/uv-steps/uv-steps.vue";
import UvStepsItem from "./components/uv-steps/components/uv-steps-item/uv-steps-item.vue";
import GridTable from "./components/GridTable/GridTable.vue";
import UniEcCanvas from "./components/uni-ec-canvas/uni-ec-canvas.vue";
import * as echarts from "./components/uni-ec-canvas/echarts-tree-v5.1.2.min";

let chart = null;

export default {
  name: "client",
  components: {
    UvStepsItem,
    UvSteps,
    PickerProduct,
    UniEasyinput,
    UniSection,
    UniForms,
    UniFormsItem,
    UniDatetimePicker,
    GridTable,
    UniEcCanvas,
  },
  mixins: [mixins],
  data() {
    const data = {
      name: "flare",
      children: [
        {
          name: "data",
          children: [
            {
              name: "converters",
              children: [
                {name: "Converters", value: 721},
                {name: "DelimitedTextConverter", value: 4294},
              ],
            },
            {
              name: "DataUtil",
              value: 3322,
            },
          ],
        },
        {
          name: "display",
          children: [
            {name: "DirtySprite", value: 8833},
            {name: "LineSprite", value: 1732},
            {name: "RectSprite", value: 3623},
          ],
        },
        {
          name: "flex",
          children: [{name: "FlareVis", value: 4116}],
        },
        {
          name: "query",
          children: [
            {name: "AggregateExpression", value: 1616},
            {name: "And", value: 1027},
            {name: "Arithmetic", value: 3891},
            {name: "Average", value: 891},
            {name: "BinaryExpression", value: 2893},
            {name: "Comparison", value: 5103},
            {name: "CompositeExpression", value: 3677},
            {name: "Count", value: 781},
            {name: "DateUtil", value: 4141},
            {name: "Distinct", value: 933},
            {name: "Expression", value: 5130},
            {name: "ExpressionIterator", value: 3617},
            {name: "Fn", value: 3240},
            {name: "If", value: 2732},
            {name: "IsA", value: 2039},
            {name: "Literal", value: 1214},
            {name: "Match", value: 3748},
            {name: "Maximum", value: 843},
            {
              name: "methods",
              children: [
                {name: "add", value: 593},
                {name: "and", value: 330},
                {name: "average", value: 287},
                {name: "count", value: 277},
                {name: "distinct", value: 292},
                {name: "div", value: 595},
                {name: "eq", value: 594},
                {name: "fn", value: 460},
                {name: "gt", value: 603},
                {name: "gte", value: 625},
                {name: "iff", value: 748},
                {name: "isa", value: 461},
                {name: "lt", value: 597},
                {name: "lte", value: 619},
                {name: "max", value: 283},
                {name: "min", value: 283},
                {name: "mod", value: 591},
                {name: "mul", value: 603},
                {name: "neq", value: 599},
                {name: "not", value: 386},
                {name: "or", value: 323},
                {name: "orderby", value: 307},
                {name: "range", value: 772},
                {name: "select", value: 296},
                {name: "stddev", value: 363},
                {name: "sub", value: 600},
                {name: "sum", value: 280},
                {name: "update", value: 307},
                {name: "variance", value: 335},
                {name: "where", value: 299},
                {name: "xor", value: 354},
                {name: "x_x", value: 264},
              ],
            },
            {name: "Minimum", value: 843},
            {name: "Not", value: 1554},
            {name: "Or", value: 970},
            {name: "Query", value: 13896},
            {name: "Range", value: 1594},
            {name: "StringUtil", value: 4130},
            {name: "Sum", value: 791},
            {name: "Variable", value: 1124},
            {name: "Variance", value: 1876},
            {name: "Xor", value: 1101},
          ],
        },
        {
          name: "scale",
          children: [
            {name: "IScaleMap", value: 2105},
            {name: "LinearScale", value: 1316},
            {name: "LogScale", value: 3151},
            {name: "OrdinalScale", value: 3770},
            {name: "QuantileScale", value: 2435},
            {name: "QuantitativeScale", value: 4839},
            {name: "RootScale", value: 1756},
            {name: "Scale", value: 4268},
            {name: "ScaleType", value: 1821},
            {name: "TimeScale", value: 5833},
          ],
        },
      ],
    };

    return {
      form: {
        "planFinishDate": "",
        "totalRawMaterialAmount": 0,
        "totalProductAmount": 0,
        "totalAmount": 0,
        "remark": "",
        "materialDetails": [],
        "productDetails": [],
      },
      rules: {
        planFinishDate: {
          rules: [
            {
              required: true,
              errorMessage: "请选择计划完成时间",
            },
          ],
        },
        materialDetails: {
          rules: [
            {
              required: true,
              errorMessage: "请选择生产所需物料",
            },
          ],
        },
        productDetails: {
          rules: [
            {
              required: true,
              errorMessage: "请选择生产产品",
            },
          ],
        },
      },
      loading: false,
      option: {},

      current: 0,

      tableData: {
        thead: [
          {
            name: "序号",
          },
          {
            name: "姓名",
          },
          {
            name: "年龄",
          },
          {
            name: "专业",
          },
        ],
        tbody: [
          {value: "1", color: "red", bgColor: "#ace", align: "left"},
          {value: "张牧之"},
          {value: "25"},
          {value: ""},
          {value: "2"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "打篮球,三分贼强~", gridArea: "2/4/4/4"},
          {value: "3"},
          {value: "张牧之"},
          {value: "25"},
          {value: ""},
          {value: "4"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "踢足球，倒挂金钩！", gridArea: "4/4/6/4", isFlex: true},

          {value: "4"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "踢足球，倒挂金钩！", gridArea: "4/4/6/4", isFlex: true},

          {value: "4"},
          {value: "赵坤明"},
          {value: "33"},
          {value: "踢足球，倒挂金钩！", gridArea: "4/4/6/4", isFlex: true},
        ],
      },

      ec: {
        lazyLoad: true,
      },

      options: {
        series: [
          {
            type: "tree",
            id: 0,
            name: "tree1",
            data: [data],
            top: "10%",
            left: "10%",
            bottom: "10%",
            right: "10%",
            symbolSize: 7,
            edgeShape: "polyline",
            edgeForkPosition: "63%",
            initialTreeDepth: 3,
            orient: "vertical",
            lineStyle: {
              width: 2,
            },
            // 设置允许拖动放大缩小
            roam: true,
            /* label: {
              backgroundColor: "#fff",
              position: "left",
              verticalAlign: "middle",
              align: "right",
            }, */
            label: {
              position: "top",
              rotate: -90,
              verticalAlign: "middle",
              align: "right",
              fontSize: 9,
            },
            // 缩放比例
            zoom: 1.3,
            leaves: {
              label: {
                position: "right",
                verticalAlign: "middle",
                align: "left",
              },
            },
            emphasis: {
              focus: "descendant",
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      },

    };
  },
  onLoad(option) {
    this.option = option;
    this.isEdit = !!option.id;

    if (this.isEdit) this.getInfo();

    this.$nextTick(() => {
      this.$refs.canvas.init(this.initChart);
    });

  },
  methods: {
    getInfo() {
      getProduceDetailApi({id: this.option.id})
        .then(res => {
          const params = res.data;
          this.form = params;
          console.log(params);
        });
    },
    onSubmit() {
      this.$refs.FormRef.validate((valid) => {
        if (!valid) {
          const Func = this.isEdit ? updateProduceApi : addedProduceApi;
          const params = _deepCopy(this.form);

          params.totalAmount = this.getTotalAmount;
          params.planFinishDate = dayjs(params.planFinishDate).format("YYYY-MM-DD 23:59:59");

          this.loading = true;
          Func(params)
            .then(() => {
              showToast({
                title: `${this.isEdit ? "编辑" : "新增"}成功`,
                success() {
                  uni.navigateBack({});
                },
              });
            })
            .finally(() => {
              this.loading = false;
            })
          ;
        }
      });
    },
    initChart(canvas, width, height, canvasDpr) {
      console.log(canvas, width, height, canvasDpr);
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: canvasDpr,
      });
      canvas.setChart(chart);

      chart.setOption(this.options);

      // 添加节点的点击事件
      chart.on("click", (e) => {
        console.log(e);
      });
      return chart;
    },
  },
  computed: {
    getStartDate() {
      return +new Date();
    },
    getTotalAmount() {
      return (this.form.totalProductAmount || 0) - (this.form.totalRawMaterialAmount || 0);
    },
  },
};
</script>

<template>
  <view class="ko-work ko-basic-added-form">
    <view class="ko-work__steps">
      <UvSteps :current="current">
        <UvStepsItem title="基础信息" />
        <UvStepsItem title="2" error />
        <UvStepsItem title="3" />
      </UvSteps>
    </view>

    <UniForms
      :model="form"
      label-width="120px"
      label-align="right"
      ref="FormRef"
      :rules="rules"
    >
      <block v-if="current === 0">
        <view style="padding: 10px;">
          <UniFormsItem v-if="form.orderCode" label="订单编号：" name="orderCode">
            <UniEasyinput disabled :value="form.orderCode" placeholder="请输入" />
          </UniFormsItem>
          <UniFormsItem label="计划完成时间：" name="planFinishDate" required>
            <UniDatetimePicker
              v-model="form.planFinishDate"
              placeholder="请选择"
              type="date"
              :start="getStartDate"
            />
          </UniFormsItem>

          <UniFormsItem label="定制生产：" name="planFinishDate">
            <radio color="#256eff" />
          </UniFormsItem>
        </view>
      </block>

      <block v-else>
        <UniSection title="所需物料" type="line">
          <view style="padding: 10px;">
            <UniFormsItem label-width="0" name="materialDetails">
              <view style="width: 100%;">
                <PickerProduct
                  v-model="form.materialDetails"
                  :total.sync="form.totalRawMaterialAmount"
                  type="purchase"
                  hide-prices
                />
              </view>
            </UniFormsItem>
          </view>
        </UniSection>

        <UniSection title="生产产品" type="line">
          <view style="padding: 10px;">
            <UniFormsItem label-width="0" name="productDetails">
              <view style="width: 100%;">
                <PickerProduct
                  v-model="form.productDetails"
                  :total.sync="form.totalProductAmount"
                  hide-prices
                />
              </view>
            </UniFormsItem>
          </view>
        </UniSection>

        <UniSection title="预计创造价值" type="line" v-if="false">
          <view style="padding: 10px;">
            <UniFormsItem label-width="30px" name="materialDetails">
              <view>
                <view class="ko-basic-money"> {{ toYuan(getTotalAmount) }}元</view>
                <view style="margin-top: 10px;" class="ko-basic-money">{{ toBigMoney(toYuan(getTotalAmount)) }}</view>
              </view>
            </UniFormsItem>
          </view>
        </UniSection>

        <UniSection title="其它信息" type="line">
          <view style="padding: 10px;">
            <UniFormsItem label="备注：" name="remark">
              <UniEasyinput v-model="form.remark" type="textarea" placeholder="备注(选填)" />
            </UniFormsItem>
          </view>
        </UniSection>
      </block>

      <GridTable :table-data="tableData" align="center" />
    </UniForms>

    <view style="width: 100vw; height: 40vh; position: relative; z-index: 1">
      <UniEcCanvas
        ref="canvas"
        :ec="ec"
        id="uni-ec-canvas"
        canvas-id="uni-ec-canvas"
      />
    </view>

    <button
      class="ko-basic-button"
      style="margin: 0 40px 10px;"
      :loading="loading"
      :disabled="loading"
      @click="onSubmit"
    >
      保存
    </button>

  </view>
</template>

<style scoped lang="scss">
.ko-work {
  padding-bottom: env(safe-area-inset-bottom);

  /* #ifdef H5 */
  .ko-basic-button {
    margin: 0 auto !important;
  }

  /* #endif */

  &__steps {
    padding: 10px;
  }
}

/deep/ .uni-ec-canvas {
  width: 100%;
  height: 500rpx;
  display: block;
  margin-top: 30rpx;
}

</style>
