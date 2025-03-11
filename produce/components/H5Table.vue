<script>
import PrintFooter from "@/shop/print/components/PrintFooter.vue";
import PrintTable from "@/shop/print/components/PrintTable.vue";
import PrintHeader from "@/shop/print/components/PrintHeader.vue";
import mixins from "@/mixins/mixins";
import { Col, Input, Row } from "@/uni_modules/element-ui/element.min";
import PickerUser from "@/components/PickerUser/PickerUser.vue";
import { _deepCopy, _generateUUID, _get, _isEmpty, _isEqual, _isNotUnNil, _pick, _set, CustomToast } from "@/utils";
import { calculateCoveredCoordinatesByRow } from "@/produce/pages/calculate";

export default {
  name: "H5Table",
  components: {PrintHeader, PrintTable, PrintFooter, Col, Row, Input, PickerUser},
  mixins: [mixins],
  props: {
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    minColumns: {
      type: Number,
      default: 5,
    },
    minRow: {
      type: Number,
      default: 10,
    },
    readonly: Boolean,
  },
  data() {
    return {
      form: {},

      EditObj: {},

      CMPage: {
        pageX: 0,
        pageY: 0,
      },
      visibleCM: false,

      isCMHead: false,

      // 选中的列 prop
      property: "",
      // 右键菜单的行索引
      rowIndex: 0,

      hidepos: [],
    };
  },
  methods: {
    // 渲染表头
    renderHeader(h, {column, $index}) {
      const isEdit = _get(this.EditObj, column.id);

      if (isEdit) {
        let index = $index - 1;
        if (index < 0) index = 0;

        if (_isEmpty(this.modelColumns[index])) this.$set(this.modelColumns, index, {label: "", prop: _generateUUID()});

        setTimeout(() => {
          try {
            document.querySelector(`.${column.id} .el-textarea__inner`).focus();
          } finally {
          }
        }, 100);

        return h(Input, {
          props: {
            value: _get(this.modelColumns, `${index}.label`),
            placeholder: "请输入",
            type: "textarea",
            autosize: true,
            resize: "none",
          },
          on: {
            input: (value) => {
              this.$set(this.modelColumns[index], "label", value);
            },
          },
        });
      }

      return h("div", {class: "ko-table__cell"}, [column.label]);
    },
    // 渲染单元格
    renderCell(h, {column, row, index, columnIndex}) {
      const editId = `${column.id}__id__${row.__table_UUID__}`;

      const isEdit = _get(this.EditObj, editId);

      if (isEdit) {
        let cIndex = columnIndex - 1;
        if (cIndex < 0) cIndex = 0;

        if (_isEmpty(this.modelColumns[cIndex])) this.$set(
          this.modelColumns, cIndex, {label: "", prop: _generateUUID()},
        );
        const key = _get(this.modelColumns, `${cIndex}.prop`);
        const node = this.modelData[index];

        // 找不到节点的时候要重新赋值
        if (_isEmpty(node)) this.$set(this.modelData, index, {[key]: ""});

        setTimeout(() => {
          try {
            document.querySelector(`#${editId}`).focus();
          } finally {
          }
        }, 100);

        return h(Input, {
          props: {
            value: _get(row, key),
            placeholder: "请输入",
            type: "textarea",
            autosize: true,
            resize: "none",
          },
          attrs: {
            id: editId,
          },
          on: {
            input: (value) => {
              this.$set(this.modelData[index], key, value);
            },
          },
        });
      }

      return h("div", {class: "ko-table__cell"}, [column?.property ? _get(row, column.property) : ""]);
    },

    // 点击单元格
    onCellClick(row, column) {
      this.visibleCM = false;
      if (this.readonly) return false;

      const key = column.id + `__id__${row.__table_UUID__}`;
      this.noEdit(key);
      this.$nextTick(() => {
        this.$set(this.EditObj, key, true);
      });
    },
    // 点击表头
    onHeaderClick(column) {
      this.visibleCM = false;
      if (this.readonly) return false;

      this.noEdit(column.id);
      this.$nextTick(() => {
        this.$set(this.EditObj, column.id, true);
      });
    },

    // 去除所有的编辑
    noEdit(nKey) {
      for (const key in this.EditObj) {
        if (!_isEqual(key, nKey)) {
          this.$set(this.EditObj, key, false);
        }
      }
    },

    // 表头右键
    onHeaderContextmenu(column, event) {
      this.visibleCM = false;

      if (this.readonly || column.property === "Index") return false;
      this.isCMHead = true;
      this.visibleCM = true;
      this.CMPage = _pick(event, ["pageX", "pageY"]);

      this.property = column.property;
    },

    // 表格右键
    onRowContextmenu(row, column, event) {
      this.visibleCM = false;

      if (this.readonly) return false;
      this.isCMHead = false;
      this.visibleCM = true;
      this.CMPage = _pick(event, ["pageX", "pageY"]);
      this.property = column.property;
      this.rowIndex = row.__table_UUID__;
    },

    // 添加列
    onAddedColumns(isBefore) {
      this.visibleCM = false;
      if (isBefore) {
        this.modelColumns.splice(this.getColumnIndex, 0, {prop: _generateUUID(), label: ""});
      } else {
        this.modelColumns.splice(this.getColumnIndex + 1, 0, {prop: _generateUUID(), label: ""});
      }
    },

    // 添加行
    onAddedRow(isBefore) {
      this.visibleCM = false;
      if (isBefore) {
        this.modelData.splice(this.rowIndex, 0, {__key__: _generateUUID()});
      } else {
        this.modelData.splice(this.rowIndex + 1, 0, {__key__: _generateUUID()});
      }
    },

    // 合并单元格
    onMergeSpan(type) {
      const list = _deepCopy(this.modelData);
      const key = `${this.rowIndex}._config_.${this.property}.${type}`;

      this.visibleCM = false;

      uni.showModal({
        title: {colspan: "向右合并", rowspan: "向下合并"}[type],
        editable: true,
        placeholderText: `${_get(list, key) || ""}`,
        success: (res) => {
          if (res.confirm) {
            const span = +(res.content || _get(list, key));

            if (isNaN(span)) {
              CustomToast({
                title: "请输入要合并几个单元格",
                icon: "none",
              });
              return false;
            }

            const list = _deepCopy(this.modelData);
            _set(list, key, span);
            this.$set(this, "modelData", list);
          }
        },
      });
    },

    // 合并单元格
    objectSpanMethod({row, column, rowIndex, columnIndex}) {
      const span = _get(row, `_config_.${column.property}`) || {};
      let {colspan, rowspan} = span;

      if (_isNotUnNil(colspan) || _isNotUnNil(rowspan)) {
        const s = rowIndex;
        const e = s + (rowspan || 0);
        const cCs = columnIndex;
        const cCe = cCs + (colspan || 0);

        let colHide = [];
        let rowHide = [];

        for (let i = 1; i < (colspan || 0); i++) {
          colHide.push([rowIndex, columnIndex + i]);
        }

        for (let i = 1; i < (rowspan || 0); i++) {
          rowHide.push([rowIndex + i, columnIndex]);
        }

        const pos = calculateCoveredCoordinatesByRow(s, e, cCs, cCe);
        pos.shift();

        const hide = [...colHide, ...rowHide, ...pos];

        for (let i = 0; i < hide.length; i++) {
          const [ns, ne] = hide[i];
          if (!this.hidepos.some(([hs, he]) => hs === ns && he === ne)) {
            this.hidepos.push(hide[i]);
          }
        }

        return {
          colspan: _isNotUnNil(colspan) ? colspan : 1,
          rowspan: _isNotUnNil(rowspan) ? rowspan : 1,
        };
      }

      if (this.hidepos.some(([hs, he]) => hs === rowIndex && he === columnIndex)) {
        return {colspan: 0, rowspan: 0};
      }

      return {colspan: 1, rowspan: 1};
    },
  },
  mounted() {
    document.body.addEventListener("click", () => {
      this.noEdit();
      this.visibleCM = false;
    });
  },
  onUnload() {
    document.body.removeEventListener("click", () => {
      this.noEdit();
    });
  },
  computed: {
    modelColumns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.$emit("update:columns", val);
      },
    },

    modelData: {
      get() {
        return this.data;
      },
      set(val) {
        this.$emit("update:data", val);
      },
    },

    // 获取表头
    getColumns() {
      const columns = _deepCopy(this.modelColumns) || [];

      let list = [];

      if (columns.length < this.minColumns) {
        for (let i = 0; i < this.minColumns; i++) {
          list.push(columns[i] || {});
        }
      } else {
        list = columns;
      }

      return [
        // 序号是固定的，不需要编辑或修改
        {
          label: "序号",
          type: "index",
          prop: "Index",
          width: 50,
        },
        ...list.map(v => ({
          ...v,
          renderHeader: this.renderHeader,
          render: this.renderCell,
        })),
      ];
    },

    // 获取表体
    getTableList() {
      const minRow = this.minRow;
      const data = _deepCopy(this.data) || [];

      let list = [];

      if (data.length < minRow) {
        for (let i = 0; i < this.minRow; i++) {
          list.push(data[i] || {});
        }
      } else {
        list = data;
      }

      return list.map((v, index) => ({__key__: _generateUUID(), ...v, __table_UUID__: index}));
    },

    // 获取样式
    getRootStyle() {
      return {
        "--page-x": (this.CMPage.pageX || 0) + "px",
        "--page-y": (this.CMPage.pageY || 0) + "px",
      };
    },

    // 获取选中的列索引
    getColumnIndex() {
      return this.modelColumns?.findIndex(v => _isEqual(v.prop, this.property));
    },
  },
};
</script>

<template>
  <div
    class="ko-h5"
    @contextmenu.stop.prevent
    @click.stop.prevent
    :style="getRootStyle"
  >
    <div class="ko-print-header">
      <h2>{{ GET_SHOP_NAME }}定制单</h2>
      <Row class="ko-print-header__info" :gutter="10" v-if="false">
        <Col :span="8" class="ko-print-header__info--item">
          <label>客户名称：</label>
          <span>
                <PickerUser
                  style="width: 100%;"
                  is-input
                  title="选择客户"
                  v-model="form.supplierId"
                  type="client"
                  ref="UserRef"
                  :disabled="readonly"
                />
              </span>
        </Col>
        <Col :span="8" class="ko-print-header__info--item">
          <label>联系电话：</label>
          <span><Input v-if="!readonly" v-model="form.orderPhone" placeholder="请输入" />
                <template v-else>{{ form.orderPhone }}</template></span>
        </Col>
        <Col :span="8" class="ko-print-header__info--item">
          <label>配送地址：</label>
          <span><Input v-if="!readonly" v-model="form.orderAddress" placeholder="请输入" />
            <template v-else>{{ form.orderPhone }}</template></span>
        </Col>
      </Row>
    </div>

    <KoTable
      :columns="getColumns"
      :data="getTableList"
      :span-method="objectSpanMethod"
      no-padding-bottom
      @cell-click="onCellClick"
      @header-click="onHeaderClick"
      @header-contextmenu="onHeaderContextmenu"
      @row-contextmenu="onRowContextmenu"
      row-key="__key__"
    />

    <div class="ko-h5__footer" v-if="false">
      <PrintFooter ref="FooterRef" :out-name="GET_USER_INFO.nickName" :info="GET_CONFIG_INFO" />
    </div>

    <div class="ko-contextmenu ko-basic-box-shadow" v-if="visibleCM">
      <ul>
        <block v-if="isCMHead">
          <li @click.stop="onAddedColumns(false)">在右侧插入列</li>
          <li @click.stop="onAddedColumns(true)" v-if="getColumnIndex">在左侧插入列</li>
        </block>
        <block v-else>
          <li @click.stop="onAddedRow(true)">在上方插入行</li>
          <li @click.stop="onAddedRow(false)">在下方插入行</li>
          <li @click.stop="onMergeSpan('colspan')" v-if="getColumnIndex < modelColumns.length - 1">向右合并</li>
          <li @click.stop="onMergeSpan('rowspan')" v-if="rowIndex < (modelData.length - 1)">向下合并</li>
        </block>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
$border-color: #000;

::v-deep .uni-easyinput__content.is-input-border, ::v-deep .el-textarea__inner, ::v-deep .el-input__inner {
  border: none;
}

::v-deep .el-table--border,
::v-deep .el-table--group,
::v-deep .el-table td.el-table__cell,
::v-deep .el-table th.el-table__cell.is-leaf {
  border-color: $border-color;
}

::v-deep .el-table .el-table__cell {
  padding: 0 0;
  height: 41px;

  .el-textarea {
    height: 100%;
  }

  .el-textarea__inner {
    text-align: center;
    min-height: 100% !important;
  }
}

::v-deep .el-table .cell, ::v-deep .el-table th.el-table__cell > .cell {
  padding-left: 0 !important;
  padding-right: 0 !important;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep .el-table--border::after, ::v-deep .el-table--group::after, ::v-deep .el-table::before {
  background: $border-color;
}


::v-deep .ko-table__cell {
  padding: 6px 10px;
}

.ko-print-header {
  border: 1px solid $border-color;
  padding-top: 10px;
  border-bottom: none;
  padding-bottom: 8px;
  @include print-style();

  h2 {
    text-align: center;
    line-height: 1.4;
    @include print-header-style();
  }

  &__info {
    margin-top: 10px;
    padding: 0 20px;
    @include print-style();

    &--item {
      display: flex;
      align-items: center;
      @include print-style();
      font-weight: normal;

      label {
        color: #000;
        white-space: nowrap;
      }

      span {
        flex: 1;
        color: #000;
        border-bottom: 0.5px solid #000;
        text-align: center;
        white-space: nowrap;
      }
    }
  }
}

.ko-h5 {
  &__footer {
    border: 1px solid $border-color;
    border-top: none;
  }
}

.ko-contextmenu {
  position: fixed;
  left: var(--page-x);
  top: var(--page-y);

  z-index: 99;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  background: #fff;
  padding: 10px 0;

  ul {
    display: block;

    li {
      list-style: none;
      line-height: 36px;
      padding: 0 20px;
      margin: 0;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      outline: none;
      transition: background .3s, color .3s;

      &:hover {
        background: #ecf5ff;
        color: #66b1ff;
      }
    }
  }
}
</style>
