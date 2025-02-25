<script>
import { _get, _isEmpty, _set } from "@/utils";
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
};
</script>

<template>
  <table class="ko-print-table" ref="TableRef">
    <colgroup>
      <col :width="column.width || 'auto'" v-for="(column, index) of columns" :key="index" />
    </colgroup>

    <thead>
    <tr v-if="$slots.thead" data-type="slotThead">
      <th :colspan="columns.length" style="position: relative;">
        <slot name="thead"></slot>
      </th>
    </tr>
    <tr data-type="thead">
      <td v-for="(column, index) of columns" :key="index">
        <div style="font-weight: bold;" class="ko-print-table__cell">
          {{ column.label }}
        </div>
      </td>
    </tr>
    </thead>

    <tbody>
    <tr v-for="(item, index) of data" :key="`tr-td-${index}--${item.id}`" :data-type="item.id" :data-id="item.id">
      <td v-for="(column, cIndex) of columns" :key="cIndex">
        <div class="ko-print-table__cell">
          <RenderDom v-if="column.render" :render="column.render" :column="column" :row="item" :index="index" />
          <template v-else>
            {{ _get(item, column.prop) || "" }}
          </template>
        </div>
      </td>
    </tr>

    <tr v-if="isSummary && !_isEmpty(summary)" data-type="tfoot">
      <td :colspan="(columns || []).length">
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
      <td :colspan="(columns || []).length">
        <div class="ko-foot">
          <div class="ko-foot__item" v-for="(item) of feesList" :key="item.label">
            <label>{{ item.label }}:</label>
            <span>{{ toYuan(item.value) }}元</span>
          </div>
        </div>
      </td>
    </tr>

    <tr v-if="!(data || []).length && false">
      <td :colspan="(columns || []).length">
        <div class="ko-print-table__cell not-data">
          暂无数据
        </div>
      </td>
    </tr>
    </tbody>

    <tfoot>
    <tr v-if="$slots.tfoot" data-type="slotTFoot">
      <td :colspan="columns.length">
        <slot name="tfoot"></slot>
      </td>
    </tr>
    </tfoot>
  </table>
</template>

<style lang="scss">
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
