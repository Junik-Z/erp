<script>
import { _debounce, _deepCopy, _get, _isEmpty, _isEqual, _isNotUnNil, _set, _sum, getAllRect } from "@/utils";

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

// 移动步长
const MOVE_STEP = 20;
// 长按步长
const LONG_PRESS = 500;

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

    gridAreaFunc: Function,
  },
  data() {
    return {
      isPC: false,

      thead: [],
      list: [],
      columnsRect: {},

      TouchStart: {},

      EditObj: {},
    };
  },
  watch: {
    data: {
      handler() {
        this.onOffEdit();
        setTimeout(() => {
          this.list = this.getTableList();
        }, 10);
      },
      deep: true,
      immediate: true,
    },
    columns: {
      handler() {
        this.onOffEdit();

        this.thead = _deepCopy(this.columns).map((item,index) => {
          const isEdit = this.EditObj[index];

          if (_isNotUnNil(isEdit)) {
            console.log(isEdit);
          }

          return {
            ...item
          }
        });

        setTimeout(() => {
          this.updateColumns();
        }, 200);
      },
      deep: true,
      immediate: true,
    },
    thead: {
      handler() {
        // setTimeout(() => {
        //   this.updateColumns();
        // }, 100);
      },
      deep: true,
    },
  },
  mounted() {
    // #ifdef H5
    this.isPC = this.IsPC();
    // #endif

  },
  methods: {
    // 预处理列表数据
    getTableList() {
      const list = _deepCopy(this.data);
      const cols = _deepCopy(this.thead);

      let hidePos = [];

      return list.map((row, rowIndex) => {
        const _grid_obj_ = {};
        let _config_ = row._config_ || {};

        cols.forEach((column, columnIndex) => {
          const config = _get(_config_, `${column.prop}`) || {};
          if (_isEmpty(config)) {
            _set(_config_, `${column.prop}`, {rowspan: 0, colspan: 0, _is_edit_: false});
          }

          const G = this?.gridAreaFunc?.({row, column, rowIndex, columnIndex}) || {};

          const rowspan = G.rowspan || _get(config, `rowspan`) || 0;
          const colspan = G.colspan || _get(config, `colspan`) || 0;

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
          _config_,
          _grid_obj_,
        };
      });
    },
    // 获取各个单元格的宽度
    async updateColumns() {
      const rect = await getAllRect(".ko-table__th", this);
      rect.forEach(item => {
        const index = item.dataset.index;
        this.$set(this.columnsRect, index, item.width);
      });
    },

    // 触摸开始
    touchStart(event) {
      this.TouchStart = {
        page: _deepCopy(this.isPC ? event : event.touches[0]),
        event,
        time: +new Date(),
      };
    },
    // 触摸结束
    touchEnd(event) {
      const {page: sPage, time: sTime} = _deepCopy(this.TouchStart) || {};
      const {pageY, pageX} = this.isPC ? event : event.changedTouches[0];
      // 判断是不是在拖动
      const isMove = Math.abs(sPage.pageY - pageY) > MOVE_STEP || Math.abs(sPage.pageX - pageX) > MOVE_STEP;

      if (!isMove) {
        // 耗时
        const time = +new Date() - sTime;
        const data = _deepCopy(event.currentTarget.dataset.params);
        const params = {params: data, event, pageY, pageX};
        this.onOffEdit();

        if (time > LONG_PRESS) {
          this.$emit("long-press", params);
        } else {
          if (_isEqual(data.type, "thead")) {
            this.$set(this.thead[data.columnIndex], "_is_edit_", true);
          }

          if (_isEqual(data.type, "tbody")) {
            const column = this.thead[data.columnIndex];
            this.$set(this.list[data.rowIndex]._config_[column.prop], `_is_edit_`, true);
          }

          this.$emit("press", params);
        }
      }
    },

    // 触摸开始
    mousedown(event) {
      if (!this.isPC) return;
      this.touchStart(event);
    },

    // 触摸结束
    mouseup(event) {
      if (!this.isPC) return;
      this.touchEnd(event);
    },

    // 关闭所有输入框
    onOffEdit() {
      this.thead.forEach(item => {
        this.$set(item, "_is_edit_", false);
      });
      this.list.forEach(item => {
        for (const key in item._config_) {
          this.$set(item._config_[key], "_is_edit_", false);
        }
      });
    },

    _debounceInputChange: _debounce(function (...arg) {
      this.onChangeThead(...arg);
    }, 200),

    // 表头内容变化时触发
    onChangeThead(value, {column, columnIndex, type, row, index}) {
      console.log(value, column);
      if (_isEqual(type, "thead")) {
        this.$emit("change-thead", {column, columnIndex, value});
      }

      if (_isEqual(type, "tbody")) {
        this.$emit("change-tbody", {column, columnIndex, value, row, index});
      }
    },

    // #ifdef H5
    IsPC() {
      const userAgentInfo = navigator.userAgent;
      const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length - 1; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    // #endif
  },
  computed: {
    rootStyle() {
      return {
        "--table-col": "auto ".repeat(this.thead?.length).trim(),
        "--table-width": _sum(this.thead.map(v => (v.width) + 1)) - 1 + "px",
      };
    },
    getThCellStyle() {
      return (col, index) => {
        const width = col.width;
        const w = this.columnsRect?.[index] || 0;
        return {
          width: width ? width + "px" : "auto",
          "--column-width": (width || w) + "px",
        };
      };
    },

    getCellStyle() {
      return (col, index) => {
        const w = this.columnsRect?.[index] || 0;
        const width = col.width || w;
        return {
          width: width ? width + "px" : "auto",
        };
      };
    },
    getTableGridArea() {
      return (row, columnIndex, index, j) => {
        const style = {"grid-area": "unset"};

        // 获取行配置
        const {rs, re, cs, ce, hide} = _get(row, `_grid_obj_.${j}`) || {};

        style["grid-area"] = [rs, cs, re, ce].join("/");

        if (/^span/.test(ce)) {
          style.width = "auto";
          style["background-color"] = "#fff";
          style["z-index"] = "2";
        }

        if (/^span/.test(re)) {
          style["background-color"] = "#fff";
          style["z-index"] = "2";
        }

        if (hide) {
          style.opacity = 0;
        }

        return style;
      };
    },

    getTbodyIsEdit() {
      return (row, column, index, columnIndex) => {
        return _get(row, `_config_.${column.prop}._is_edit_`);
      };
    },
    get() {
      return _get;
    },
  },
};
</script>

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
            v-for="(column, index) of thead"
            :key="index"
            :style="[getThCellStyle(column, index)]"
            :data-index="index"
          >
            <view
              class="ko-table__cell"
              @touchstart="touchStart"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mouseup.stop="mouseup"
              :data-params="{type: 'thead', column: column, columnIndex: index}"
              :class="{'is-edit': column._is_edit_}"
            >
              <uni-easyinput
                :clearable="false"
                v-model.trim="column.label"
                :input-border="false"
                auto-height
                trim
                v-if="column._is_edit_"
                focus
                @input="_debounceInputChange($event, {column, columnIndex: index, type: 'thead'})"
              />
              <text v-if="!column._is_edit_">{{ column.label }}</text>
            </view>
          </view>
        </view>

        <view class="ko-table__tbody">
          <block v-for="(item, index) of list" :key="index">
            <view
              class="ko-table__tr"
              v-for="(column, j) of thead"
              :key="column.label"
              :style="[getCellStyle(column, j), getTableGridArea(item, column, index, j)]"

              @touchstart="touchStart"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mouseup.stop="mouseup"
              :data-params="{type: 'tbody', column: column, columnIndex: j, row: item, rowIndex: index}"

              :class="{'is-edit': getTbodyIsEdit(item, column, index, j)}"
            >
              <view class="ko-table__cell" v-if="column.type === 'index'">{{ index + 1 }}</view>
              <view class="ko-table__cell" v-else>
                <uni-easyinput
                  :clearable="false"
                  v-model.trim="item[column.prop]"
                  :input-border="false"
                  auto-height
                  trim
                  focus
                  v-if="getTbodyIsEdit(item, column, index, j)"
                  @input="_debounceInputChange($event, {column, columnIndex: j, row: item, index, type: 'tbody'})"
                />
                <text v-else>{{ get(item, column.prop) }}</text>
              </view>
            </view>
          </block>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss">
$border-color: #e5e5e5;
$cell-padding: 6px 8px;
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
    grid-template-columns: var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;

    .ko-table__cell {
      padding: $thead-padding;
      white-space: nowrap;

      &.is-edit {
        padding: 0;
      }
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
    //padding: $cell-padding;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
    min-height: 35px;

    &.is-edit {
      width: calc(var(--column-width) - 2px);
    }


    transition: opacity .3s;


    &:active {
      opacity: .7;
    }
  }
}
</style>
