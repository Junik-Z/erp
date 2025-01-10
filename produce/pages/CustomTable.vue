<script>
import GridTable from "../components/GridTable/GridTable.vue";
import KoMovable from "@/components/Movable/index.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import { _deepCopy, _get, _isEqual, _pick } from "@/utils";

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

export default {
  name: "CustomTable",
  components: {KoMovable, GridTable, UvActionSheet, UniNumberBox},
  data() {
    return {
      columns: [
        {
          label: "姓名",
          prop: "name",
        },
        {
          label: "年龄",
          prop: "age",
        },
        {
          label: "技能",
          prop: "zy",
        },
      ],
      list: [
        {
          name: {
            value: "张三",
            colspan: 0,
            rowspan: 0,
          },
          age: {
            value: 18,
            colspan: 0,
            rowspan: 0,
          },
          zy: {
            value: "踢足球，倒挂金钩！",
            colspan: 0,
            rowspan: 0,
          },
        },
      ],

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
    };
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
      this.list.push(obj);
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
        const prop = flag ? `column${this.columns.length}.value` : (node.prop || `column${this.columns.length}.value`);

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
      const node = _pick(_deepCopy(this.form), ["value", "colspan", "rowspan"]);
      const {column, columnIndex} = this.pressParams;

      this.$set(this.list[columnIndex], column.prop, node);

      this.visible = false;
    },

    // 长按
    onLongPress(event) {
      const p = _deepCopy(event.params);
      this.pressParams = p;

      console.log(p);
    },
    // 短按
    onPress(event) {
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
  },

  computed: {
    ActionList() {
      return {
        added: [
          {
            name: "添加列",
            func: "onAddedColumn",
          },
          {
            name: "添加行",
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
  },
};
</script>

<template>
  <view class="ko-custom-table">
    <GridTable
      :columns="columns"
      :data="list"
      @long-press="onLongPress"
      @press="onPress"
    />

    <KoMovable :y-axis="-60" @click="onOpenSheet('added')" />

    <UvActionSheet
      ref="UASRef"
      :actions="ActionList"
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelectSheet"
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
            <uni-forms-item label="显示内容">
              <uni-easyinput v-model.trim="form.value" placeholder="请输入显示内容" />
            </uni-forms-item>
            <uni-forms-item label="向下合并">
              <UniNumberBox v-model.trim="form.rowspan" placeholder="请输入" />
            </uni-forms-item>
            <uni-forms-item label="向右合并">
              <UniNumberBox v-model.trim="form.colspan" placeholder="请输入" />
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
