<script>
import { _get, _isEmpty, _set } from "@/utils";

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
  },
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
  <table border class="ko-print-table" ref="TableRef">
    <colgroup>
      <col :width="column.width || 'auto'" v-for="(column, index) of columns" :key="index" />
    </colgroup>

    <thead>
    <tr v-if="$slots.thead">
      <th :colspan="columns.length">
        <slot name="thead"></slot>
      </th>
    </tr>
    <tr data-type="thead">
      <th v-for="(column, index) of columns" :key="index">
        <div class="ko-print-table__cell">
          {{ column.label }}
        </div>
      </th>
    </tr>
    </thead>

    <tbody>
    <tr v-for="(item, index) of data" :key="index" :data-type="item.id" :data-id="item.id">
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
      <td :style="item.style || {}" :colspan="item.colspan || 1" v-for="(item, index) of summary" :key="index">
        <div class="ko-print-table__cell">
          {{ item.label }}
        </div>
      </td>
    </tr>

    <tr v-if="!(data || []).length">
      <td :colspan="(columns || []).length">
        <div class="ko-print-table__cell not-data">
          暂无数据
        </div>
      </td>
    </tr>
    </tbody>

    <tfoot>
    <tr v-if="$slots.tfoot">
      <td :colspan="columns.length">
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
  border: 1px solid #8f939c;
  font-size: 12px;

  &__cell {
    min-height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.not-data {
      color: #c7c9ce;
    }
  }

  tr {
    th {
      font-size: 14px;
    }

    th, td {
      text-align: center;
    }

    td {
      min-height: 23px;
    }
  }
}
</style>
