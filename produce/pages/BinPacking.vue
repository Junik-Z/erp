<script>
// #ifdef H5
import { Button, Checkbox, Input, InputNumber, Option, Popover, Select } from "@/uni_modules/element-ui/element.min";
// #endif
import KoMovable from "@/components/Movable/index.vue";
import {
  _deepCopy,
  _flattenDeep,
  _generateUUID,
  _get,
  _isEqual,
  _omit,
  _pick,
  _toFinite,
  CustomToast,
  getRect,
} from "@/utils";
import { repositionRectangles } from "./calculate";
import GridTable from "../components/GridTable/GridTable.vue";
import { customizedCalculateApi } from "@/api/erp/produce";
import PickerSheet from "@/produce/components/PickerSheet.vue";
import { PageEnums, PLATE_SPECIF_ENUMS } from "@/utils/config";
import mixins from "@/mixins/mixins";
import UvCheckbox from "../components/uv-checkbox/components/uv-checkbox/uv-checkbox.vue";
import Composing from "./Composing.vue";
import EdgeBanding from "./EdgeBanding.vue";

const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;

export default {
  name: "BinPacking",
  components: {
    Composing,
    PickerSheet,
    KoMovable,
    GridTable,
    UvCheckbox,
    EdgeBanding,
  },
  mixins: [mixins],
  data() {
    return {
      pType: "",
      visible: false,
      pLoading: false,

      form: {
        height: null,
        width: null,
        rid: "",
        x: 0,
        y: 0,
        radius: [0, 0, 0, 0],
        // 夹角类型
        angleType: [0, 0, 0, 0],
        edges: [0, 0, 0, 0],
        straight: [[0, 0], [0, 0], [0, 0], [0, 0]],
        weight: 18,
        texture: false, // 纹理
        rotate: false, // 转90度
        quantity: 1,
        color: "",
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

      winWidth: screenWidth - 26, // 容器宽度

      // 动作面板的类型
      asType: "",

      // 主板材
      formData: {
        rid: _generateUUID(),
        drillWidth: 6, // 刀头宽度
        edgeWidth: 1, // 封边宽度
        width: 1220, // 板材宽度
        height: 2440, // 板材高度
        color: "黑色",
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
        angleType: [0, 0, 0, 0],
        edges: [0, 0, 0, 0],
        straight: [[0, 0], [0, 0], [0, 0], [0, 0]],
        weight: 18,
        texture: true, // 纹理
        rotate: false, // 转90度
        quantity: 1,
        color: "",
      },

      // 余料
      residue: [],
      residueForm: {
        name: "余料1",
        rid: "",
        width: null,
        height: null,
        x: null,
        y: null,
        quantity: 1,
        weight: 18,
        color: "",
      },

      // 所有的材料
      rectangles: [],

      drillWidth: 0,

      sLoading: false,

      tab: 0,
      values: ["原料尺寸", "余料尺寸", "设置"],

      weightList: [
        {name: "9", value: 9},
        {name: "17", value: 17},
        {name: "18", value: 18},
      ],

      // 排版记录
      boardRecord: [],

      // 外部更新的阀门
      isExternalUpdatesFlag: false,
      // 内部向外部更新数据的阀门
      isToOutsideFlag: false,

      takeOverName: "",
      ScrollTop: 0,

      // 在表格内编辑封边跟圆角
      isTableEdit: false,
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
      deep: true,
    },
    value: {
      handler(to, form) {
        if (!_isEqual(to, form) && !this.isToOutsideFlag) {
          this.isExternalUpdatesFlag = true;
          this.setTakeValue(this.value);
        }
      },
      deep: true,
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
      const pType = this.pType;

      // 添加板材
      if (_isEqual(pType, "vessel")) {
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
      if (_isEqual(pType, "angle") || _isEqual(pType, "editor")) {
        let index = null;

        // #ifndef H5
        index = this.node.index;
        // #endif

        // #ifdef H5
        index = this.nodeIndex;
        // #endif

        if (index > -1) {
          this.$set(this.rectangles, index, {
            ...F,
            edges: F.edges?.map?.(_toFinite),
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

      // 添加材料
      if (_isEqual(pType, "addedStuff")) {
        const wrap = _deepCopy(this.formData);

        if (!F.color) {
          CustomToast({
            title: "请输入材料颜色",
            icon: "none",
          });
          return false;
        }

        if (_toFinite(F.width) > 0 && _toFinite(F.height) > 0) {
          if (F.width > wrap.width || F.height > wrap.height) {
            CustomToast({
              title: "添加的板块过大，请修改宽高。",
              icon: "none",
            });
            return false;
          }

          const obj = {
            ...F,
            width: _toFinite(F.width),
            height: _toFinite(F.height),
            weight: _toFinite(F.weight),
            quantity: _toFinite(F.quantity),
            edges: F.edges?.map?.(_toFinite),
            radius: F.radius?.map(_toFinite) || [],
            rid: _generateUUID(),
          };

          this.rectangles.push(obj);

          this.form = {
            ...F,
            ..._pick(_deepCopy(this.$options.data().itemsForm), ["radius", "angleType", "edges", "straight"]),
          };

          this.ScrollTop = (this.rectangles.length * 40) + 99;

          CustomToast({
            title: "材料添加成功",
            icon: "none",
          });
        } else {
          CustomToast({
            title: "请检查输入的宽高",
            icon: "none",
          });
        }
      }

      // 添加余料
      if (_isEqual(pType, "addedResidue")) {

        if (!F.color) {
          CustomToast({
            title: "请输入余料颜色",
            icon: "none",
          });
          return false;
        }

        if (_toFinite(F.width) > 0 && _toFinite(F.height) > 0) {
          this.residue.push({
            ...F,
            height: _toFinite(F.height),
            width: _toFinite(F.width),
            weight: _toFinite(F.weight),
            quantity: _toFinite(F.quantity),
            rid: _generateUUID(),
          });
          CustomToast({
            title: "余料添加成功",
            icon: "none",
          });
        } else {
          CustomToast({
            title: "请检查输入的余料宽高",
            icon: "none",
          });
        }
      }

      // 编辑余料
      if (_isEqual(pType, "editResidue")) {
        let index = null;

        // #ifndef H5
        index = this.node.index;
        // #endif

        // #ifdef H5
        index = this.nodeIndex;
        // #endif

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
      this.pType = "addedStuff";
      this.form = {..._deepCopy(this.itemsForm)};
      this.visible = true;

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
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
    editRectangle(item, index) {
      this.pType = "editor";
      const node = _deepCopy(this.node);
      this.visible = true;

      // #ifdef H5
      this.form = _deepCopy(item);
      this.nodeIndex = index;
      // #endif

      // #ifndef H5
      this.form = {...node.item};
      // #endif

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 删除材料
    removeRectangle(item, ind) {
      let index = null;
      // #ifndef H5
      const node = _deepCopy(this.node);
      index = node.index;
      // #endif

      // #ifdef H5
      this.node = _deepCopy(item);
      this.nodeIndex = ind;
      index = ind;
      // #endif

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
          ...item,
          rid: item.rid,
          width: width + drillWidth - (LR * edgeWidth),
          height: height + drillWidth - (WH * edgeWidth),
          weight: item.weight,
          x: item.x,
          y: item.y,
          color: item.color,
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
        const obj = _deepCopy(this.value) || {};

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
          ...obj,
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
        this.rectangles = items || [];
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
      this.pType = "addedResidue";
      this.form = {..._deepCopy(this.residueForm)};
      this.visible = true;

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 修改余料
    editResidue(item, index) {
      this.pType = "editResidue";
      const node = _deepCopy(this.node);
      this.visible = true;

      // #ifdef H5
      this.nodeIndex = index;
      this.form = {...item};
      // #endif

      // #ifndef H5
      this.form = {...node.item};
      // #endif

      // #ifdef MP
      this.$refs.FormRef.clearValidate();
      // #endif
    },

    // 删除余料
    removeResidue(node, index) {
      let i = null;

      // #ifdef H5
      i = index;
      // #endif

      // #ifndef H5
      i = this.node.index;
      // #endif

      if (i > -1) {
        this.residue.splice(i, 1);
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

    // 跳转到产品选择页面
    onJumpPickerProduct() {
      uni.navigateTo({
        url: PageEnums.pickerProduct,
        // #ifdef MP
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          on_take_over: (obj) => {
            this.getTakList(obj);
          },
        },
        // #endif
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("on_to_take_over", {
            isSelect: true, // 选择模式
            takeOverName: this.takeOverName,
            type: "null",
          });
        },
      });
    },

    // 外部传入的数据
    getTakList(event) {
      const color = _get(event, "checked.0.name");

      if (!this.visible) {
        if (_isEqual(this.tab, 0)) {
          this.$set(this.rectangles[this.H5TableIndex], "color", color);
        }

        if (_isEqual(this.tab, 1)) {
          this.$set(this.residue[this.H5TableIndex], "color", color);
        }
      }

      this.form.color = color;
    },

    // 开启选择名称
    onPickName() {
      this.$refs.NRef.open();
    },

    // 选中材料的名称
    onSelectName(item) {
      this.form.name = _deepCopy(item.name);
    },

    // 添加行
    onAddedRow() {
      const at = _deepCopy(this.rectangles.at(-1)) || {};
      this.rectangles.push({..._deepCopy(this.itemsForm), ..._pick(at, ["color", "name"])});
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
        editResidue: "编辑余料",
        addedStuff: "添加材料",
        addedResidue: "添加余料",
      }[this.pType];
    },
    // 获取弹窗底部按钮文本
    getPopupButtonText() {
      return {
        vessel: "添加",
        addedChild: "添加",
        addedStuff: "添加",
        editor: "确定",
        angle: "确定",
        editResidue: "确定",
        addedResidue: "添加",
      }[this.pType];
    },
    // 获取弹窗类型
    getPopupType() {
      let type = ["editor", "addedStuff", "addedResidue", "editResidue"].includes(this.pType) ? "bottom" : "center";

      // #ifdef H5
      type = "center";
      // #endif
      return type;
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
      const col = [
        {
          label: "名称",
          prop: "name",
          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.name);
            return h(
              Input,
              {
                style: {width: "100%"},
                props: {
                  value: row.name,
                },
                on: {
                  input: (val) => {
                    this.$set(row, "name", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "宽",
          prop: "width",
          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.width);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.width,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "width", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "高",
          prop: "height",
          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.height);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.height,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "height", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "厚",
          prop: "weight",
          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return row.weight;
            return h(Select, {
                props: {
                  value: row.weight,
                },
                on: {
                  change: (val) => {
                    this.$set(row, "weight", val);
                  },
                },
              },
              this.weightList.map(item => h(Option, {props: {value: item.value, label: item.name}})),
            );
          },
          // #endif
        },
        {
          label: "数量",
          prop: "quantity",
          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.quantity);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.quantity,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "quantity", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "颜色",
          prop: "color",
          // #ifdef H5
          render: (h, {row, index}) => {
            if (this.readonly) return h("span", row.color);

            return h(
              Button,
              {
                props: {
                  type: "text",
                },
                on: {
                  click: () => {
                    this.H5TableIndex = index;
                    this.onJumpPickerProduct();
                  },
                },
              },
              [row.color],
            );
          },
          // #endif
        },
        {
          label: "操作",
          type: "more",
          prop: "More",
          // #ifdef H5
          slot: "operate",
          // #endif
        },
      ];

      return col.filter(v => this.readonly ? v.prop !== "More" : true);
    },

    // 获取表头
    getColumns() {
      let operateWidth = 70;

      // #ifdef H5
      operateWidth = 130;
      // #endif

      const col = [
        {
          label: "序号",
          type: "index",
          prop: "_index_",
          width: 60,
        },
        {
          label: "名称",
          prop: "name",
          // #ifndef H5
          width: 100,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.name);
            return h(
              Input,
              {
                style: {width: "100%"},
                props: {
                  value: row.name,
                },
                on: {
                  input: (val) => {
                    this.$set(row, "name", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "宽",
          prop: "width",
          // #ifndef H5
          width: 50,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.width);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.width,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "width", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "高",
          prop: "height",
          // #ifndef H5
          width: 50,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.height);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.height,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "height", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "厚",
          prop: "weight",
          // #ifndef H5
          width: 50,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return row.weight;
            return h(Select, {
                props: {
                  value: row.weight,
                },
                on: {
                  change: (val) => {
                    this.$set(row, "weight", val);
                  },
                },
              },
              this.weightList.map(item => h(Option, {props: {value: item.value, label: item.name}})),
            );
          },
          // #endif
        },
        {
          label: "数量",
          prop: "quantity",
          // #ifndef H5
          width: 50,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.quantity);

            return h(
              InputNumber,
              {
                style: {width: "100%"},
                props: {
                  value: row.quantity,
                  min: 0,
                  "controls-position": "right",
                },
                on: {
                  change: (val) => {
                    this.$set(row, "quantity", val);

                  },
                },
              },
            );
          },
          // #endif
        },
        {
          label: "颜色",
          prop: "color",
          width: 130,

          // #ifdef H5
          render: (h, {row, index}) => {
            if (this.readonly) return h("span", row.color);

            return h(
              Button,
              {
                props: {
                  type: row.color ? "text" : "primary",
                  ...(row.color ? {} : {size: "mini"}),
                },
                class: "ko-bin-packing__color",
                on: {
                  click: () => {
                    this.H5TableIndex = index;
                    this.onJumpPickerProduct();
                  },
                },
              },
              [row.color || "选择颜色"],
            );
          },
          // #endif
        },
        {
          label: "封边(左)",
          prop: "edges.0",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", [_get(row, "edges.0")]);

            return h(
              Popover,
              [
                h(Button,
                  {
                    props: {type: "text"},
                    slot: "reference",
                  },
                  [_get(row, "edges.0")]),

                h(EdgeBanding, {
                  props: {
                    value: _deepCopy(row),
                    formData: this.formData,
                  },
                  style: {
                    padding: "40px 160px",
                  },
                  on: {
                    input: (val) => {
                      for (const key in val) {
                        this.$set(row, key, val[key]);
                      }
                    },
                  },
                }),
              ],
            );
          },
          // #endif
        },
        {
          label: "封边(右)",
          prop: "edges.1",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif


          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", [_get(row, "edges.1")]);

            return h(
              Popover,
              [
                h(Button,
                  {
                    props: {type: "text"},
                    slot: "reference",
                  },
                  [_get(row, "edges.1")]),

                h(EdgeBanding, {
                  props: {
                    value: _deepCopy(row),
                    formData: this.formData,
                  },
                  style: {
                    padding: "40px 160px",
                  },
                  on: {
                    input: (val) => {
                      for (const key in val) {
                        this.$set(row, key, val[key]);
                      }
                    },
                  },
                }),
              ],
            );
          },
          // #endif
        },
        {
          label: "封边(前)",
          prop: "edges.2",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", [_get(row, "edges.2")]);

            return h(
              Popover,
              [
                h(Button,
                  {
                    props: {type: "text"},
                    slot: "reference",
                  },
                  [_get(row, "edges.2")]),

                h(EdgeBanding, {
                  props: {
                    value: _deepCopy(row),
                    formData: this.formData,
                  },
                  style: {
                    padding: "40px 160px",
                  },
                  on: {
                    input: (val) => {
                      for (const key in val) {
                        this.$set(row, key, val[key]);
                      }
                    },
                  },
                }),
              ],
            );
          },
          // #endif
        },
        {
          label: "封边(背)",
          prop: "edges.3",
          type: "number",
          // #ifndef H5
          width: 70,
          // #endif

          // #ifdef H5
          render: (h, {row}) => {
            if (this.readonly) return h("span", [_get(row, "edges.3")]);

            return h(
              Popover,
              [
                h(Button,
                  {
                    props: {type: "text"},
                    slot: "reference",
                  },
                  [_get(row, "edges.3")]),

                h(EdgeBanding, {
                  props: {
                    value: _deepCopy(row),
                    formData: this.formData,
                  },
                  style: {
                    padding: "40px 160px",
                  },
                  on: {
                    input: (val) => {
                      for (const key in val) {
                        this.$set(row, key, val[key]);
                      }
                    },
                  },
                }),
              ],
            );
          },
          // #endif
        },
        {
          label: "纹理",
          prop: "texture",
          type: "checkbox",
          // #ifndef H5
          width: 50,
          // #endif
          // #ifdef H5
          render(h, {row}) {
            return h(Checkbox, {props: {disabled: true, value: row.texture}});
          },
          // #endif
        },
        {
          label: "转90度",
          prop: "rotate",
          type: "checkbox",
          // #ifndef H5
          width: 70,
          // #endif
          // #ifdef H5
          render(h, {row}) {
            return h(Checkbox, {props: {disabled: true, value: row.rotate}});
          },
          // #endif
        },
        {
          label: "操作",
          type: "more",
          prop: "More",

          width: operateWidth,

          // #ifdef H5
          slot: "operate",
          // #endif
        },
      ];

      return col.filter(v => this.readonly ? v.prop !== "More" : true);
    },

    // 获取单元格的分配
    getGridTemplateColumnsStyle() {
      return {
        "--ko-basic-table-grid-col": "30px auto auto auto 40px 40px",
      };
    },

    // 快捷名称
    getNameList() {
      return `主卧衣柜，次卧衣柜，酒柜，鞋柜，儿童房衣柜，长辈房衣柜`.split("，").map(name => ({name}));
    },
  },
  created() {
    this.takeOverName = `$_on_tak_over_${this._uid}`;
    uni.$on(this.takeOverName, this.getTakList);
  },

  beforeDestroy() {
    uni.$off(this.takeOverName, this.getTakList);
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
        <view class="ko-basic__content">
          <uni-row :gutter="10">
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
        </view>

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
              no-padding-bottom
            >
              <template #operate="{item, index}">
                <view style="display: flex; align-items: center;justify-content: center;">
                  <button class="ko-basic-button__card" @click.stop="editRectangle(item, index)">修改</button>
                  <button class="ko-basic-button__card" @click.stop="removeRectangle(item, index)">删除</button>
                </view>
              </template>
            </KoTable>

            <view
              @click.stop="onAddedRow"
              style="display: flex; align-items: center; justify-content: flex-end; padding: 10px;"
            >
              <button class="ko-basic-button__card">添加行</button>
            </view>
            <!-- #endif -->
          </view>


        </uni-section>

        <view class="ko-bin__added" v-if="!readonly">
          <button
            class="ko-basic-button__card"
            @click="onSubmitCustomized"
            :disabled="sLoading"
            :loading="sLoading"
            v-if="isPerm('CNC_CUSTOMIZED_BOARD_CALCULATE')"
          >
            {{ sLoading ? "计算中..." : "开始计算" }}
          </button>
          <button class="ko-basic-button__card" @click="onAddedRectangle">
            添加
          </button>
        </view>

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
          <!-- #ifndef H5 -->
          <GridTable
            :columns="getResidueColumns"
            :data="residue"
            @click-more="onClickResidueMore"
            not-edit
            :no-more="!residue.length"
          />
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <KoTable
            :columns="getResidueColumns"
            :data="residue"
          >
            <template #operate="{item, index}">
              <view style="display: flex; align-items: center;justify-content: center;">
                <button class="ko-basic-button__card" @click.stop="editResidue(item, index)">修改</button>
                <button class="ko-basic-button__card" @click.stop="removeResidue(item, index)">删除</button>
              </view>
            </template>
          </KoTable>
          <!-- #endif -->
        </view>

        <view class="ko-bin__added" v-if="!readonly">
          <button class="ko-basic-button__card" @click="onAddedResidue">
            添加
          </button>
        </view>
      </block>

      <!-- 设置 -->
      <block v-if="isEqual(tab, 2)">
        <view class="ko-basic__content">
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
          </uni-row>
        </view>
      </block>
    </view>

    <KoMovable v-if="false" :y-axis="-60" @click="onAdded('vessel')" />

    <BasicPopup
      :visible.sync="visible"
      :title="getPopupTitle"
      :type="getPopupType"
      @close="isTableEdit = false"
    >
      <view class="ko-bin__popup" :class="[getPopupType]">

        <!-- #ifndef H5 -->
        <block v-if="['addedStuff'].includes(pType)">
          <scroll-view
            scroll-y="true"
            :style="[getGridTemplateColumnsStyle]"
            class="ko-bin__popup--table"
            :scroll-top="ScrollTop"
          >
            <view class="ko-basic-table">
              <block v-for="(item, index) of rectangles" :key="item.rid">
                <view class="ko-basic-table--cell">
                  {{ index + 1 }}
                </view>
                <view class="ko-basic-table--cell">
                  {{ item.name }}
                </view>
                <view class="ko-basic-table--cell">
                  {{ item.width }}
                </view>
                <view class="ko-basic-table--cell">
                  {{ item.height }}
                </view>
                <view class="ko-basic-table--cell">
                  {{ item.weight }}
                </view>
                <view class="ko-basic-table--cell">
                  {{ item.quantity }}
                </view>
              </block>
            </view>
          </scroll-view>
        </block>
        <!-- #endif -->

        <view>
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

            <!-- 材料 -->
            <block v-else-if="['editor', 'addedStuff'].includes(pType)">
              <uni-row :gutter="0" v-if="!isTableEdit">
                <uni-col :span="24">
                  <uni-forms-item label="名称" label-width="70" name="name">
                    <uni-easyinput v-model="form.name" placeholder="请输入" />
                    <button style="margin-left: 10px;" class="ko-basic-button__card" @click.stop="onPickName">
                      选择
                    </button>
                  </uni-forms-item>
                </uni-col>
                <uni-col :span="24">
                  <view style="display:flex; align-items: center; justify-content: space-between; overflow: hidden;">
                    <uni-forms-item label="数量" label-width="70" name="quantity">
                      <uni-number-box type="digit" v-model="form.quantity" />
                    </uni-forms-item>
                    <uni-forms-item label="纹理" label-width="70" name="texture">
                      <UvCheckbox :size="28" is-alone v-model="form.texture" />
                    </uni-forms-item>
                    <uni-forms-item label="转90度" label-width="70" name="rotate">
                      <UvCheckbox :size="28" is-alone v-model="form.rotate" />
                    </uni-forms-item>
                  </view>
                </uni-col>
                <uni-col :span="24">
                  <view style="display:flex; align-items: center; justify-content: center;">
                    <uni-forms-item label="颜色" required label-width="70" name="color">
                      <view style="display: flex; align-items: center; overflow: hidden; width: 100%">
                        <uni-easyinput v-model="form.color" placeholder="请输入" />
                        <button
                          @click="onJumpPickerProduct"
                          style="margin-left: 8px;"
                          class="ko-basic-button__card"
                        >
                          选择
                        </button>
                      </view>
                    </uni-forms-item>
                  </view>
                </uni-col>
                <uni-col :span="24">
                  <view style="display:flex; align-items: center; justify-content: center; overflow: hidden;">
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" required name="width">
                        <uni-easyinput type="digit" v-model="form.width" placeholder="请输入" />
                      </uni-forms-item>
                    </view>
                    <view style="margin: 0 5px 20px">
                      ×
                    </view>
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" name="height">
                        <uni-easyinput type="digit" v-model="form.height" placeholder="请输入" />
                      </uni-forms-item>
                    </view>
                    <view style="margin: 0 5px 20px">
                      ×
                    </view>
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" name="weight">
                        <PickerSheet
                          :options="weightList"
                          v-model="form.weight"
                        />
                      </uni-forms-item>
                    </view>
                  </view>
                </uni-col>
              </uni-row>

              <view class="ko-bin__edge">
                <EdgeBanding v-model="form" :form-data="formData" />
              </view>
            </block>

            <!-- 余料 -->
            <block v-else-if="['editResidue', 'addedResidue'].includes(pType)">
              <uni-row :gutter="0">
                <uni-col :span="24">
                  <uni-forms-item label="名称" label-width="70" name="name">
                    <uni-easyinput v-model="form.name" placeholder="请输入" />
                  </uni-forms-item>
                </uni-col>
                <uni-col :span="24">
                  <view style="display: flex;align-items: center;overflow: hidden">
                    <view style="flex: 1;">
                      <uni-forms-item label="数量" label-width="70" name="quantity">
                        <uni-number-box type="digit" v-model="form.quantity" />
                      </uni-forms-item>
                    </view>
                    <view style="width: 20rpx;"></view>
                    <view style="flex: 1;">
                      <uni-forms-item label="颜色" required label-width="70" name="color">
                        <uni-easyinput v-model="form.color" placeholder="请输入" />
                        <button
                          @click="onJumpPickerProduct"
                          style="margin-left: 8px;"
                          class="ko-basic-button__card"
                        >
                          选择
                        </button>
                      </uni-forms-item>
                    </view>
                  </view>
                </uni-col>
                <uni-col :span="24">
                  <view style="display:flex; align-items: center; justify-content: center; overflow: hidden;">
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" required name="width">
                        <uni-easyinput type="digit" v-model="form.width" placeholder="请输入" />
                      </uni-forms-item>
                    </view>
                    <view style="margin: 0 5px 20px">
                      ×
                    </view>
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" name="height">
                        <uni-easyinput type="digit" v-model="form.height" placeholder="请输入" />
                      </uni-forms-item>
                    </view>
                    <view style="margin: 0 5px 20px">
                      ×
                    </view>
                    <view style="flex: 1;">
                      <uni-forms-item label-width="0" name="weight">
                        <PickerSheet
                          :options="weightList"
                          v-model="form.weight"
                        />
                      </uni-forms-item>
                    </view>
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
      </view>
      <template #footer>
        <view class="ko-bin__popup--footer" :class="getPopupType">
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

    <uv-popup ref="PRef" mode="bottom" round="10" :close-on-click-overlay="false" :adjustPosition="false">
      <view class="ko-bin__com">
        <Composing
          :data="boardRecord"
          :form="formData"
          :win-width="winWidth"
          @close="onClose"
          :rectangles="rectangles"
          :residue="residue"
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

    <uv-action-sheet
      ref="NRef"
      :actions="getNameList"
      @select="onSelectName"
      round="10"
      cancel-text="取消"
    />
  </view>
</template>

<style lang="scss">
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
      // #ifdef H5
      position: relative;
      width: 90vw;
      left: 50%;
      transform: translateX(-50%);
      margin: 0 auto;


      ::v-deep .el-table .cell {
        padding-left: 0;
        padding-right: 0;
      }

      ::v-deep .el-input-number.is-controls-right .el-input__inner {
        padding-left: 4px;
        padding-right: 30px;
      }

      ::v-deep .el-input-number__decrease, ::v-deep .el-input-number__increase {
        width: 26px;
      }

      // #endif
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
    width: 100vw;

    &.bottom {
      width: 100%;
      height: 78vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    &--table {
      flex: 1;
      margin-bottom: 10px;
      overflow-y: auto;

      ::v-deep .ko-basic-table--cell {
        padding: 4px 4px;
      }
    }

    // #endif

    // #ifdef H5
    width: 600px;

    ::v-deep .uni-forms .uni-forms-item .uni-forms-item__content {
      width: auto !important;
    }

    // #endif

    &--footer {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 10px 10px 12px;

      .ko-basic-button__card {
        width: 100px;
      }
    }
  }

  &__com {
    height: 94vh;
    // #ifdef MP
    width: 100vw;
    // #endif
  }

  &__edge {
    padding: 20px 0 40px;
  }

  // #ifdef H5
  .ko-basic__content {

    .ko-basic-label {
      white-space: nowrap;
      margin-right: 10px;
    }
  }

  ::v-deep .uv-popup__content.bottom {
    width: 1024px;
    margin: 0 auto;
  }

  ::v-deep .ko-bin-packing__color {
    white-space: wrap;
    line-height: 1.3;
  }

  // #endif
}
</style>
