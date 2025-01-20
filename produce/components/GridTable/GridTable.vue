<script>
import { _debounce, _deepCopy, _get, _isEmpty, _isEqual, _sum, _toFinite, getAllRect, getRect } from "@/utils";


import UvCheckbox from "../uv-checkbox/components/uv-checkbox/uv-checkbox.vue";
import { calculateCoveredCoordinatesByRow } from "@/produce/pages/calculate";

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
    notEdit: Boolean,
    noMore: Boolean,
  },
  components: {UvCheckbox},
  data() {
    return {
      isPC: false,

      thead: [],
      list: [],
      columnsRect: {},

      TouchStart: {},

      // 所有本组件用的配置参数
      EditObj: {},

      tableWidth: 370,
    };
  },
  watch: {
    data: {
      handler() {
        setTimeout(() => {
          this.list = this.getTableList();
        }, 10);
      },
      deep: true,
      immediate: true,
    },
    columns: {
      handler(to, form) {
        if (form && to?.length !== form?.length) {
          this.onOffEdit();
        }

        this.thead = _deepCopy(this.columns).map((item, index) => {
          const key = `${item.prop}_${index}`;
          const isEdit = this.EditObj[key];

          if (_isEmpty(isEdit)) {
            this.$set(this.EditObj, key, {"_is_edit_": false});
          }

          return {
            ...item,
          };
        });

        setTimeout(() => {
          this.updateColumns();
        }, 200);
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    // #ifdef H5
    this.isPC = this.IsPC();
    // #endif

    setTimeout(() => {
      getRect(".ko-table__thead", this)
        .then(res => {
          this.tableWidth = res?.width;
        });
    }, 100);
  },
  methods: {
    // 预处理列表数据
    getTableList() {
      const list = _deepCopy(this.data);
      const cols = _deepCopy(this.thead);

      let hidePos = [];

      return list.map((row, rowIndex) => {
        let _config_ = row._config_ || {};

        cols.forEach((column, columnIndex) => {
          const key = `${column.prop}_${columnIndex}_${rowIndex}`;
          const config = _deepCopy(_get(this.EditObj, key) || {});

          const propConfig = _deepCopy(_get(row, `_config_.${column.prop}`) || {});

          const G = this?.gridAreaFunc?.({row, column, rowIndex, columnIndex}) || {};

          const rowspan = G.rowspan || _get(propConfig, `rowspan`) || 0;
          const colspan = G.colspan || _get(propConfig, `colspan`) || 0;

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

          this.$set(this.EditObj, key, {_is_edit_: false, ...config, ...obj});
        });

        return {
          ...row,
          _config_,
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
      if (!this.notEdit) {
        this.onOffEdit();
      }

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
          if (!this.notEdit) {
            if (_isEqual(data.type, "thead")) {
              const key = `${data.column.prop}_${data.columnIndex}`;
              this.$set(this.EditObj[key], "_is_edit_", true);
            }

            if (_isEqual(data.type, "tbody")) {
              const key = `${data.column.prop}_${data.columnIndex}_${data.rowIndex}`;
              if (_isEmpty(this.EditObj[key])) this.$set(this.EditObj, key, {_is_edit_: false});
              this.$set(this.EditObj[key], `_is_edit_`, true);
            }

            setTimeout(() => {
              this.updateColumns();
            }, 0);
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
      for (const key in this.EditObj) {
        this.$set(this.EditObj[key], "_is_edit_", false);
      }

      setTimeout(() => {
        this.updateColumns();
      }, 0);
    },

    _debounceInputChange: _debounce(function (...arg) {
      this.onChangeThead(...arg);
    }, 200),

    // 表头内容变化时触发
    onChangeThead(value, {column, columnIndex, type, row, index}) {
      if (_isEqual(type, "thead")) {
        this.$emit("change-thead", {column, columnIndex, value});
      }

      if (_isEqual(type, "tbody")) {
        this.$emit("change-tbody", {column, columnIndex, value, row, index});
      }
    },

    // 点击更多按钮
    onMoreButton(item, index, column, columnIndex) {
      this.$emit("click-more", {item, index, column, columnIndex});
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
        "--table-width": Math.max(_sum(this.thead.map(v => v.width)) + 1, this.tableWidth) + "px",
      };
    },
    getThCellStyle() {
      return (col, index) => {
        const width = col.width;
        const w = this.columnsRect?.[index] || 0;
        return {
          width: width ? width + "px" : "auto",
          minWidth: col.minWidth ? col.minWidth + "px" : "auto",
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
          minWidth: col.minWidth ? col.minWidth + "px" : "auto",
          // "--row-column-width": (width || w) + "px",
        };
      };
    },
    getTableGridArea() {
      return (row, column, index, columnIndex) => {
        const style = {"grid-area": "unset"};
        const key = `${column.prop}_${columnIndex}_${index}`;

        // 获取行配置
        const {rs, re, cs, ce, hide} = _get(this.EditObj, key) || {};

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
        const key = `${column.prop}_${columnIndex}_${index}`;
        return _get(this.EditObj, `${key}._is_edit_`);
      };
    },

    getTheadIsEdit() {
      return (column, index) => {
        const key = `${column.prop}_${index}`;
        return _get(this.EditObj, `${key}._is_edit_`);
      };
    },
    get() {
      return _get;
    },

    toNumber() {
      return _toFinite;
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
              class="ko-table__thead--cell"
              @touchstart="touchStart"
              @touchend="touchEnd"
              @mousedown.stop="mousedown"
              @mouseup.stop="mouseup"
              :data-params="{type: 'thead', column: column, columnIndex: index}"
              :class="{'is-edit': getTheadIsEdit(column, index)}"
            >
              <uni-easyinput
                :clearable="false"
                v-model.trim="column.label"
                :input-border="false"
                auto-height
                trim
                v-if="getTheadIsEdit(column, index)"
                focus
                @input="_debounceInputChange($event, {column, columnIndex: index, type: 'thead'})"
                @change="onOffEdit"
              />
              <block v-else>{{ column.label }}</block>
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
            >
              <view class="ko-table__cell" v-if="column.type === 'index'">{{ index + 1 }}</view>
              <view class="ko-table__cell" v-else-if="column.type === 'more'">
                <button @click.stop="onMoreButton(item, index, column, j)" class="ko-basic-button__card">更多</button>
              </view>
              <view class="ko-table__cell" v-else-if="column.type === 'checkbox'">
                <UvCheckbox is-alone :value="get(item, column.prop)" readonly />
              </view>
              <view class="ko-table__cell" v-else-if="column.type === 'number'">
                {{ toNumber(get(item, column.prop)) }}
              </view>
              <view class="ko-table__cell" v-else :class="{'is-edit': getTbodyIsEdit(item, column, index, j)}">
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

        <view
          v-if="noMore"
          class="ko-table__no-more"
        >
          还没有添加任何材料
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

    &--cell {
      padding: $thead-padding;
      //white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      text-align: center;
      box-sizing: border-box;
      min-height: 35px;

      text {
        word-wrap: break-word; /* 允许长单词或无法使用断点的URL强制换行 */
        white-space: normal; /* 保持正常换行行为 */
        overflow-wrap: break-word;
      }

      // #ifdef MP
      cursor: pointer;
      // #endif

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
    padding: $cell-padding;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    box-sizing: border-box;
    min-height: 35px;

    text {
      word-wrap: break-word; /* 允许长单词或无法使用断点的URL强制换行 */
      white-space: normal; /* 保持正常换行行为 */
      overflow-wrap: break-word;
    }

    // #ifdef MP
    cursor: pointer;
    // #endif

    &.is-edit {
      padding: 0;
      width: calc(var(--column-width) - 2px);
    }

    .ko-basic-button__card {
      padding: 4px 10px;
    }
  }

  &__no-more {
    color: #c7c9ce;
    width: calc(var(--table-width, 100%) - 0px);
    border: 1px solid $border-color;
    border-top: none;
    padding: 10px;
    text-align: center;
    font-size: 12px;
  }
}
</style>
