<script>
import { _deepCopy, _get, _isEqual, _sum, getAllRect } from "@/utils";

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

      list: [],
      columnsRect: {},

      TouchStart: {},
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
    columns: {
      handler() {
        setTimeout(() => {
          this.updateColumns();
        }, 100);
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    // #ifdef H5
    this.isPC = this.IsPC();
    // #endif

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

        if (time > LONG_PRESS) {
          this.$emit("long-press", params);
        } else {
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
        "--table-col": "auto ".repeat(this.columns?.length).trim(),
        "--table-width": _sum(this.columns.map(v => (v.width) + 1)) - 1 + "px",
      };
    },

    getThCellStyle() {
      return (col) => {
        const width = col.width;
        return {
          width: width ? width + "px" : "auto",
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
      return (row, columnIndex) => {

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
            :style="[getThCellStyle(col, index)]"
            :data-index="index"
          >
            <view
              class="ko-table__cell"
              @touchstart="touchStart"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mouseup.stop="mouseup"
              :data-params="{type: 'thead', column: col, columnIndex: index}"
            >
              <uni-easyinput
                :clearable="false"
                v-model="col.label"
                :input-border="false"
                auto-height
                trim
              />
              <!--{{ col.label }}-->
            </view>
          </view>
        </view>

        <view class="ko-table__tbody">
          <block v-for="(item, index) of list" :key="index">
            <view
              class="ko-table__tr"
              v-for="(col, j) of columns"
              :key="col.label"
              :style="[getCellStyle(col, j), getTableGridArea(item, col, index, j)]"


              @touchstart="touchStart"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mouseup.stop="mouseup"
              :data-params="{type: 'tbody', column: col, columnIndex: j, row: item, rowIndex: index}"
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

<style lang="scss" scoped>
$border-color: #e5e5e5;
$cell-padding: 0px 0px;
$thead-padding: 0px 0px;

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
      white-space: nowrap;
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
    cursor: pointer;
    transition: opacity .3s;


    /deep/ .uni-easyinput .uni-easyinput__content-input {
     max-height: 28px;
    }

    &:active {
      opacity: .7;
    }
  }
}
</style>
