<script>
import props from "../../props";
import { _get, _set, _sum } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  mixins: [mixins],
  name: "TkTable",
  props: {
    ...props,
    isShowSummary: Boolean,
    summary: {
      type: Array,
      default() {
        return [];
      },
    },
  },
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
  data() {
    return {};
  },
  methods: {
    _get,
    getListSize() {
      const Table = this.$refs.TRef;
      let list = {};

      Table.querySelectorAll("tr")
        .forEach(tr => {
          const obj = {
            type: tr.getAttribute("data-type"),
            height: tr.offsetHeight || 0,
          };
          obj.type && _set(list, obj.type || "", obj.height);
        });

      return list;
    },
  },
  computed: {
    // 获取单元格样式
    getCellStyle() {
      return col => {
        let style = {};

        if (col.align) {
          style.textAlign = col.align;
        }
        if (col.style) {
          style = {...style, ...col.style};
        }

        return style;
      };
    },
    // 获取头部样式
    getHeaderStyle() {
      return col => {
        let style = {};

        if (col.headAlign) {
          style.textAlign = col.headAlign;
        }

        if (col.headStyle) {
          style = {...style, ...col.headStyle};
        }

        return style;
      };
    },

    // 获取统计数据
    getStatistics() {
      const data = this?.data || [];
      const total = _sum(data.map(v => (v?.total || 0))) || 0;
      const quantity = _sum(data.map(v => (v?.productQuantity || 0))) || 0;

      if (!total && !quantity) return [];

      return [
        {
          colspan: 1,
          label: "总计大写",
        },
        {
          colspan: 2,
          label: this.toBigMoney(this.toYuan(total)),
        },
        {
          colspan: 1,
          style: "text-align:center;",
          label: quantity,
        },
        {
          colspan: 1,
          style: "text-align:right;",
          label: "页小计",
        },
        {
          colspan: 2,
          style: "text-align:right;",
          label: `${this.toYuan(total)}元`,
        },
      ];
    },

    getTrStyle() {
      return (item) => {
        if (item.__height__) {
          return {
            // height: item.__height__ + "px",
          };
        } else {
          return {};
        }
      };
    },
  },
};
</script>

<template>
  <table class="ko-tk-table" ref="TRef">
    <colgroup>
      <col :width="column.width || 'auto'" v-for="(column, index) of columns" :key="index" />
    </colgroup>

    <thead>
    <tr v-if="$slots.thead" data-type="slotThead">
      <td :colspan="columns.length">
        <slot name="thead"></slot>
      </td>
    </tr>
    <tr data-type="thead" class="tk-thead">
      <td v-for="(column, index) of columns" :key="index">
        <div style="font-weight: bold;" :style="getHeaderStyle(column)" class="ko-tk-table__cell">
          {{ column.label }}
        </div>
      </td>
    </tr>
    </thead>

    <tbody>
    <tr
      v-for="(item, index) of data"
      :key="`tr-td-${index}--${item.id}`"
      :data-type="item.id"
      :data-id="item.id"
      :style="getTrStyle(item)"
    >
      <td
        v-for="(column, cIndex) of columns"
        :key="cIndex"
      >
        <div class="ko-tk-table__cell" :style="getCellStyle(column)">
          <RenderDom v-if="column.render" :render="column.render" :column="column" :row="item" :index="index" />
          <template v-else>
            {{ _get(item, column.prop) || "" }}
          </template>
        </div>
      </td>
    </tr>

    <tr
      key="page-statistics"
      data-type="statistics"
      data-id="statistics"
      v-if="!isEmpty(getStatistics)"
    >
      <td v-for="(item, index) of getStatistics" :key="index" :colspan="item.colspan">
        <div class="ko-tk-table__cell" :style="item.style ? item.style : ''">
          {{ item.label }}
        </div>
      </td>
    </tr>
    <tr v-else>
      <td
        v-for="(column, cIndex) of columns"
        :key="cIndex"
      >
        <div class="ko-tk-table__cell">
        </div>
      </td>
    </tr>

    <tr
      key="summary"
      data-type="summary"
      data-id="summary"
      v-if="isShowSummary"
    >
      <td v-for="(item, index) of summary" :key="index" :colspan="item.colspan">
        <div class="ko-tk-table__cell" :style="item.style ? item.style : ''">
          {{ item.label }}
        </div>
      </td>
    </tr>

    </tbody>

    <tfoot>
    <tr v-if="$slots.tfoot" data-type="slotTFoot">
      <td :colspan="columns.length" class="ko-p-table__tfoot">
        <slot name="tfoot"></slot>
      </td>
    </tr>
    </tfoot>
  </table>
</template>

<style lang="scss">
.ko-tk-table {
  width: 100%;
  border-collapse: collapse;

  .tk-thead {
    border-top: 1px solid #000;
    border-left: 1px solid #000;

    td {
      border-right: 1px solid #000;
      border-bottom: 1px solid #000;
    }
  }

  tbody {
    border-top: 1px solid #000;
    border-left: 1px solid #000;

    tr {
      td {
        border-right: 1px solid #000;
        border-bottom: 1px solid #000;
      }
    }
  }

  tr td {
    @include tk-print-style();
  }

  &__cell {
    padding: 0 2px;
    @include tk-print-style();
  }

}
</style>
