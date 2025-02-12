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
    getCustomTableBind() {
      return (node) => {
        const mc = _get(node, "mc");

        const style = {
          color: _get(node, "fc") || undefined,
          background: _get(node, "bg") || undefined,
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
      >
        <td v-bind="getCustomTableBind(column)" v-for="(column, cIndex) of item" :key="`td-${index}` + cIndex">
          <div class="ko-print-table__cell">
            {{ _get(column || {}, "v") || "" }}
          </div>
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
