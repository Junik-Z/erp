<script>
// #ifdef H5
import * as H5 from "@/finance/components/uni-ec-canvas/echarts.min";
// #endif
// #ifdef MP
import * as MP from "../components/uni-ec-canvas/echarts.min";
// #endif
import UniEcCanvas from "../components/uni-ec-canvas/uni-ec-canvas.vue";
import {
  _deepCopy,
  _generateUUID,
  _get,
  _isEmpty,
  _isEqual,
  _isNotUnNil,
  _keys,
  _omit,
  _set,
  CustomToast,
  getRect,
} from "@/utils";
import KoMovable from "@/components/Movable/index.vue";
import FilePicker from "@/components/FilePicker/FilePicker.vue";
import PickerSheet from "../components/PickerSheet.vue";
import { PRICING_METHOD } from "@/utils/config";
import mixins from "@/mixins/mixins";

let echarts;

// #ifdef H5
echarts = H5;

// #endif

// #ifdef MP
echarts = MP;

// #endif

function buildTree(data, parentId = null, parentKey = "parentId", idKey = "processId") {
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

const systemInfo = uni.getSystemInfoSync();
let screenHeight = systemInfo.screenHeight - 100;

// #ifdef H5
screenHeight = systemInfo.screenHeight - 400;
// #endif

export default {
  name: "CraftProcesses",
  components: {
    PickerSheet,
    KoMovable,
    UniEcCanvas,
    FilePicker,
  },
  mixins: [mixins],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    readonly: Boolean,
  },
  watch: {
    value: {
      handler() {
        if (this.value) {
          this.tree = _deepCopy(this.value);

          setTimeout(() => {
            this.setCanvasNode(true);
          }, 600);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    const _this = this;
    return {
      ec: {
        lazyLoad: true,
      },
      options: {
        series: [
          {
            type: "tree",
            data: [
              /*  {
                 description: "",
                 images: "/files/down/png20250115/248644303b2f45f79215adf7e87bcde9.png",
                 name: "你叫什么",
                 orderId: "",
                 parentId: null,
                 price: "30",
                 pricingMethod: "pieceWork",
                 sequence: 0,
                 staffList: ["d4b93e28e66a437a8aaa50c9538f5b4b", "3d11855547d74270b82d1cd360b6b123"],
                 processId: "65c618df-5acd-4b00-8dd9-dd403a826032",
               }, */
              /* {name: "测试", children: []} */
            ],
            left: "8%",
            right: "10%",
            top: "10%",
            bottom: "18%",
            symbol: (value, {data}) => {
              if (data.images) {
                return "image://" + this.getImageUrl(data.images);
              } else {
                return "circle";
              }
            },
            symbolSize: 30,
            symbolClip: true,
            orient: "vertical",
            expandAndCollapse: false,
            /* itemStyle: {
              color: 'rgba(0, 0, 0, .03)'
            }, */
            label: {
              position: "top",
              verticalAlign: "top",
              fontSize: 12,
              borderWidth: 0,
              borderColor: "#333",
              shadowBlur: 0,
              textBorderWidth: 0,
              offset: [0, -10],
              color: "#333",
              backgroundColor: "rgba(0, 0, 0, .1)",
              padding: [50, 10, 10, 10],
              borderRadius: 6,
              formatter: function (res) {
                const data = res?.data || {};

                let arr = [`{a|${data.name}}`];

                if (!_isEmpty(data.staffs)) {
                  arr.push(`{b|员工：${data.staffs?.map(item => item.name)?.join("、")}}`);
                }

                arr.push(`{c|${PRICING_METHOD[data.pricingMethod]}：}{d|${["commission", "priceCommission"].includes(data.pricingMethod) ? `${data.price / 10000}%` : (_this.toYuan(data.price) + "元")}}`);

                return arr.join("\n");
              },
              rich: {
                a: {
                  fontsize: 14,
                  color: "#000",
                  padding: [4, 0],
                  align: "center",
                },
                b: {
                  fontsize: 12,
                  color: "#8f939c",
                  padding: [2, 0],
                  align: "center",
                },
                c: {
                  fontsize: 12,
                  color: "#8f939c",
                  align: "center",
                },
                d: {
                  fontsize: 12,
                  color: "#e43d33",
                  align: "center",
                },
              },
            },
            // 设置允许拖动放大缩小
            roam: true,
            leaves: {
              label: {
                position: "top",
                verticalAlign: "top",
                align: "center",
                borderWidth: 0,
                shadowBlur: 0,
                textBorderWidth: 0,
              },
            },
            // animationDurationUpdate: 300,
          },
        ],
      },
      wrapHeight: screenHeight,
      tree: [],

      form: {
        "name": "",
        "description": "",
        "images": "", //"/files/down/png20250115/248644303b2f45f79215adf7e87bcde9.png",
        "pricingMethod": "none",
        "price": null,
        "staffList": [],
        "staffs": [],
      },
      visible: false,
      pLoading: false,
      pType: "",

      node: null,
    };
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

    // #ifdef MP
    setTimeout(() => {
      getRect(".ko-craft", this)
        .then(res => {
          this.wrapHeight = res?.height || screenHeight;
        });
    }, 80);
    // #endif
  },
  methods: {
    initChart(canvas, width, height, canvasDpr) {
      this.chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: canvasDpr,
      });

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
      const list = buildTree(_deepCopy(this.tree).map(v => ({...v, parentId: v.parentId || null})));

      _set(opt, "series.0.data", list);

      try {
        this.chart.setOption(opt);
      } catch (e) {
        setTimeout(() => {
          this.setCanvasNode(flag);
        }, 600);
      }

      let sequence = 0;

      function bfsSort(root) {
        const result = [];
        const queue = _deepCopy(root);
        while (queue.length > 0) {
          const node = queue.shift();
          sequence += 1;
          result.push({
            ..._omit(_deepCopy(node), ["children"]),
            sequence,
          });
          if (node.children) {
            queue.push(...node.children); // 子节点入队
          }
        }
        return result;
      }

      !flag && this.$emit("input", bfsSort(list));
    },

    // 点击
    onClickTreeNode(event) {
      if (this.readonly) return;

      this.node = event.data;
      this.$refs.UASRef.open();
    },

    // 添加根节点
    onAdderRoot(type) {
      if (this.readonly) return;

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
      this.$refs.FormRef.validate((valid) => {
        const params = _deepCopy(this.form);

        if (this.isPriceRules) {
          this.pLoading = false;
          uni.showToast({
            title: `请输入${PRICING_METHOD[this.form.pricingMethod]}`,
            icon: "none",
          });
          return false;
        }

        if (["commission", "priceCommission"].includes(params.pricingMethod) && !(params.price > 0 || params.price < 99)) {
          this.pLoading = false;
          uni.showToast({
            title: `总单价提成不能小于0%、大于99%`,
            icon: "none",
          });
          return false;
        }


        if (!valid) {
          this.pLoading = true;

          params.price = ["commission", "priceCommission"].includes(params.pricingMethod) ? (params.price || 0) * 10000 : _isNotUnNil(params.price) ? this.toFen(params.price) : null;

          if (_isEqual(this.pType, "root")) {
            this.tree.push({...params, processId: _generateUUID(), parentId: null});

            this.setCanvasNode();
            this.visible = false;
          }

          if (_isEqual(this.pType, "addedChild")) {
            const obj = {
              ...params,
              children: [],
              processId: _generateUUID(),
              parentId: this.node.processId,
            };
            this.tree.push(obj);

            this.setCanvasNode();
            this.visible = false;
          }

          if (_isEqual(this.pType, "editor")) {
            const node = _deepCopy(this.node);
            const obj = {...node, ...params};
            const index = this.tree.findIndex(v => _isEqual(v.processId, node.processId));
            this.$set(this.tree, index, obj);

            this.setCanvasNode();
            this.visible = false;
          }


          setTimeout(() => {
            this.$nextTick(() => {
              this.pLoading = false;
            });
          }, 500);
        } else {
          this.pLoading = false;
          uni.showToast({
            title: _get(valid, "0.errorMessage") || "请检查表单项是否正确",
            icon: "none",
          });
        }
      });
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
      const node = _deepCopy(this.node);

      node.price = ["commission", "priceCommission"].includes(node.pricingMethod) ? node.price / 10000 : _isNotUnNil(node.price) ? this.toYuan(node.price) : null;

      node.placeholderLabel = (node.staffs || []).map(v => v.name).join("、");
      this.form = node;

      // #ifdef MP
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
      });
      // #endif
    },
    // 删除节点
    onRemove() {
      const node = _deepCopy(this.node);
      if (!this.tree.some(v => _isEqual(v.parentId, node.processId))) {
        const index = this.tree.findIndex(v => _isEqual(v.processId, node.processId));
        this.tree.splice(index, 1);

        this.setCanvasNode();
      } else {
        CustomToast({
          title: "该节点存在子级，不可删除。",
          icon: "none",
        });
      }
    },

    // 选中菜单
    onSMovable({item}) {
      const {func, arg} = item;
      this[func]?.(...arg);
    },

    // 打开选择快捷生产
    onSelectCraft(type) {
      this.$emit("select", type);
    },

    // 选中的员工
    onCheckNode(list) {
      this.form.staffs = _deepCopy(list);
    },

    // 清除说有节点
    onClearCraft() {
      uni.showModal({
        title: "温馨提示",
        content: "您确定要清除所有的节点吗？",
        success: (res) => {
          if (res.confirm) {
            this.tree = [];
            this.setCanvasNode(false);
          }
        },
      });
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
    // 获取价格校验
    isPriceRules() {
      return this.form.pricingMethod && this.form.pricingMethod !== "none" && !this.form.price;
    },

    // 更多按钮
    getMContent() {
      return [
        {
          text: "新增",
          iconfont: "icon-tianjia",
          func: "onAdderRoot",
          arg: ["root"],
        },
        {
          text: "快捷",
          iconfont: "icon-zt-01-02",
          func: "onSelectCraft",
          arg: ["craft"],
          perm: "QUICK_CRAFT_LIST",
        },
      ].filter(item => {
        const isPerm = item.perm ? this.isPerm(item.perm) : true;

        if (item.func === "onAdderRoot") return !this.tree.length;

        return isPerm;
      });
    },

    // 价格描述
    getPriceLabel() {
      return {commission: "提成比例", priceCommission: "提成比例"}?.[this.form.pricingMethod] || "价格";
    },
  },
};
</script>

<template>
  <view class="ko-craft" :style="[{'--wrap-height': (wrapHeight - 140) + 'px'}]">
    <button @click.stop="onClearCraft" class="ko-basic-button__card ko-craft__button" v-if="!readonly && tree.length">
      清除所有节点
    </button>

    <UniEcCanvas
      ref="canvas"
      :ec="ec"
      id="uni-ec-canvas"
      canvas-id="uni-ec-canvas"
      class="uni-ec-canvas"
    />

    <KoMovable
      v-if="!tree.length && !readonly && getMContent.length"
      :content="getMContent"
      :y-axis="-60"
      @click="onSMovable"
    />

    <BasicPopup :visible.sync="visible" :title="getPopupTitle">
      <view class="ko-craft__popup">
        <uni-forms label-width="100px" label-align="right" ref="FormRef" :model="form">
          <uni-forms-item
            label="名称"
            name="name"
            :rules="[{required: true, errorMessage: '请输入名称'}]"
            required
          >
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
              @change="form.price = 0"
            />
          </uni-forms-item>
          <uni-forms-item
            :label="getPriceLabel"
            name="price"
            :required="form.pricingMethod && form.pricingMethod !== 'none'"
          >
            <uni-easyinput type="digit" v-model="form.price" placeholder="请输入" />
          </uni-forms-item>
          <uni-forms-item
            label="员工"
            name="staffList"
            v-if="visible"
          >
            <view style="width: 100%;">
              <PickerUser
                style="width: 100%;"
                is-input
                title="选择员工"
                v-model="form.staffList"
                type="staff"
                multiple
                is-confirm
                ref="UserRef"
                @check-node="onCheckNode"

                :placeholder-label="form.placeholderLabel"
              />
              <view v-if="!isPerm('STAFF_LIST')" style="font-size: 10px;color: #e43d33; margin-top: 5px;">
                您没有获取员工信息权限，请联系管理员授权。
              </view>
            </view>
          </uni-forms-item>
          <uni-forms-item label="描述" name="description">
            <uni-easyinput type="textarea" v-model="form.description" placeholder="请输入" />
          </uni-forms-item>

          <uni-forms-item label="订单id" name="orderId" v-if="false">
            <uni-easyinput v-model="form.orderId" />
          </uni-forms-item>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-craft__popup--footer">
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
      round="10"
      cancel-text="取消"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-craft {
  height: 100%;
  position: relative;

  &__button {
    position: absolute;
    top: 0;
    right: 10px;
    z-index: 50;
  }

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

      .ko-basic-button__card {
        width: 100px;
      }
    }
  }
}

::v-deep .uni-ec-canvas {
  width: 100%;
  height: var(--wrap-height, 400px);
  display: block;
  position: relative;
  z-index: 9;
}

// #ifdef H5
::v-deep .uv-popup__content.bottom {
  max-width: 1024px;
  margin: 0 auto;
}

// #endif
</style>
