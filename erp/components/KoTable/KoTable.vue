<script>
// #ifdef H5
import { Table, TableColumn } from "@/uni_modules/element-ui/element.min";
import { _keys, _pick } from "@/utils";

const RenderDom = {
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
};

export default {
  name: "KoTable",
  props: {
    ...Table.props,
    border: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    RenderDom,
  },
  methods: {
    getColBind(item) {
      return {
        align: "center",
        ..._pick(item, _keys(TableColumn.props)),
      };
    },
    onRowClick(...arg) {
      this.$emit("row-click", ...arg);
    },
  },
  computed: {
    getElementTableProps() {
      return _pick(this.$props, _keys(Table.props));
    },
  },
  mounted() {
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <ElTable v-bind="getElementTableProps" @row-click="onRowClick">
    <ElTableColumn
      v-for="(item, index) of columns"
      :key="index"
      v-bind="getColBind(item)"
    >
      <template v-if="item.render || item.slot" #default="{row, column, $index}">
        <slot v-if="item.slot" :name="item.slot" :item="row" :column="column" :index="$index"></slot>

        <RenderDom v-if="item.render && !item.slot" :row="row" :column="column" :index="$index" :render="item.render" />
      </template>

      <template v-if="item.children">
        <ElTableColumn
          v-for="(child, jIndex) of item.children"
          :key="index + '————' + jIndex"
          v-bind="getColBind(child)"
        >
          <template v-if="child.render || child.slot" #default="{row, column, $index}">
            <slot v-if="child.slot" :name="child.slot" :item="row" :column="column" :index="$index"></slot>
            <RenderDom v-if="child.render" :row="row" :column="column" :index="$index" :render="child.render" />
          </template>
        </ElTableColumn>
      </template>
    </ElTableColumn>
  </ElTable>
  <!-- #endif -->
</template>

<style scoped lang="scss">

</style>
