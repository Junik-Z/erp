<script>
/* #ifdef H5 */
import H5Table from "@/produce/components/H5Table.vue";
/* #endif */
import GridTable from "../components/GridTable/GridTable.vue";
import KoMovable from "@/components/Movable/index.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import { _debounce, _deepCopy, _generateUUID, _get, _isEmpty, _isEqual, _pick, _set } from "@/utils";

const PopupEnum = {
  addedColumn: {
    title: "添加列",
    button: "添加",
    func: "onNewColumn",
  },
  editColumn: {
    title: "编辑表头",
    button: "确定",
    func: "onNewColumn",
  },
  editCell: {
    title: "编辑单元格内容",
    button: "确定",
    func: "onNewCell",
  },
};

const columns = [];

for (let i = 0; i < 6; i++) {
  columns.push({
    label: "",
    prop: _generateUUID(),
  });
}

const DefaultList = [];

for (let i = 0; i < 10; i++) {
  const obj = {};
  DefaultList.push(obj);
}

export default {
  name: "CustomTable",
  components: {
    // #ifdef H5
    H5Table,
    // #endif

    KoMovable,
    GridTable,
    UvActionSheet,
    UniNumberBox,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    readonly: Boolean,
  },
  data() {
    return {
      columns: _deepCopy(columns),
      list: _deepCopy(DefaultList),

      // 动作类型：added: 添加新组件；
      sheetType: "added",

      visible: false,
      // 弹窗类型
      popupType: "addedColumn",

      pLoading: false,

      // 表格点击事件的参数
      pressParams: null,

      form: {
        label: "",
        value: "",
        colspan: 0,
        rowspan: 0,
      },

      // 外部更新的阀门
      isExternalUpdatesFlag: false,
      // 内部向外部更新数据的阀门
      isToOutsideFlag: false,
    };
  },
  watch: {
    changeData: {
      handler() {
        if (this.isExternalUpdatesFlag) return false;
        this.isToOutsideFlag = true;
        this.emitValue();
      },
      deep: true,
    },

    value: {
      handler() {
        if (this.isToOutsideFlag) return false;
        this.isExternalUpdatesFlag = true;
        this.takeValue();
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    // 开启动作面板
    onOpenSheet(type) {
      this.sheetType = type;
      this.$refs.UASRef.open();
    },

    // 选中动作
    onSelectSheet(item) {
      this[item.func]?.(...(item.params || []));
    },

    // 添加列
    onAddedColumn() {
      this.popupType = "addedColumn";
      this.form = {label: ""};
      this.visible = true;

      // #ifdef MP
      this.$nextTick(() => {
        this.$refs.FormRef.clearValidate();
      });
      // #endif
    },

    // 添加行
    onAddedRow() {
      const obj = {};
      this.columns.forEach(item => {
        if (item.prop) {
          obj[item.prop] = "";
        }
      });
      console.log(obj);
      // this.list.push(obj);
    },

    // 添加编辑列头
    onNewColumn() {
      const node = _pick(_deepCopy(this.form), ["label", "prop"]);

      if (!node.label) {
        this.visible = false;
        return false;
      }

      // flag: 强制替换原有的 prop
      const onReplace = (flag) => {
        const prop = flag ? `column${this.columns.length}` : (node.prop || `column${this.columns.length}`);

        // 修改
        if (_isEqual("editColumn", this.popupType)) {
          const {column, columnIndex} = this.pressParams;
          this.$set(this.columns, columnIndex, {...column, ...node});
        } else {
          this.columns.push({
            ...node,
            prop,
          });
        }

        this.visible = false;
      };

      if (this.columns.some(v => _isEqual(v.label, node.label))) {
        uni.showModal({
          title: "温馨提示",
          content: `表格已存在${node.label}，是否继续保存？`,
          success: (res) => {
            if (res.confirm) {
              onReplace(true);
            }
          },
        });
      } else {
        onReplace(false);
        this.visible = false;
      }
    },

    // 确认单元格内容
    onNewCell() {
      const node = _pick(_deepCopy(this.form), ["colspan", "rowspan"]);
      const {column, columnIndex, row, rowIndex} = this.pressParams;
      const config = _get(row, `_config_.${column.prop}`);

      _set(row, `_config_.${column.prop}`, {...config, ...node});

      this.$set(this.list, rowIndex, row);
      this.visible = false;
    },

    // 长按
    onLongPress(event) {
      if (this.readonly) return;

      const p = _deepCopy(event.params);
      this.pressParams = p;
      const {type, column, columnIndex, row, rowIndex} = p;

      // 点击表体时触发
      if (_isEqual(type, "tbody")) {
        this.popupType = "editCell";
        const config = _get(row, `_config_.${column.prop}`);
        this.form = {colspan: 0, rowspan: 0, ...(config || {})};
        this.visible = true;
        // #ifdef MP
        this.$nextTick(() => {
          this.$refs.FormRef.clearValidate();
        });
        // #endif
      }
    },
    // 短按
    onPress(event) {
      if (event) return false;

      const p = _deepCopy(event.params);
      this.pressParams = p;

      // 点击表头时触发
      if (_isEqual(p.type, "thead")) {
        this.popupType = "editColumn";
        this.form = p.column;
        this.visible = true;
        // #ifdef MP
        this.$nextTick(() => {
          this.$refs.FormRef.clearValidate();
        });
        // #endif
      }

      // 点击表头时触发
      if (_isEqual(p.type, "tbody")) {
        this.popupType = "editCell";
        this.form = {value: "", colspan: 0, rowspan: 0, ...(p.row[p.column.prop] || {})};
        this.visible = true;
        // #ifdef MP
        this.$nextTick(() => {
          this.$refs.FormRef.clearValidate();
        });
        // #endif
      }
    },

    // 处理点击弹窗的确认按钮
    onClickPopupButton() {
      this[this.getPopupButtonFuncName]?.();
    },

    // 修改表头的值
    onChangeThead({columnIndex, value}) {
      if (this.readonly) return;
      this.$set(this.columns[columnIndex], "label", value);
    },

    // 修改表体的值
    onChangeTbody({column, value, row, index}) {
      _set(row, column.prop, value);
      this.$set(this.list, index, row);
    },

    watchChangeData: _debounce(function () {
      this.emitValue();
    }, 800),

    // 处理更新数据
    emitValue() {
      this.$emit("input", JSON.stringify({columns: this.columns, list: this.list?.filter(item => !_isEmpty(item))}));
      setTimeout(() => {
        this.isToOutsideFlag = false;
      }, 600);
    },

    // 处理接收数据
    takeValue() {
      if (this.value) {
        try {
          const {columns, list} = _deepCopy(JSON.parse(this.value));
          this.list = DefaultList.map((v, i) => list[i] || {});
          this.columns = columns;
        } catch (e) {
          console.log(e, "解析报错了");
        }
      }

      setTimeout(() => {
        this.isExternalUpdatesFlag = false;
      }, 600);
    },
  },
  computed: {
    // 动作面板
    ActionList() {
      return {
        added: [
          {
            name: "添加列",
            func: "onAddedColumn",
          },
          {
            name: "添加行",
            disabled: !this.columns.length,
            func: "onAddedRow",
          },
        ],
      }[this.sheetType];
    },
    // 获取弹窗的title
    getPopupTitle() {
      return _get(PopupEnum, `${this.popupType}.title`);
    },
    // 获取弹窗确定按钮的文本
    getPopupButtonText() {
      return _get(PopupEnum, `${this.popupType}.button`);
    },
    // 获取弹窗确定按钮的方法
    getPopupButtonFuncName() {
      return _get(PopupEnum, `${this.popupType}.func`);
    },

    // 监听数据变化
    changeData() {
      return [...this.columns, ...this.list];
    },

    // 序号
    getColumns() {
      return [{label: "序号", type: "index", prop: "Index"}, ...this.columns];
    },
  },
};
</script>

<template>
  <view class="ko-custom-table">

    <!-- #ifdef H5 -->
    <H5Table
      :columns.sync="columns"
      :data.sync="list"
      :readonly="readonly"
    />
    <!-- #endif -->


    <!-- #ifndef H5 -->
    <GridTable
      :columns="getColumns"
      :data="list"
      @long-press="onLongPress"
      @press="onPress"
      @change-thead="onChangeThead"
      @change-tbody="onChangeTbody"
      :not-edit="readonly"
    />
    <!-- #endif -->

    <view v-if="!columns.length || !list.length" class="ko-custom-table__not">
      {{ !columns.length ? "请先添加列" : !list.length ? "请添加行" : "" }}
    </view>

    <KoMovable v-if="false" :y-axis="-60" @click="onOpenSheet('added')" />

    <UvActionSheet
      ref="UASRef"
      :actions="ActionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelectSheet"
      v-if="false"
    />

    <BasicPopup :visible.sync="visible" :title="getPopupTitle">
      <view class="ko-ct__popup">
        <uni-forms label-align="right" ref="FormRef" :model="form">
          <block v-if="['addedColumn', 'editColumn'].includes(popupType)">
            <uni-forms-item label="名称" required>
              <uni-easyinput v-model.trim="form.label" placeholder="请输入列名称" />
            </uni-forms-item>
          </block>

          <block v-if="['editCell'].includes(popupType)">
            <uni-forms-item label="显示内容" v-if="false">
              <uni-easyinput v-model.trim="form.value" placeholder="请输入显示内容" />
            </uni-forms-item>
            <uni-forms-item label="向下合并">
              <UniNumberBox :width="100" v-model.trim="form.rowspan" placeholder="请输入" />
            </uni-forms-item>
            <uni-forms-item label="向右合并">
              <UniNumberBox :width="100" v-model.trim="form.colspan" placeholder="请输入" />
            </uni-forms-item>
          </block>

        </uni-forms>
      </view>
      <template #footer>
        <view class="ko-ct__popup--footer ko-basic-box-shadow__top">
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
  </view>
</template>

<style scoped lang="scss">
.ko-custom-table {
  width: 100%;

  &__not {
    padding: 60px 0;
    text-align: center;
    font-size: 12px;
    color: #c7c9ce;
  }
}

.ko-ct {
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
