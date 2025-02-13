<script>
import { _get, _isEmpty, _isObject, _set } from "@/utils";
import { Col, Row } from "@/uni_modules/element-ui/element.min";
import mixins from "@/mixins/mixins";

export default {
  name: "PrintTable",
  components: {
    RenderDom: {
      name: "RenderDom",
      props: {
        row: Object,
        render: Function,
        index: Number,
        column: {
          type: Object,
          default: null,
        },
      },
      render(h) {
        const params = {
          row: this.row,
          index: this.index,
        };
        if (this.column) params.column = this.column;
        return this.render(h, params);
      },
    },
    Col, Row,
  },
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
    summary: {
      type: Array,
      default() {
        return [];
      },
    },
    isSummary: Boolean,
    isFees: Boolean,
    feesList: {
      type: Array,
      default() {
        return [];
      },
    },
    isCustomTable: Boolean,
    isCustomizedBoards: Boolean,
    config: {
      type: Object,
      default() {
        return {};
      },
    },
  },

  methods: {
    _isEmpty,
    _get,
    getListSize() {
      const Table = this.$refs.TableRef;
      let list = {};

      Table.querySelectorAll("tr")
        .forEach(tr => {
          const obj = {
            type: tr.getAttribute("data-type"),
            height: tr.offsetHeight || 0,
          };
          // list.push(obj);
          obj.type && _set(list, obj.type || "", obj.height);
        });

      return list;
    },
  },

  computed: {
    // 获取表格项
    getCustomTableBind() {
      console.log(this.data);
      return (node) => {
        const mc = _get(node, "mc");
        const style = {
          color: _get(node, "fc") || undefined,
          background: _get(node, "bg") || undefined,
          fontWeight: ["normal", "bold"][_get(node, "bl")],
          fontStyle: ["normal", "italic"][_get(node, "it")],
          fontFamily: ["Times New Roman", "Arial", "Tahoma", "Verdana", "微软雅黑", "宋体", "黑体（ST Heiti）", "楷体（ST Kaiti）", "仿宋（ST FangSong）", "新宋体（ST Song）", "华文新魏", "华文行楷", "华文隶书"][_get(node, "ff")],

          ...(_get(node, "fs") ? {fontSize: _get(node, "fs") + "px"} : {}),
          textDecoration: `${["normal", "underline"][_get(node, "un")]} ${["normal", "line-through"][_get(node, "cl")]}`,
          "text-align": ["center", "left", "right"][_get(node, "ht")],
          "vertical-align": ["middle", "top", "bottom"][_get(node, "vt")] || "middle",

          ...(_get(node, "tr") == 3
            ? {
              "writing-mode": "vertical-rl", /* 从右到左竖排 */
              "text-orientation": "upright", /* 文字方向保持直立 */
            } : {}),

          ...({
            0: {
              "white-space": "nowrap", /* 防止自动换行 */
              overflow: "hidden", /* 隐藏超出部分 */
              "text-overflow": "ellipsis", /* 显示省略号 */
            },
            1: {
              "white-space": "nowrap", /* 防止自动换行 */
              overflow: "visible", /* 允许内容溢出 */
            },
            2: {
              "white-space": "normal", /* 允许内容自动换行 */
              "word-wrap": "break-word", /* 在单词内换行 */
            },
          }[_get(node, "tb")]),
          padding: "2px",
        };

        if (_isObject(node) && _isObject(mc)) {
          const cs = _get(mc, "cs") || 0;
          const rs = _get(mc, "rs") || 0;

          return {
            colspan: cs,
            rowspan: rs,
            style: {
              ...style,
              ...(!(cs || rs) ? {display: "none"} : {}),
            },
          };
        }

        return {
          style,
        };
      };
    },

    // 获取 table 行的高度
    getTableRowStyle() {
      return (index) => {
        const height = _get(this.config, `rowlen.${index}`);

        if (height) {
          return {
            height: height + "px",
          };
        }

        return {
          height: "23px",
        };
      };
    },
  },
};
</script>

<template>
  <table class="ko-print-table" ref="TableRef">
    <block v-if="!isEmpty(columns)">
      <colgroup>
        <col :width="column.width || 'auto'" v-for="(column, index) of columns" :key="index" />
      </colgroup>
    </block>

    <thead>
    <tr v-if="$slots.thead" data-type="slotThead">
      <th :colspan="columns.length || 999" style="position: relative;">
        <slot name="thead"></slot>
      </th>
    </tr>
    <tr data-type="thead" v-if="!isEmpty(columns)">
      <th v-for="(column, index) of columns" :key="index">
        <div class="ko-print-table__cell">
          {{ column.label }}
        </div>
      </th>
    </tr>
    </thead>
    <tbody>

    <block v-if="isCustomTable">
      <tr
        v-for="(item, index) of data"
        :key="`tr-${index}_${item.id || ''}`"
        :data-type="index"
        :data-id="index"
        :style="[getTableRowStyle(index)]"
      >
        <td
          v-bind="getCustomTableBind(column)"
          v-for="(column, cIndex) of item"
          :key="`td-${index}` + cIndex"
        >
          {{ _get(column || {}, "v") || "" }}
        </td>
      </tr>
    </block>

    <block v-else-if="isCustomizedBoards">
      <tr
        v-for="(item, index) of data"
        :key="`tr-${index}_${item.id || ''}`"
        :data-type="item.id"
        :data-id="item.id"
      >
        <td v-for="(column, cIndex) of columns" :key="`td-${index}` + cIndex">
          <div class="ko-print-table__cell">
            <RenderDom v-if="column.render" :render="column.render" :column="column" :row="item" :index="index" />
            <template v-else>
              {{ _get(item, column.prop) || "" }}
            </template>
          </div>
        </td>
      </tr>
    </block>

    <block v-else>
      <tr
        v-for="(item, index) of data"
        :key="`tr-${index}_${item.id || ''}`"
        :data-type="item.id"
        :data-id="item.id"
      >
        <td v-for="(column, cIndex) of columns" :key="`td-${index}` + cIndex">
          <div class="ko-print-table__cell">
            <RenderDom v-if="column.render" :render="column.render" :column="column" :row="item" :index="index" />
            <template v-else>
              {{ _get(item, column.prop) || "" }}
            </template>
          </div>
        </td>
      </tr>
    </block>

    <tr v-if="isSummary && !_isEmpty(summary)" data-type="tfoot">
      <td :colspan="(columns || []).length || 999">
        <div class="ko-print-table__tfoot">
          <div
            :style="item.style || {}"
            v-for="(item, index) of summary"
            :key="'summary' + index"
            class="ko-print-table__tfoot--item"
            :class="{'label': index % 2 === 0}"
          >
            <div class="ko-print-table__cell">
              {{ item.label }}
              {{ index % 2 === 0 ? ":" : "" }}
            </div>
          </div>
        </div>
      </td>
      <!--<td
        :style="item.style || {}"
        :colspan="item.colspan || 1"
        v-for="(item, index) of summary"
        :key="'summary' + index"
      >
        <div class="ko-print-table__cell">
          {{ item.label }}
        </div>
      </td>-->
    </tr>

    <tr v-if="isFees" data-type="fees" class="ko-foot__tr">
      <td :colspan="(columns || []).length || 999">
        <div class="ko-foot">
          <div class="ko-foot__item" v-for="(item) of feesList" :key="item.label">
            <label>{{ item.label }}:</label>
            <span>{{ toYuan(item.value) }}元</span>
          </div>
        </div>
      </td>
    </tr>

    <tr v-if="!(data || []).length && false">
      <td :colspan="(columns || []).length || 999">
        <div class="ko-print-table__cell not-data">
          暂无数据
        </div>
      </td>
    </tr>
    </tbody>

    <tfoot>
    <tr v-if="$slots.tfoot" data-type="slotTFoot">
      <td :colspan="columns.length || 999">
        <slot name="tfoot"></slot>
      </td>
    </tr>
    </tfoot>
  </table>
</template>

<style lang="scss">
/*@media print {
  body {
    //@include print-style();
  }

  tbody {
    //page-break-before: always;
    //@include print-style();
  }

  tr {
    td, th {
      //@include print-style();
    }
  }

  @page {
    color: #000;
    //size: 126mm 140mm;
    //margin: 10mm; !* 可以根据需要设置边距 *!
  }
}*/

.ko-print-table {
  width: 100%;
  border-collapse: collapse;
  @include print-style();
  border-left: 1px solid #000;
  border-top: 1px solid #000;


  &__cell {
    min-height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    @include print-style();

    &.not-data {
      color: #c7c9ce;
      //color: #000;
    }
  }

  &__tfoot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;

    &--item {
      &.label {
        margin-left: 10%;
        margin-right: 10px;
      }
    }
  }

  tr {
    th, td {
      text-align: center;
      @include print-style();
      border-bottom: 1px solid #000;
      border-right: 1px solid #000;
    }

    td {
      min-height: 23px;
    }
  }

  .ko-foot {
    min-height: 23px;
    display: flex;
    align-items: center;
    padding: 8px 10px 0;
    justify-content: space-between;

    &__tr {
      border-bottom: none !important;

      td {
        border-bottom: none !important;
      }
    }

    &__item {
      flex: 1;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      @include print-style();

      span {
        white-space: nowrap;
        text-align: center;
        border-bottom: 1px solid #000;
        max-width: 100px;
        min-width: 80px;
      }
    }
  }
}
</style>
