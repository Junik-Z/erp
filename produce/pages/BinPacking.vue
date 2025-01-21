<script>
import KoMovable from "@/components/Movable/index.vue";
import {
  _deepCopy,
  _flattenDeep,
  _generateUUID,
  _get,
  _isEqual,
  _omit,
  _toFinite,
  CustomToast,
  getRect,
} from "@/utils";
import { getRandomColor, repositionRectangles } from "./calculate";
import GridTable from "../components/GridTable/GridTable.vue";
import { customizedCalculateApi } from "@/api/erp/produce";
import PickerSheet from "@/produce/components/PickerSheet.vue";
import { PLATE_SPECIF_ENUMS } from "@/utils/config";
import mixins from "@/mixins/mixins";
import UvCheckbox from "../components/uv-checkbox/components/uv-checkbox/uv-checkbox.vue";
import Composing from "./Composing.vue";

const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;

export default {
  name: "BinPacking",
  components: {Composing, PickerSheet, KoMovable, GridTable, UvCheckbox},
  mixins: [mixins],
  data() {
    return {
      pType: "",
      visible: false,
      pLoading: false,

      form: {
        height: null,
        width: null,
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

      // 临时存储的节点
      node: {},

      initialDistance: 0,
      initialScale: 0,

      winWidth: screenWidth - 20 - 2, // 容器宽度

      // 动作面板的类型
      asType: "",

      // 主板材
      formData: {
        rid: _generateUUID(),
        drillWidth: 6, // 刀头宽度
        edgeWidth: 1.2, // 封边宽度
        width: 1220, // 板材宽度
        height: 2440, // 板材高度
      },
      // 板材下的材料
      itemsForm: {
        name: "柜面1",
        rid: "",
        width: 500,
        height: 600,
        x: 0,
        y: 0,
        radius: [0, 0, 0, 0],
        edges: [0, 0, 0, 0],
        weight: 9,
        texture: false, // 纹理
        rotate: false, // 转90度
        quantity: 1,
      },

      // 材料表头
      columns: [
        {
          label: "名称",
          prop: "name",
          // #ifndef H5
          width: 100,
          // #endif
        },
        {
          label: "宽",
          prop: "width",
          // #ifndef H5
          width: 50,
          // #endif
        },
        {
          label: "高",
          prop: "height",
          // #ifndef H5
          width: 50,
          // #endif
        },
        {
          label: "厚",
          prop: "weight",
          // #ifndef H5
          width: 50,
          // #endif
        },
        {
          label: "数量",
          prop: "quantity",
          // #ifndef H5
          width: 50,
          // #endif
        },
        {
          label: "封边(左)",
          prop: "edges.0",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif
        },
        {
          label: "封边(右)",
          prop: "edges.1",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif
        },
        {
          label: "封边(前)",
          prop: "edges.2",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif
        },
        {
          label: "封边(背)",
          prop: "edges.3",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif
        },
        {
          label: "纹理",
          prop: "texture",
          type: "checkbox",
          // #ifndef H5
          width: 50,
          // #endif
        },
        {
          label: "转90度",
          prop: "rotate",
          type: "checkbox",
          // #ifndef H5
          width: 70,
          // #endif
        },
        {
          label: "操作",
          type: "more",
          prop: "More",
          // #ifdef H5
          slot: "operate",
          // #endif

          // #ifndef H5
          width: 70,
          // #endif
        },
      ],

      // 余料
      residueColumns: [
        {
          label: "名称",
          prop: "name",
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
          label: "数量",
          prop: "quantity",
        },
        {
          label: "操作",
          type: "more",
          prop: "More",
        },
      ],
      residue: [],
      residueForm: {
        name: "余料1",
        rid: "",
        width: null,
        height: null,
        x: null,
        y: null,
        quantity: 1,
        weight: 9,
      },

      // 所有的材料
      rectangles: [],

      drillWidth: 0,

      sLoading: false,

      tab: 0,
      values: ["原料尺寸", "余料尺寸"],

      weightList: [
        {name: "9", value: 9},
        {name: "17", value: 17},
        {name: "18", value: 18},
      ],

      // 排版记录
      boardRecord: [
        /* {
          "width": 1006,
          "height": 906,
          "items": [{"rid": "27dceb78-39c9-47d7-8225-ca19ef787a3b", "width": 504, "height": 604, "x": 0, "y": 0}],
        },
        {
          "width": 1006,
          "height": 906,
          "items": [{"rid": "465ec943-4012-4a08-ae2c-d85a5f30a785", "width": 504, "height": 604, "x": 0, "y": 0}],
        },
        {
          "width": 1226,
          "height": 2446,
          "items": [
            {
              "rid": "97c8b17e-2347-4cfe-b237-3e09cbd6a640",
              "width": 504,
              "height": 604,
              "x": 0,
              "y": 0,
            },
            {
              "rid": "a706f6ff-47f8-456a-9c0e-3ed84b56abeb",
              "width": 504,
              "height": 604,
              "x": 504,
              "y": 0,
            },
            {
              "rid": "b15aa67c-4a8c-4e95-a283-1a5fe6ca934f",
              "width": 504,
              "height": 604,
              "x": 0,
              "y": 604,
            },
            {
              "rid": "08c98f67-dfeb-4f63-88ff-22f2aee4a8e8",
              "width": 504,
              "height": 604,
              "x": 504,
              "y": 604,
            },
            {"rid": "ea4067c1-8716-492d-899c-b1555f9f47bb", "width": 504, "height": 604, "x": 0, "y": 1208},
          ],
        }, */
      ],

      // 外部更新的阀门
      isExternalUpdatesFlag: false,
      // 内部向外部更新数据的阀门
      isToOutsideFlag: false,
    };
  },
  watch: {
    bladeWidth: {
      handler() {
        // this.updateView(this.rectangles);
      },
      deep: true,
    },
    computedChange: {
      handler() {
        if (this.isExternalUpdatesFlag) return false;

        this.isToOutsideFlag = true;

        this.getRectByRoot();
        this.emitValue();
        this.$emit("update:is-customized", true);
      },
    },

    value: {
      handler(to, form) {
        if (!_isEqual(to, form) && !this.isToOutsideFlag) {
          this.isExternalUpdatesFlag = true;
          this.setTakeValue(this.value);
        }
      },
      immediate: true,
    },
  },
  props: {
    isCustomized: Boolean,
    value: Object,

    readonly: Boolean,
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
        const index = this.node.index;
        if (index > -1) {
          this.$set(this.rectangles, index, {
            ...F,
            width: _toFinite(F.width),
            height: _toFinite(F.height),
            weight: _toFinite(F.weight),
            quantity: _toFinite(F.quantity),
            radius: F.radius?.map(_toFinite) || [],
          });
          this.visible = false;
        } else {
          CustomToast({
            title: "未找到要设置的材料，请重新选择。",
            icon: "none",
          });
        }
      }

      // 编辑余料
      if (_isEqual(this.pType, "residueEditor")) {
        const index = this.node.index;

        if (index > -1) {
          this.$set(
            this.residue,
            index,
            {
              ...F,
              height: _toFinite(F.height),
              width: _toFinite(F.width),
              weight: _toFinite(F.weight),
              quantity: _toFinite(F.quantity),
            },
          );
          this.visible = false;
        } else {
          CustomToast({
            title: "未找到要设置的材料，请重新选择。",
            icon: "none",
          });
        }
      }
    },

    // 添加材料
    onAddedRectangle() {
      const F = _deepCopy(this.itemsForm);
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
          ...F,
          width: _toFinite(F.width),
          height: _toFinite(F.height),
          weight: _toFinite(F.weight),
          quantity: _toFinite(F.quantity),
          radius: F.radius?.map(_toFinite) || [],
          rid: _generateUUID(),
          // color: gColor(),
        };

        this.rectangles.push(obj);

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
      const index = node.index;
      if (index > -1) {
        this.rectangles.splice(index, 1);
      } else {
        CustomToast({
          title: "找不到要删除的材料",
          icon: "none",
        });
      }
    },

    // 点击材料列表的更多操作
    onClickMore(obj) {
      this.asType = "tMore";
      this.node = obj;
      this.$refs.UASRef.open();
    },

    // 点击余料列表的更多操作
    onClickResidueMore(obj) {
      this.asType = "rMore";
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

    // 提交计算
    onSubmitCustomized() {
      // 主板材的数据
      const host = _deepCopy(this.formData);
      const {drillWidth, edgeWidth} = host;

      const residue = _flattenDeep(_deepCopy(this.residue).map(item => {
        const rest = [];
        if (item.quantity > 1) {
          for (let i = 1; i < item.quantity; i++) {
            rest.push(item);
          }
        }
        return [item, ...rest];
      }));

      const packers = [host, ...residue]
        .map(v => ({
          ...v,
          width: _toFinite(v.width) + drillWidth, // 添加刀距
          height: _toFinite(v.height) + drillWidth, // 添加刀距
        }));

      // 其余数量的材料
      const rest = [];

      let items = _deepCopy(this.rectangles);
      items = items.map(item => {
        const [L, R, W, H] = item.edges.map(_toFinite);
        const LR = L + R;
        const WH = W + H;

        const [width, height] = item.rotate ? [item.height, item.width] : [item.width, item.height];

        const obj = {
          rid: item.rid,
          width: width + drillWidth - (LR * edgeWidth),
          height: height + drillWidth - (WH * edgeWidth),
          weight: item.weight,
          x: item.x,
          y: item.y,
        };

        if (item.quantity > 1) {
          for (let i = 1; i < item.quantity; i++) {
            rest.push(obj);
          }
        }

        return obj;
      });

      this.sLoading = true;
      customizedCalculateApi({packers, items: [...items, ...rest]})
        .then(res => {
          const data = res.data;
          this.boardRecord = data;
          this.$refs.PRef.open();

          !data && console.log(data);
          /* for (let i = 0; i < data.length; i++) {
            const item = data[i];
            item.rid = _generateUUID();
            item.width = item.containerWidth - drillWidth;
            item.height = item.containerHeight - drillWidth;
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

          this.drillWidth = _deepCopy(drillWidth);

          this.emitValue(); */
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
      const [width, height, weight] = event?.split?.("×") || [];
      this.formData.width = _toFinite(width);
      this.formData.height = _toFinite(height);
      this.formData.weight = _toFinite(weight);
    },

    // 将数据传入外部
    emitValue() {
      try {

        // 主板材的数据
        const host = _deepCopy(this.formData);
        const {drillWidth, edgeWidth} = host;

        const packers = [host, ...this.residue]
          .map(v => ({
              ...v,
              width: _toFinite(v.width),
              height: _toFinite(v.height),
            }),
          );

        let items = _deepCopy(this.rectangles);
        items = items.map(item => {
          return {
            ...item,
            rid: item.rid,
            width: item.width,
            height: item.height,
            weight: item.weight,
            x: item.x,
            y: item.y,
            edges: item?.edges?.map(v => +v) || [],
          };
        });

        this.$emit("change", {
          ..._omit(host, ["width", "height"]),
          drillWidth,
          edgeWidth,
          boards: [{
            rid: _generateUUID(),
            width: 0,
            height: 0,
            packers,
            items,
          }],
          boardRecord: _deepCopy(this.boardRecord),
        });
      } catch (e) {
        console.error("[板材定制向外部传数据出错了]", e);
      }

      setTimeout(() => {
        this.isToOutsideFlag = false;
      }, 600);
    },

    // 接收外部的数据
    setTakeValue(data) {
      try {
        const obj = _deepCopy(data) || {};
        this.boardRecord = _get(obj, "boardRecord") || [];

        const {packers, items} = _get(obj, "boards.0") || {packers: [], items: []};
        this.formData = {...this.formData, ..._omit(obj, ["boardRecord", "boards"]), ..._get(packers, "0")};

        this.residue = packers?.filter((v, i) => i !== 0) || [];
        this.rectangles = items;
      } catch (e) {
        console.error("[板材定制外部传入的数据解析出错了]", e);
      }

      setTimeout(() => {
        this.isExternalUpdatesFlag = false;
      }, 600);
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

    // 添加余料
    onAddedResidue() {
      const F = _deepCopy(this.residueForm);

      if (_toFinite(F.width) > 0 && _toFinite(F.height) > 0) {
        this.residue.push({
          ...F,
          height: _toFinite(F.height),
          width: _toFinite(F.width),
          weight: _toFinite(F.weight),
          quantity: _toFinite(F.quantity),
          rid: _generateUUID(),
        });
      } else {
        CustomToast({
          title: "请检查输入的余料宽高",
          icon: "none",
        });
      }
    },

    // 修改余料
    editResidue() {
      this.pType = "residueEditor";
      const node = _deepCopy(this.node);
      this.visible = true;
      this.form = {...node.item};

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 删除余料
    removeResidue() {
      const index = this.node.index;
      if (index > -1) {
        this.residue.splice(index, 1);
      } else {
        CustomToast({
          title: "找不到要删除的余料",
          icon: "none",
        });
      }
    },

    // 关闭弹窗
    onClose() {
      this.$refs.PRef.close();
    },

    // 查看排版
    onViewLayout() {
      this.$refs.PRef.open();
    },
  },
  mounted() {
    this.getRectByRoot();
    // this.$refs.PRef.open();
  },
  computed: {
    // 获取弹窗标题
    getPopupTitle() {
      return {
        vessel: "添加容器",
        addedChild: "添加子节点",
        editor: "编辑",
        angle: "设置材料圆角",
        residueEditor: "编辑余料",
      }[this.pType];
    },
    // 获取弹窗底部按钮文本
    getPopupButtonText() {
      return {
        vessel: "添加",
        addedChild: "添加",
        editor: "确定",
        angle: "确定",
        residueEditor: "确定",
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
        rMore: [
          {
            name: "编辑",
            func: "editResidue",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "removeResidue",
          },
        ],
      }[this.asType] || [];
    },

    getPSEnums() {
      return PLATE_SPECIF_ENUMS;
    },

    // 监听组件数据
    computedChange() {
      return [this.formData, ...this.residue, ...this.rectangles, ...this.boardRecord];
    },

    // 获取余料表头
    getResidueColumns() {
      return _deepCopy(this.residueColumns).filter(v => this.readonly ? v.prop !== "More" : true);
    },

    // 获取表头
    getColumns() {
      return _deepCopy(this.columns).filter(v => this.readonly ? v.prop !== "More" : true);
    },
  },
};
</script>

<template>
  <view class="ko-bin">
    <view class="ko-bin__wrap" :style="{'--blade-width': drillWidth + 'px'}">
      <view style="padding-top: 4px;">
        <HistoryBar v-model="tab" :values="values" />
      </view>

      <!-- 添加下料 -->
      <block v-if="isEqual(tab, 0)">
        <uni-row :gutter="10">
          <uni-col :span="24">
            <view class="ko-bin__vessel--info">
              <label class="ko-basic-label">刀头宽度：</label>
              <uni-number-box v-if="!readonly" type="digit" v-model="formData.drillWidth" />
              <text v-else>{{ formData.drillWidth }}</text>
              <text style="padding-left: 10px;">mm</text>
            </view>
          </uni-col>
          <uni-col :span="24">
            <view class="ko-bin__vessel--info">
              <label class="ko-basic-label">厚封边(>=)：</label>
              <uni-number-box v-if="!readonly" type="digit" :step="0.1" v-model="formData.edgeWidth" />
              <text v-else>{{ formData.edgeWidth }}</text>
              <text style="padding-left: 10px;">mm</text>
            </view>
          </uni-col>
          <uni-col :span="24">
            <view class="ko-bin__vessel--info">
              <label class="ko-basic-label">板材规格：</label>
              <PickerSheet
                :options="getPSEnums"
                :value="`${formData.width}×${formData.height}`"
                @input="updatePlate"
                v-if="!readonly"
              />
              <text v-else>{{ `${formData.width}×${formData.height}` }}</text>
              <text style="padding-left: 10px;">mm</text>
            </view>
          </uni-col>
        </uni-row>

        <uni-section title="下料尺寸" type="line">
          <view class="ko-bin__vessel--table">
            <!-- #ifndef H5 -->
            <GridTable
              :columns="getColumns"
              :data="rectangles"
              @click-more="onClickMore"
              not-edit
              :no-more="!rectangles.length"
            />
            <!-- #endif -->
            <!-- #ifdef H5 -->
            <KoTable
              :columns="getColumns"
              :data="rectangles"
              @click-more="onClickMore"
              not-edit
              :no-more="!rectangles.length"
            >
              <template #operate="{item}">
                <view
                  style="display: flex; align-items: center;
                   justify-content: center;"
                >
                  <button class="ko-basic-button__card" @click.stop="onEdit(item)">修改</button>
                  <button class="ko-basic-button__card" @click.stop="onRemove(item)">删除</button>
                </view>
              </template>
            </KoTable>
            <!-- #endif -->
          </view>
        </uni-section>

        <uni-section title="添加材料" type="line" v-if="!readonly">
          <uni-forms
            :label-width="50"
            label-align="right"
            :model="itemsForm"
          >
            <uni-row :gutter="0">
              <uni-col :span="24">
                <uni-forms-item label="名称" label-width="70" name="name">
                  <uni-easyinput v-model="itemsForm.name" placeholder="请输入" />
                </uni-forms-item>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: space-between;">
                  <uni-forms-item label="封边左" label-width="70" name="itemsForm.edges.0">
                    <UvCheckbox is-alone v-model="itemsForm.edges[0]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边右" label-width="70" name="itemsForm.edges.1">
                    <UvCheckbox is-alone v-model="itemsForm.edges[1]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边前" label-width="70" name="itemsForm.edges.2">
                    <UvCheckbox is-alone v-model="itemsForm.edges[2]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边背" label-width="70" name="itemsForm.edges.3">
                    <UvCheckbox is-alone v-model="itemsForm.edges[3]" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: space-between;">
                  <uni-forms-item label="数量" label-width="70" name="quantity">
                    <uni-number-box :min="1" v-model="itemsForm.quantity" />
                  </uni-forms-item>
                  <uni-forms-item label="纹理" label-width="70" name="texture">
                    <UvCheckbox is-alone v-model="itemsForm.texture" />
                  </uni-forms-item>
                  <uni-forms-item label="转90度" label-width="70" name="rotate">
                    <UvCheckbox is-alone v-model="itemsForm.rotate" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: center;">
                  <uni-forms-item label-width="0" name="width">
                    <uni-easyinput type="digit" v-model="itemsForm.width" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="height">
                    <uni-easyinput type="digit" v-model="itemsForm.height" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="weight">
                    <PickerSheet
                      :options="weightList"
                      v-model="itemsForm.weight"
                    />
                  </uni-forms-item>
                </view>
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

        <view v-if="readonly" style="padding: 20px 0; display: flex; justify-content: center;">
          <button
            class="ko-basic-button__card"
            @click="onViewLayout"
            style="width: 120px;"
          >
            查看排版
          </button>
        </view>
      </block>

      <!-- 添加余料 -->
      <block v-if="isEqual(tab, 1)">
        <view class="ko-bin__vessel--table">
          <GridTable
            :columns="getResidueColumns"
            :data="residue"
            @click-more="onClickResidueMore"
            not-edit
            :no-more="!residue.length"
          />
        </view>
        <uni-section title="添加余料" type="line" v-if="!readonly">
          <uni-forms
            :label-width="50"
            label-align="right"
            :model="residueForm"
            ref="ResidueFormRef"
          >
            <uni-row>
              <uni-col :span="24">
                <view style="display: flex;align-items: center;">
                  <uni-forms-item label="名称" label-width="70" name="name">
                    <uni-easyinput v-model="residueForm.name" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="width: 20rpx;"></view>
                  <uni-forms-item label="数量" label-width="70" name="quantity">
                    <uni-number-box type="digit" v-model="residueForm.quantity" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: center;">
                  <uni-forms-item label-width="0" name="width">
                    <uni-easyinput type="digit" v-model="residueForm.width" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="height">
                    <uni-easyinput type="digit" v-model="residueForm.height" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="weight">
                    <PickerSheet
                      :options="weightList"
                      v-model="residueForm.weight"
                    />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view class="ko-bin__added">
                  <button class="ko-basic-button__card" @click="onAddedResidue">
                    添加
                  </button>
                </view>
              </uni-col>
            </uni-row>
          </uni-forms>
        </uni-section>
      </block>
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
          <block v-else-if="pType === 'editor'">
            <uni-row :gutter="0">
              <uni-col :span="24">
                <uni-forms-item label="名称" label-width="70" name="name">
                  <uni-easyinput v-model="form.name" placeholder="请输入" />
                </uni-forms-item>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: space-between;">
                  <uni-forms-item label="封边左" label-width="70" name="form.edges.0">
                    <UvCheckbox is-alone v-model="form.edges[0]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边右" label-width="70" name="form.edges.1">
                    <UvCheckbox is-alone v-model="form.edges[1]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边前" label-width="70" name="form.edges.2">
                    <UvCheckbox is-alone v-model="form.edges[2]" />
                  </uni-forms-item>
                  <uni-forms-item label="封边背" label-width="70" name="form.edges.3">
                    <UvCheckbox is-alone v-model="form.edges[3]" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: space-between;">
                  <uni-forms-item label="数量" label-width="70" name="quantity">
                    <uni-number-box type="digit" v-model="form.quantity" />
                  </uni-forms-item>
                  <uni-forms-item label="纹理" label-width="70" name="texture">
                    <UvCheckbox is-alone v-model="form.texture" />
                  </uni-forms-item>
                  <uni-forms-item label="转90度" label-width="70" name="rotate">
                    <UvCheckbox is-alone v-model="form.rotate" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: center;">
                  <uni-forms-item label-width="0" name="width">
                    <uni-easyinput type="digit" v-model="form.width" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="height">
                    <uni-easyinput type="digit" v-model="form.height" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="weight">
                    <PickerSheet
                      :options="weightList"
                      v-model="form.weight"
                    />
                  </uni-forms-item>
                </view>
              </uni-col>
            </uni-row>
          </block>
          <block v-else-if="pType === 'residueEditor'">
            <uni-row :gutter="0">
              <uni-col :span="24">
                <view style="display: flex;align-items: center;">
                  <uni-forms-item label="名称" label-width="70" name="name">
                    <uni-easyinput v-model="form.name" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="width: 20rpx;"></view>
                  <uni-forms-item label="数量" label-width="70" name="quantity">
                    <uni-number-box type="digit" v-model="form.quantity" />
                  </uni-forms-item>
                </view>
              </uni-col>
              <uni-col :span="24">
                <view style="display:flex; align-items: center; justify-content: center;">
                  <uni-forms-item label-width="0" name="width">
                    <uni-easyinput type="digit" v-model="form.width" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="height">
                    <uni-easyinput type="digit" v-model="form.height" placeholder="请输入" />
                  </uni-forms-item>
                  <view style="margin: 0 5px 20px">
                    ×
                  </view>
                  <uni-forms-item label-width="0" name="weight">
                    <PickerSheet
                      :options="weightList"
                      v-model="form.weight"
                    />
                  </uni-forms-item>
                </view>
              </uni-col>
            </uni-row>
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

    <uv-popup ref="PRef" mode="bottom" round="10" :close-on-click-overlay="false">
      <view class="ko-bin__com">
        <Composing
          :data="boardRecord"
          :form="formData"
          :win-width="winWidth"
          @close="onClose"
          :rectangles="rectangles"
        />
      </view>
    </uv-popup>

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

  &__vessel {
    &--desc {
      font-size: 14px;
      color: #8f939c;
      padding-bottom: 10px;
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

  &__com {
    width: 100vw;
    // #ifdef MP
    height: 94vh;
    // #endif
  }
}
</style>
