<script>
import UniEcCanvas from "../components/uni-ec-canvas/uni-ec-canvas.vue";
import * as echarts from "../components/uni-ec-canvas/echarts-tree-v5.1.2.min";
import { _deepCopy, _generateUUID, _isEqual, _keys, _set, CustomToast, getRect } from "@/utils";
import KoMovable from "@/components/Movable/index.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import PickerSheet from "../components/PickerSheet.vue";
import { PRICING_METHOD } from "@/utils/config";

const data = (() => {

  const d = [{
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
  }];

  const fn = (list) => {
    return list.map(item => {
      if (item.children) item.children = fn(item.children);

      return {
        ...item,
        __id__: _generateUUID(),
      };
    });
  };
  return fn(d);
})();

function buildTree(data, parentId = null, parentKey = "__parent_id__", idKey = "__id__") {
  // 过滤出当前层级的节点
  const tree = data
    .filter(item => item[parentKey] === parentId)
    .map(item => {
      // 递归处理子节点
      const children = buildTree(data, item[idKey], parentKey, idKey);
      if (children.length) {
        item.children = children; // 添加子节点
      }
      return item;
    });

  return tree;
}

export default {
  name: "CraftProcesses",
  components: {
    PickerSheet,
    KoMovable,
    UniEcCanvas,
    FilePicker,
  },
  data() {
    return {
      ec: {
        lazyLoad: true,
      },
      options: {
        series: [
          {
            /*  type: "tree",
             id: 0,
             name: "tree1",
             orient: "TB",

             layout: "orthogonal", // 正交布局
             nodePadding: 50, // 节点之间的内边距
             nodeGap: 100, // 节点之间的间距
             data: [{name: ""}],
             top: "10%",
             left: "10%",
             bottom: "10%",
             right: "10%",
             symbolSize: 7,
             edgeShape: "polyline",
             edgeForkPosition: "50%",
             initialTreeDepth: 3,
             lineStyle: {
               width: 2,
             },
             // 设置允许拖动放大缩小
             roam: true,
             /!* label: {
               backgroundColor: "#fff",
               position: "left",
               verticalAlign: "middle",
               align: "right",
             }, *!/
             /!*  label: {
                position: "top",
                rotate: -90,
                verticalAlign: "middle",
                align: "right",
                fontSize: 9,
              }, *!/
             // 缩放比例
             zoom: 2,
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
             animationDurationUpdate: 750, */
            type: "tree",
            data: [],
            left: "2%",
            right: "2%",
            top: "2%",
            bottom: "2%",
            symbol: "emptyCircle",
            orient: "vertical",
            expandAndCollapse: false,
            label: {
              position: "left",
              verticalAlign: "middle",
              align: "right",
              fontSize: 14,
              borderWidth: 0,
            },
            // 设置允许拖动放大缩小
            roam: true,
            leaves: {
              label: {
                position: "right",
                verticalAlign: "middle",
                align: "left",
                borderWidth: 0,
              },
            },
            animationDurationUpdate: 750,
          },
        ],
      },
      wrapHeight: 0,
      tree: [],

      form: {
        "name": "",
        "description": "",
        "images": "",
        "pricingMethod": "none",
        "price": null,
        // "sequence": 0,
        "orderId": "",
        "staffId": "",
      },
      visible: false,
      pLoading: false,
      pType: "",

      node: null,
    };
  },
  mounted() {
    setTimeout(() => {
      getRect(".ko-craft", this)
        .then(res => {
          this.wrapHeight = res.height;
        })
        .finally(() => {
          this.$nextTick(() => {
            this.$refs.canvas.init(this.initChart);
          });
        });

    }, 80);
  },
  methods: {
    initChart(canvas, width, height, canvasDpr) {
      this.chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: canvasDpr,
      });

      canvas.setChart(this.chart);

      this.chart.setOption(this.options);

      // 添加节点的点击事件
      this.chart.on("click", this.onClickTreeNode);

      return this.chart;
    },

    // 设置图表内容
    setCanvasNode() {
      const opt = _deepCopy(this.options);
      const list = buildTree(_deepCopy(this.tree));
      _set(opt, "series.0.data", list);

      this.chart.setOption(opt);
    },

    // 点击
    onClickTreeNode(event) {
      this.node = event.data;
      this.$refs.UASRef.open();
    },

    // 添加根节点
    onAdderRoot(type) {
      this.pType = type;
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);

      // #ifdef MP
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
      });
      // #endif
    },

    // 点击弹窗按钮
    onClickPopupButton() {
      if (_isEqual(this.pType, "root")) {
        this.tree.push({..._deepCopy(this.form), sequence: 0, __id__: _generateUUID(), __parent_id__: null});

        this.setCanvasNode();
        this.visible = false;
      }

      if (_isEqual(this.pType, "addedChild")) {
        const obj = {..._deepCopy(this.form), children: [], __id__: _generateUUID(), __parent_id__: this.node.__id__};
        this.tree.push(obj);

        this.setCanvasNode();
        this.visible = false;
      }

      if (_isEqual(this.pType, "editor")) {
        const node = _deepCopy(this.node);
        const obj = {...node, ..._deepCopy(this.form)};
        const index = this.tree.findIndex(v => _isEqual(v.__id__, node.__id__));
        this.$set(this.tree, index, obj);

        this.setCanvasNode();
        this.visible = false;
      }
    },

    // 选中
    onSelect(event) {
      this[event.func]?.();
    },

    // 添加子节点
    onAddedChild() {
      this.pType = "addedChild";
      this.visible = true;
      this.form = _deepCopy(this.$options.data().form);

      // #ifdef MP
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
      });
      // #endif
    },
    // 编辑节点
    onEditor() {
      this.pType = "editor";
      this.visible = true;
      this.form = _deepCopy(this.node);

      // #ifdef MP
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
      });
      // #endif
    },
    // 删除节点
    onRemove() {
      const node = _deepCopy(this.node);
      if (!this.tree.some(v => _isEqual(v.__parent_id__, node.__id__))) {
        const index = this.tree.findIndex(v => _isEqual(v.__id__, node.__id__));
        this.tree.splice(index, 1);

        this.setCanvasNode();
      } else {
        CustomToast({
          title: "该节点存在子级，不可删除。",
          icon: "none",
        });
      }
    },
  },
  computed: {
    // 获取弹窗标题
    getPopupTitle() {
      return {root: "添加工艺节点", addedChild: "添加子节点", editor: "编辑"}[this.pType];
    },
    // 获取弹窗底部按钮文本
    getPopupButtonText() {
      return {root: "添加", addedChild: "添加", editor: "确定"}[this.pType];
    },
    // 处理计价方式
    getPricingMethodOption() {
      return _keys(PRICING_METHOD).map(key => {
        return {
          value: key,
          name: PRICING_METHOD[key],
        };
      });
    },
    // 获取节点动作面板
    getNodeSheet() {
      return [
        {
          name: "添加子节点",
          func: "onAddedChild",
        },
        {
          name: "编辑",
          func: "onEditor",
        },
        {
          name: "删除",
          color: "#e43d33",
          func: "onRemove",
        },
      ];
    },
  },
};
</script>

<template>
  <view class="ko-craft" :style="[{'--wrap-height': wrapHeight + 'px'}]">
    <UniEcCanvas
      ref="canvas"
      :ec="ec"
      id="uni-ec-canvas"
      canvas-id="uni-ec-canvas"
      class="uni-ec-canvas"
    />

    <KoMovable v-if="!tree.length" :y-axis="-60" @click="onAdderRoot('root')" />

    <BasicPopup :visible.sync="visible" :title="getPopupTitle">
      <view class="ko-craft__popup">
        <uni-forms label-align="right" ref="FormRef" :model="form">
          <uni-forms-item label="名称" name="name">
            <uni-easyinput v-model="form.name" placeholder="请输入名称" />
          </uni-forms-item>
          <uni-forms-item label="图片" name="images">
            <FilePicker
              v-model="form.images"
              :image-styles="{
                width: '100px',
                height: '100px',
              }"
            />
          </uni-forms-item>
          <uni-forms-item label="计价方式" name="pricingMethod">
            <PickerSheet
              :options="getPricingMethodOption"
              style="width: 100%"
              v-model="form.pricingMethod"
            />
          </uni-forms-item>
          <uni-forms-item label="价格" name="price">
            <uni-easyinput type="digit" v-model="form.price" placeholder="请输入" />
          </uni-forms-item>
          <uni-forms-item label="员工" name="staffId">
            <PickerUser
              style="width: 100%;"
              is-input
              title="选择员工"
              v-model="form.staffId"
              type="staff"
              ref="UserRef"
            />
          </uni-forms-item>
          <uni-forms-item label="订单id" name="orderId" v-if="false">
            <uni-easyinput v-model="form.orderId" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-craft__popup--footer ko-basic-box-shadow__top">
          <button
            class="ko-basic-button__card"
            @click="onClickPopupButton"
            :loading="pLoading"
            :disabled="pLoading"
          >
            {{ getPopupButtonText }}
          </button>
        </view>
      </template>
    </BasicPopup>

    <uv-action-sheet
      ref="UASRef"
      :actions="getNodeSheet"
      @select="onSelect"
      round="19"
      cancel-text="取消"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-craft {
  height: 100%;
  min-height: 80vh;

  &__popup {
    padding: 10px;

    // #ifndef H5
    width: 98vw;
    // #endif

    // #ifdef H5
    width: 600px;
    // #endif

    &--footer {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 10px;

      .ko-basic-button__card {
        width: 100px;
      }
    }
  }
}

/deep/ .uni-ec-canvas {
  width: 100%;
  height: var(--wrap-height, 500px);
  display: block;
  position: relative;
  z-index: 9;
}
</style>
