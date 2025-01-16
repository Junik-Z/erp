<script>
import KoMovable from "@/components/Movable/index.vue";
import {
  _deepCopy,
  _flattenDeep,
  _generateUUID,
  _get,
  _isEmpty,
  _isEqual,
  _round,
  _toFinite,
  CustomToast,
  getRect,
} from "@/utils";
import { getRandomColor, repositionRectangles } from "./calculate";
import GridTable from "../components/GridTable/GridTable.vue";
import { customizedCalculateApi } from "@/api/erp/produce";
import PickerSheet from "@/produce/components/PickerSheet.vue";
import { PLATE_SPECIF_ENUMS } from "@/utils/config";

const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;

export default {
  name: "BinPacking",
  components: {PickerSheet, KoMovable, GridTable},
  data() {
    return {
      pType: "",
      visible: false,
      pLoading: false,

      form: {
        height: null,
        width: null,
      },
      child: {
        width: 400,
        height: 760,
        weight: 9,
      },

      // 容器
      vessel: [
        /*{
           __id__: _generateUUID(),
           fillRate: 0, // 覆盖率
           width: 400,
           height: 400,
           scale: 1,
         },*/
      ],
      // 所有的子元素
      rectangles: [],

      // 表头
      columns: [
        {
          label: "序号",
          type: "index",
          prop: "NO",
        },
        {
          label: "宽",
          prop: "width",
        },
        {
          label: "高",
          prop: "height",
        },
        {
          label: "厚",
          prop: "weight",
        },
        {
          label: "操作",
          type: "more",
          prop: "More",
        },
      ],

      // 临时存储的节点
      node: {},

      initialDistance: 0,
      initialScale: 0,

      winWidth: screenWidth - 20 - 2, // 容器宽度

      // 动作面板的类型
      asType: "",

      formData: {
        drillWidth: 6,
        width: 1220,
        height: 2440,
      },
    };
  },
  watch: {
    bladeWidth: {
      handler() {
        // this.updateView(this.rectangles);
      },
      deep: true,
    },
    value: {
      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            this.getRectByRoot();

            this.takeValue();
          }, 30);
        });
      },
      deep: true,
      immediate: true,
    },
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    isCustomized: Boolean,
  },
  methods: {
    // 打开添加板材弹窗
    onAdded(type) {
      this.pType = type;
      this.visible = true;

      this.form = _deepCopy(this.$options.data().form);

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },
    // 添加板材
    onClickPopupButton() {
      const F = _deepCopy(this.form);
      // 添加板材
      if (_isEqual(this.pType, "vessel")) {
        if (_toFinite(F.width) > 0 && _toFinite(F.height) > 0) {
          this.vessel.push({
            height: _toFinite(F.height),
            width: _toFinite(F.width),
            fillRate: 0,
            rid: _generateUUID(),
          });
          this.visible = false;
        } else {
          CustomToast({
            title: "请检查输入的宽高",
            icon: "none",
          });
        }
      }

      // 设置圆角 或 修改材料信息
      if (_isEqual(this.pType, "angle") || _isEqual(this.pType, "editor")) {
        const index = this.rectangles.findIndex(v => _isEqual(v.rid, F.rid));
        if (index > -1) {
          this.$set(this.rectangles, index, {
            ...F,
            height: _toFinite(F.height),
            width: _toFinite(F.width),
            weight: _toFinite(F.weight),
          });
          this.visible = false;
        } else {
          CustomToast({
            title: "未找到要设置的材料，请重新选择。",
            icon: "none",
          });
        }
      }
    },

    // 添加矩形材料
    onAddedRectangle() {
      const F = _deepCopy(this.child);
      const wrap = _deepCopy(this.formData);
      if (_toFinite(F.width) > 0 && _toFinite(F.height) > 0) {
        if (F.width > wrap.width || F.height > wrap.height) {
          CustomToast({
            title: "添加的板块过大，请修改宽高。",
            icon: "none",
          });
          return false;
        }

        const gColor = () => {
          const color = getRandomColor();
          if (this.rectangles.some(v => _isEqual(v.color, color))) {
            return gColor();
          }
          return color;
        };

        const obj = {
          height: _toFinite(F.height),
          width: _toFinite(F.width),
          weight: _toFinite(F.weight),
          rid: _generateUUID(),
          x: 0,
          y: 0,
          rotation: 0,
          color: gColor(),
          radius: [0, 0, 0, 0],
        };

        this.rectangles.push(obj);

        this.$emit("update:is-customized", true);
        // this.updateView([...this.rectangles, obj]);
      } else {
        CustomToast({
          title: "请检查输入的宽高",
          icon: "none",
        });
      }
    },

    // 更新视图
    updateView(list) {
      const data = list.map(v => ({
        ...v,
        height: v.tHeight + this.bladeWidth,
        width: v.tWidth + this.bladeWidth,
        bladeWidth: this.bladeWidth,
      }));
      const {vessel, rects} = repositionRectangles(data, this.vessel, this.winWidth);
      this.rectangles = rects;
      this.vessel = vessel;
    },

    // 选中动作面板的操作
    onSelect({func}) {
      this[func]?.();
    },

    // 编辑材料
    editRectangle() {
      this.pType = "editor";
      const node = _deepCopy(this.node);
      this.visible = true;
      this.form = {...node.item};

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 删除材料
    removeRectangle() {
      const node = _deepCopy(this.node);
      const list = _deepCopy(this.rectangles);
      const index = list.findIndex(v => _isEqual(v.rid, _get(node, "item.rid")));
      if (index > -1) {

        list.splice(index, 1);
        this.rectangles = list;
        // this.updateView(list);
      } else {
        CustomToast({
          title: "找不到要删除的材料",
          icon: "none",
        });
      }
    },

    // 点击列表的更多操作
    onClickMore(obj) {
      this.asType = "tMore";
      this.node = obj;
      this.$refs.UASRef.open();
    },

    // 点击元素的角
    onAngle(type, item) {
      this.pType = type;
      this.form = _deepCopy(item);
      this.visible = true;

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 手指触摸开始
    onTouchStart(e) {
      if (e) return false;
      if (e.touches.length === 2) { // 检测两指操作
        const x1 = e.touches[0].pageX;
        const y1 = e.touches[0].pageY;
        const x2 = e.touches[1].pageX;
        const y2 = e.touches[1].pageY;

        const p = _get(e, "currentTarget.dataset.params");
        this.initialDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        this.initialScale = _deepCopy(p.scale);
      }
    },
    // 手指移动
    onTouchMove(e) {
      if (e) return false;
      if (e.touches.length === 2) { // 检测两指操作
        const x1 = e.touches[0].pageX;
        const y1 = e.touches[0].pageY;
        const x2 = e.touches[1].pageX;
        const y2 = e.touches[1].pageY;
        const newDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // 计算当前间距
        const scale = (newDistance / this.initialDistance) * this.initialScale;

        const p = _get(e, "currentTarget.dataset.params");

        const index = this.vessel.findIndex(v => _isEqual(v.rid, p.rid));

        this.$set(this.vessel[index], "scale", Math.max(0.2, Math.min(3, scale)));
      }
    },
    // 手指离开
    onTouchEnd(e) {
      if (e.touches.length === 0) {
        // 可以在此记录最终缩放值，或处理其他逻辑
      }
    },

    // 提交计算
    onSubmitCustomized() {
      let params = _deepCopy(this.rectangles);
      const drillWidth = this.formData.drillWidth;
      params = params.map(item => {
        return {
          rid: item.rid,
          width: item.width + drillWidth,
          height: item.height + drillWidth,
          weight: item.weight,
          x: item.x,
          y: item.y,
        };
      });

      this.sLoading = true;
      customizedCalculateApi({
        rid: _generateUUID(),
        containerWidth: this.formData.width,
        containerHeight: this.formData.height,
        items: params,
      })
        .then(res => {
          const data = res.data;
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            item.rid = _generateUUID();
            item.width = item.containerWidth;
            item.height = item.containerHeight;
            item.scale = this.winWidth / item.containerWidth;

            for (let j = 0; j < item.items.length; j++) {
              const itemElement = item.items[j];
              const index = this.rectangles.findIndex(v => _isEqual(v.rid, itemElement.rid));
              if (index > -1) {
                item.items[j] = {
                  ...this.rectangles[index],
                  x: itemElement.x,
                  y: itemElement.y,
                  parent: item.rid,
                };
              }
            }
          }
          this.vessel = data;
          this.rectangles = _flattenDeep(data.map(item => item.items));

          this.emitValue();
        })
        .finally(() => {
          this.sLoading = false;

          setTimeout(() => {
            this.$emit("update:is-customized", false);
          }, 500);
        });
    },

    // 更新板材规格
    updatePlate(event) {
      const [width, height, weight] = event?.split?.("x") || [];
      this.formData.width = _toFinite(width);
      this.formData.height = _toFinite(height);
      this.formData.weight = _toFinite(weight);
    },

    // 将数据传入外部
    emitValue() {
      const drillWidth = _deepCopy(this.formData.drillWidth);
      const params = {
        drillWidth,
        boards: _deepCopy(this.vessel).map(item => {
          return {
            rid: item.rid,
            width: item.width,
            height: item.height,
            cells: item.items.map(v => {
              return {
                ...v,
                width: v.width + drillWidth,
                height: v.height + drillWidth,
              };
            }),
          };
        }),
      };
      this.$emit("input", params);
    },

    // 接收外部的数据
    takeValue() {
      const value = _deepCopy(this.value) || {};
      if (_isEmpty(value)) return false;

      const boards = value?.boards || [];
      this.formData.drillWidth = value.drillWidth;

      this.vessel = boards.map(v => ({...v, scale: this.winWidth / v.width}));

      this.formData.width = _get(this.vessel, "0.width");
      this.formData.height = _get(this.vessel, "0.height");

      this.rectangles = _flattenDeep(
        boards.map(v =>
          v.cells.map(
            item => ({
              ...item,
              parent: v.rid,
              width: item.width - value.drillWidth,
              height: item.height - value.drillWidth,
            }),
          ),
        ),
      );
    },

    // 获取组件的宽度
    getRectByRoot() {
      setTimeout(() => {
        this.$nextTick(() => {
          getRect(".ko-bin", this)
            .then(res => {
              this.winWidth = (res?.width - 2);
            });
        });
      }, 0);
    },

  },
  mounted() {
    this.getRectByRoot();
  },
  computed: {
    // 获取弹窗标题
    getPopupTitle() {
      return {
        vessel: "添加容器",
        addedChild: "添加子节点",
        editor: "编辑",
        angle: "设置材料圆角",
      }[this.pType];
    },
    // 获取弹窗底部按钮文本
    getPopupButtonText() {
      return {
        vessel: "添加",
        addedChild: "添加",
        editor: "确定",
        angle: "确定",
      }[this.pType];
    },

    // 动作面板展示列表
    getNodeSheet() {
      return {
        tMore: [
          {
            name: "编辑",
            func: "editRectangle",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "removeRectangle",
          },
        ],
      }[this.asType] || [];
    },
    // 获取容器的样式
    getVesselStyle() {
      return (vss) => {
        const scale = (_round(vss.scale, 2) || _round(this.winWidth / vss.width, 2)) ?? 1;

        return {
          height: (vss.height + 2) * scale + "px",
          width: (vss.width + 2) * scale + "px",
          // transform: `scale(${_round(vss.scale, 2)})`,
          transformOrigin: `0 0`,
        };
      };
    },

    // 获取所有的子级
    getVChildList() {
      return (node) => {
        return this.rectangles.filter(v => _isEqual(v.parent, node.rid));
      };
    },

    // 处理子元素的样式
    getVItemStyle() {
      return (item) => {
        const drillWidth = this.formData.drillWidth;
        const bSize = drillWidth / 2;

        const parent = this.vessel.find(v => _isEqual(v.rid, item.parent));
        const scale = _round(parent.scale, 2) ?? 1;

        return {
          width: (item.width + drillWidth) * scale + "px",
          height: (item.height + drillWidth) * scale + "px",
          background: `radial-gradient(#eeeeee -30%, ${item.color} 100%)`,
          transform: `translate(${item.x * scale}px, ${item.y * scale}px) rotate(${item.rotation}deg)`,
          border: `${bSize * scale}px solid #000`,
          color: "#1f3ba0",
          borderRadius: item.radius ? item.radius.map(v => v * scale + "px").join(" ") : 0,
        };
      };
    },

    getPSEnums() {
      return PLATE_SPECIF_ENUMS;
    },
  },
};
</script>

<template>
  <view class="ko-bin">
    <view class="ko-bin__wrap" :style="{'--blade-width': formData.drillWidth + 'px'}">
      <uni-row :gutter="10">
        <uni-col :span="24">
          <view class="ko-bin__vessel--info">
            <label class="ko-basic-label">刀头宽度：</label>
            <uni-number-box type="digit" v-model="formData.drillWidth" />
            <text style="padding-left: 10px;">mm</text>
          </view>
        </uni-col>
        <uni-col :span="24">
          <view class="ko-bin__vessel--info">
            <label class="ko-basic-label">板材规格：</label>
            <PickerSheet
              :options="getPSEnums"
              :value="`${formData.width}x${formData.height}`"
              @input="updatePlate"
            />
            <text style="padding-left: 10px;">mm</text>
          </view>
        </uni-col>
      </uni-row>

      <view class="ko-bin__vessel--table">
        <GridTable
          :columns="columns"
          :data="rectangles"
          @click-more="onClickMore"
          not-edit
          :no-more="!rectangles.length"
        />
      </view>

      <uni-section title="添加材料" type="line">
        <uni-forms
          :label-width="50"
          label-align="right"
          :model="child"
        >
          <uni-row>
            <uni-col :span="8">
              <uni-forms-item label="宽" name="width">
                <uni-easyinput type="digit" v-model="child.width" placeholder="请输入" />
              </uni-forms-item>
            </uni-col>
            <uni-col :span="8">
              <uni-forms-item label="高" name="height">
                <uni-easyinput type="digit" v-model="child.height" placeholder="请输入" />
              </uni-forms-item>
            </uni-col>
            <uni-col :span="8">
              <uni-forms-item label="厚" name="weight">
                <PickerSheet
                  :options="[
                    {
                      name: '9',
                      value: 9
                    },
                    {
                      name: '17',
                      value: 17
                    },
                    {
                      name: '18',
                      value: 18
                    },
                  ]"
                  v-model="child.weight"
                />
              </uni-forms-item>
            </uni-col>
            <uni-col :span="24">
              <view class="ko-bin__added">
                <button
                  class="ko-basic-button__card"
                  @click="onSubmitCustomized"
                  :disabled="sLoading"
                  :loading="sLoading"
                >
                  {{ sLoading ? "计算中..." : "开始计算" }}
                </button>
                <button class="ko-basic-button__card" @click="onAddedRectangle">
                  添加
                </button>
              </view>
            </uni-col>
          </uni-row>
        </uni-forms>
      </uni-section>

      <view v-for="(vss) of vessel" :key="vss.rid" class="ko-bin__scroll--wrap">
        <scroll-view
          scroll-x="true"
          class="ko-bin__scroll"
        >
          <view
            class="ko-bin__vessel"
            :style="[getVesselStyle(vss)]"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            :data-params="vss"
          >
            <view
              class="ko-bin__vessel--item"
              v-for="(item, no) of getVChildList(vss)"
              :key="item.rid"
              :style="[getVItemStyle(item)]"
            >
              <view
                class="ko-bin__vessel--item--info"
                :style="{transform: `rotate(${item.width < item.height ? '90' : 0}deg)`}"
              >
                {{ `(${item.width}x${item.height}x${item.weight})` }}
              </view>
              <view class="ko-bin__vessel--item--angle LT" @click.stop="onAngle('angle', item)"></view>
              <view class="ko-bin__vessel--item--angle RT" @click.stop="onAngle('angle', item)"></view>
              <view class="ko-bin__vessel--item--angle LB" @click.stop="onAngle('angle', item)"></view>
              <view class="ko-bin__vessel--item--angle RB" @click.stop="onAngle('angle', item)"></view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <KoMovable v-if="false" :y-axis="-60" @click="onAdded('vessel')" />

    <BasicPopup :visible.sync="visible" :title="getPopupTitle">
      <view class="ko-bin__popup">
        <uni-forms label-align="right" ref="FormRef" :model="form">
          <block v-if="pType === 'angle'">
            <uni-forms-item
              v-for="(item, index) of form.radius"
              :label="['左上', '右上', '右下', '左下'][index] + '：'"
              :name="`radius.${index}`"
              :key="index"
            >
              <uni-number-box :min="0" :width="100" type="digit" v-model="form.radius[index]" placeholder="请输入" />
            </uni-forms-item>
          </block>
          <block v-else>
            <uni-forms-item label="宽" name="width">
              <uni-easyinput type="digit" v-model="form.width" placeholder="请输入" />
            </uni-forms-item>
            <uni-forms-item label="高" name="height">
              <uni-easyinput type="digit" v-model="form.height" placeholder="请输入" />
            </uni-forms-item>
          </block>
        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-bin__popup--footer ko-basic-box-shadow__top">
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
.ko-bin {
  height: 100%;
  width: 100%;

  &__wrap {
    //transform: translate(0, 0) rotate(0deg);
  }

  &__scroll {
    &--wrap {
      margin-bottom: 10px;
    }
  }

  &__vessel {
    border: 1px solid #c7c9ce;
    position: relative;

    &--desc {
      font-size: 14px;
      color: #8f939c;
      padding-bottom: 10px;
    }

    &--item {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      color: #333; /* 默认颜色 */
      //filter: invert(1) brightness(1.5);

      &--angle {
        position: absolute;
        //background: #ccc;
        z-index: 9;
        width: 20px;
        height: 20px;

        &.LT {
          top: calc(var(--blade-width) / 2 - var(--blade-width));
          left: calc(var(--blade-width) / 2 - var(--blade-width));
        }

        &.LB {
          bottom: calc(var(--blade-width) / 2 - var(--blade-width));
          left: calc(var(--blade-width) / 2 - var(--blade-width));
        }

        &.RT {
          top: calc(var(--blade-width) / 2 - var(--blade-width));
          right: calc(var(--blade-width) / 2 - var(--blade-width));
        }

        &.RB {
          bottom: calc(var(--blade-width) / 2 - var(--blade-width));
          right: calc(var(--blade-width) / 2 - var(--blade-width));
        }
      }

      &--info {
        font-size: 10px;
      }
    }

    &--table {
      padding-top: 10px;
    }

    &--info {
      font-size: 13px;
      display: flex;
      align-items: center;
      color: #909399;
    }
  }

  &__added {
    padding: 10px 0;
    display: flex;
    align-items: center;

    .ko-basic-button__card {
      width: 120px;
      margin: 0 auto;
    }
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
      padding: 10px;

      .ko-basic-button__card {
        width: 100px;
      }
    }
  }
}
</style>
