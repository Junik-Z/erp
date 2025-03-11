<script>
import { _get, _isEmpty, _isObject, _isUndefined, _set, xlsxCellStyle } from "@/utils";
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
    setRowHeight: {
      type: Function,
    },
    isResult: Boolean,
    result: Array,
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
    getTDStyle() {
      return (node, rIndex, cIndex, isChild) => {
        const mc = _get(node, "mc");

        const style = xlsxCellStyle(node, rIndex, cIndex, this.config, isChild);

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

        return {style};
      };
    },

    // 获取 table 行的高度
    getTableRowStyle() {
      return (index, item) => {
        const height = _get(this.config, `rowlen.${index}`);

        if (height && !this.setRowHeight) {
          return {
            height: height + "px",
          };
        }

        if (this.setRowHeight) return this.setRowHeight(index, item);


        return {
          height: "23px",
        };
      };
    },

    // 获取合并表格的数据
    getCBStyle() {
      return (item, column) => {

        const conf = _get(item, `_config_.${column.prop}`);
        if (!_isUndefined(conf)) {
          if (conf === 0) return {style: {display: "none"}};
          return {
            colspan: conf,
          };
        }

        return {};
      };
    },

    getHide() {
      return (node) => {
        const mc = _get(node, "mc");

        if (_isObject(node) && _isObject(mc)) {
          const cs = _get(mc, "cs") || 0;
          const rs = _get(mc, "rs") || 0;

          return (cs || rs);
        }

        return true;
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
        :style="[getTableRowStyle(index, item)]"
      >
        <td
          v-bind="getTDStyle(column || {}, index, cIndex, false)"
          v-for="(column, cIndex) of item"
          :key="`td-${index}` + cIndex"
          v-if="getHide(column || {})"
        >
          <template v-if="GET_FUNC(column || {}, 'ct.s')">
            <span
              v-bind="[getTDStyle(ci || {}, index, cIndex, true)]"
              v-for="(ci, ciIndex) of GET_FUNC(column, 'ct.s')"
              :key="ciIndex"
            >
              {{ GET_FUNC(ci || {}, "v") || "" }}
            </span>
          </template>
          <template v-else>
            {{ GET_FUNC(column || {}, "v") || "" }}
          </template>
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
        <td v-bind="getCBStyle(item, column)" v-for="(column, cIndex) of columns" :key="`td-${index}` + cIndex">
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

    <tr v-if="isResult && result" data-type="result" class="ko-foot__tr">
      <td :colspan="(columns || []).length || 999">
        <div class="ko-result">
          <div class="ko-result__item" v-for="(item) of result" :key="item.label">
            (<label>{{ item.name }}</label>)
            *
            (<span>{{ item.quantity }}</span>)
            *
            (<span>{{ toYuan(item.price) }}</span>)
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

<style scoped lang="scss">
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
      line-height: 1.4;
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

  .ko-result {
    min-height: 23px;
    display: flex;
    align-items: center;
    padding: 8px 10px 0;
    justify-content: space-around;
    flex-wrap: wrap;

    &__tr {
      border-bottom: none !important;

      td {
        border-bottom: none !important;
      }
    }

    &__item {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #000;

    }
  }
}
</style>
