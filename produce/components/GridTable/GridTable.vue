<template>
  <view class="ko-grid-table" :style="[rootStyle]">
    <scroll-view
      scroll-y
      scroll-x
      class="ko-grid-table__scroll"
    >
      <view class="ko-grid-table__wrap">
        <view class="ko-table__thead">
          <view
            class="ko-table__th"
            v-for="(col, index) of columns"
            :key="index"
            :style="[getCellStyle(col)]"
          >
            <view class="ko-table__cell">{{ col.label }}</view>
          </view>
        </view>

        <view class="ko-table__tbody">
          <block v-for="(item, index) of list" :key="index">
            <view
              class="ko-table__tr"
              v-for="(col, j) of columns"
              :key="col.label"
              :style="[getCellStyle(col), getTableGridArea(item, col, index, j)]"
            >
              <view class="ko-table__cell" v-if="col.type === 'index'">{{ index + 1 }}</view>
              <view class="ko-table__cell" v-else>{{ get(item, col.prop) }}</view>
            </view>
          </block>
        </view>
      </view>
    </scroll-view>

    <view
      v-if="true"
      class="_table"
      :style="{'--col':'auto '.repeat(tableData.thead.length).trim(),'text-align':align}"
    >
      <view
        class="_th" v-for="(item,i) in tableData.thead"
        :key="i"
      >
        {{ item.name }}
      </view>
      <view
        class="_td"
        :class="item.isFlex?'isFlex':''" v-for="(item,i) in tableData.tbody"
        :key="i"
        :style="{'grid-area': item.gridArea||'unset','display':item.gridArea=='auto'||item.value==''?'none':'','color':item.color,'backgroundColor':item.bgColor,'text-align':item.align}"
      >
        {{ item.value }}
      </view>
    </view>
  </view>
</template>

<script>
import { _deepCopy, _get, _isNotUnNil, _sum } from "@/utils";

export default {
  name: "GridTable",
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
    cellWidth: {
      type: Number,
      default: 40,
    },

    gridAreaFunc: Function,

    tableData: Object,
    align: String,
  },
  data() {
    return {
      list: [],
    };
  },
  watch: {
    data: {
      handler() {
        this.list = this.getTableList();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getTableList() {
      const list = _deepCopy(this.data);
      const cols = _deepCopy(this.columns);

      const obj = {};

      let rowEndIndex = list.length;
      let rowColumnIndex = null;

      return list.map((row, rowIndex) => {
        const _grid_obj_ = {};
        let columnEndIndex = cols.length;

        cols.forEach((column, columnIndex) => {
          const {rowspan, colspan} = this.gridAreaFunc?.({row, column, rowIndex, columnIndex}) || {};

          _grid_obj_[columnIndex] || (_grid_obj_[columnIndex] = {});

          if (colspan) {
            _grid_obj_[columnIndex].cols = (columnIndex + 1);
            _grid_obj_[columnIndex].cole = columnIndex + (colspan + 1);
            columnEndIndex = columnIndex + colspan;
          } else {
            _grid_obj_[columnIndex].hide = columnEndIndex !== cols.length && columnIndex < columnEndIndex;
          }


          // if (rowspan) {
          //   _grid_obj_[columnIndex].rows = columnIndex + (rowIndex + 1);
          //   _grid_obj_[columnIndex].rowe = rowIndex + (rowspan + 1);
          //   rowEndIndex = rowIndex + rowspan;
          //   rowColumnIndex = columnIndex;
          // } else {
          //   _grid_obj_[columnIndex].rowhide = rowEndIndex !== list.length && rowIndex < rowEndIndex && rowColumnIndex === columnIndex;
          // }

        });

        console.log(_grid_obj_);

        return {
          ...row,
          _grid_obj_,
        };
      });
    },
  },

  computed: {
    rootStyle() {
      return {
        "--table-col": "auto ".repeat(this.columns?.length).trim(),
        "--table-width": _sum(this.columns.map(v => (v.width || this.cellWidth) + 1)) - 1 + "px",
      };
    },

    getColumnProp() {
      return (col) => col.type || col.prop;
    },

    getCellStyle() {
      return (col) => {
        return {
          width: col.width ? col.width + "px" : "auto",
        };
      };
    },

    getTableGridArea() {
      return (row, column, rowIndex, columnIndex) => {
        let unset = "unset";

        const style = {
          "grid-area": unset,
          display: "",
        };

        // 获取行配置
        const {hide, cols, cole, rows, rowe} = _get(row, `_grid_obj_.${columnIndex}`) || {};

        if (hide) {
          style.display = "none";
        }

        if (_isNotUnNil(cols) || _isNotUnNil(cole) || _isNotUnNil(rows) || _isNotUnNil(rowe)) {
          style["grid-area"] = [rows || 1, cols || 1, rowe || 1, cole || 1].join("/");
          style.width = "auto";
        }

        /*  if (rowspan || colspan) {
           const rs = rowIndex;
           const re = rowIndex + (rowspan || 0);

           const cs = colspan;
           const ce = colspan + (colspan || 0);
           unset = [rs, cs, re, ce].join("/");
         } */

        return style;
      };
    },

    get() {
      return _get;
    },
  },
};
</script>

<style lang="scss" scoped>

$border-color: rgb(81, 82, 83);
$cell-padding: 4px 8px;

.ko-grid-table {
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__scroll {
    height: 100%;
    width: 100%;
  }

  &__wrap {
  }
}

.ko-table {
  &__thead {
    display: grid;
    grid-template-columns:  var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;
  }

  &__tbody {
    display: grid;
    grid-template-columns: var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;
  }

  &__th {
    font-size: 14px;
    color: #333;
    border: 1px solid $border-color;
    border-left: none;
    font-weight: bold;
    box-sizing: border-box;
  }

  &__tr {
    font-size: 12px;
    color: #333;
    border: 1px solid $border-color;
    border-left: none;
    border-top: none;
    box-sizing: border-box;
  }

  &__cell {
    padding: $cell-padding;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    box-sizing: border-box;
  }
}


$tb-pd: 4px 8px;
$tb-color: rgb(81, 82, 83);

@mixin isFlex() {
  display: flex;
  justify-content: center;
  align-items: center;
}

._table {
  width: 100%;
  box-sizing: border-box;
  border-left: 1px solid $tb-color;
  border-right: 1px solid $tb-color;
  border-top: 1px solid $tb-color;
  // border: 1px solid $tb-color;
  grid-template-columns:  var(--col);
  display: grid;
  overflow: auto;
  white-space: break-spaces;
}

._th {
  text-align: center;
  padding: $tb-pd;
  font-size: 26rpx;
  font-weight: bold;
  border-right: 1px solid $tb-color;
  border-bottom: 1px solid $tb-color;
  @include isFlex;

  &:nth-child(4n) {
    border-right: none;
  }
}

._td {
  padding: $tb-pd;
  font-size: 24rpx;
  border-right: 1px solid $tb-color;
  border-bottom: 1px solid $tb-color;

  &:nth-child(4n) {
    border-right: none;
  }
}

.isFlex {
  @include isFlex;
}

// 固定表头样式
.fixed-thead {
  display: grid;
  grid-template-columns:  var(--col);
}

.fiexd_td {
  visibility: collapse;
}
</style>
