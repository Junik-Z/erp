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
  </view>
</template>

<script>
import { _deepCopy, _get, _isEqual, _sum } from "@/utils";

// 获取包含的坐标
function calculateCoveredCoordinatesByRow(x_start, x_end, y_start, y_end) {
  const coveredCoordinates = [];
  for (let x = x_start; x < x_end; x++) {
    for (let y = y_start; y < y_end; y++) {
      coveredCoordinates.push([x, y]);
    }
  }
  return coveredCoordinates;
}

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

      let hidePos = [];

      return list.map((row, rowIndex) => {
        const _grid_obj_ = {};
        cols.forEach((column, columnIndex) => {
          const {rowspan, colspan} = this.gridAreaFunc?.({row, column, rowIndex, columnIndex}) || {};

          const obj = {
            rs: rowIndex + 1,
            re: rowspan ? `span ${rowspan}` : rowIndex + 1,

            cs: columnIndex + 1,
            ce: colspan ? `span ${colspan}` : columnIndex + 1,
          };

          if (rowspan || colspan) {
            const s = rowIndex;
            const e = s + (rowspan || 0);

            const cCs = columnIndex;
            const cCe = cCs + (colspan || 0);

            const pos = calculateCoveredCoordinatesByRow(s, e, cCs, cCe);
            pos.shift();

            hidePos = pos;
          }

          obj.hide = hidePos.some(v => _isEqual(v, [rowIndex, columnIndex]));

          _grid_obj_[columnIndex] = obj;

        });

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

    getCellStyle() {
      return (col) => {
        return {
          width: col.width ? col.width + "px" : "auto",
        };
      };
    },

    getTableGridArea() {
      return (row, column, rowIndex, columnIndex) => {

        const style = {"grid-area": "unset"};

        // 获取行配置
        const {rs, re, cs, ce, hide} = _get(row, `_grid_obj_.${columnIndex}`) || {};

        style["grid-area"] = [rs, cs, re, ce].join("/");

        if (/^span/.test(ce)) {
          style.width = "auto";
          // style["background-color"] = "#fff";
          style["z-index"] = "2";
        }

        if (/^span/.test(re)) {
          // style["background-color"] = "#fff";
          style["z-index"] = "2";
        }

        if (hide) {
          style.opacity = 0;
        }

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
$border-color: #e5e5e5;
$cell-padding: 4px 8px;
$thead-padding: 6px 8px;

.ko-grid-table {
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__scroll {
    height: 100%;
    width: 100%;
  }

  &__wrap {
    min-width: 100%;
  }
}

.ko-table {
  &__thead {
    display: grid;
    grid-template-columns:  var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;

    .ko-table__cell {
      padding: $thead-padding;
    }
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
</style>
