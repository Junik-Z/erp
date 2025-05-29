<script>
// #ifdef H5
import { Table, TableColumn } from "@/uni_modules/element-ui/element.min";
import { _deepCopy, _keys, _pick } from "@/utils";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";
import KoList from "@/components/List/List.vue";

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
    columnIndex: Number,
  },
  render(h) {
    const params = {
      row: this.row,
      index: this.index,
      columnIndex: this.columnIndex,
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
    noMore: Boolean,
    loading: Boolean,
    noRefresh: Boolean,
    noPaddingBottom: Boolean,
    hideTips: Boolean,
  },
 /*  watch: {
    data: {
      handler(t, f) {
        if (t && t.length === f.length) return false

        const S = this.$refs.WrapRef?.$el;
        const sEl = S?.querySelector(".uni-scroll-view > .uni-scroll-view");

        this.$nextTick(() => {
          sEl.scrollTop = this.scrollTop;
        });
      },
      deep: true,
    },
  }, */
  data() {
    return {
      isLoading: true,
      scrollTop: 0,
      isNext: false,
    };
  },
  components: {
    KoList,
    UvLoadingIcon,
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
    onInfiniteLoad() {
      if (!this.noMore) {
        uni._KO_TABLE_TIME_VM_ && clearTimeout(uni._KO_TABLE_TIME_VM_);

        uni._KO_TABLE_TIME_VM_ = setTimeout(() => {
          this.$emit("next-load");
        }, 100);
      }
    },

    onRowContextmenu(...arg) {
      this.$emit("row-contextmenu", ...arg);
    },
    onHeaderContextmenu(...arg) {
      this.$emit("header-contextmenu", ...arg);
    },
    onCellClick(...arg) {
      this.$emit("cell-click", ...arg);
    },
    onHeaderClick(...arg) {
      this.$emit("header-click", ...arg);
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
  <KoList
    ref="WrapRef"
    :data="data"
    :loading="loading"
    :no-more="!!(noMore && !loading && data.length)"
    @load-next="onInfiniteLoad"
    @lower="onInfiniteLoad"
    :no-refresh="noRefresh"
    :hide-tips="hideTips"
  >
    <div style="padding: 16px;">
      <el-table
        v-bind="getElementTableProps"
        @row-click="onRowClick"
        @row-contextmenu="onRowContextmenu"
        @header-contextmenu="onHeaderContextmenu"
        @cell-click="onCellClick"
        @header-click="onHeaderClick"
      >
        <el-table-column
          v-for="(item, index) of columns"
          :key="index"
          v-bind="getColBind(item)"
        >
          <!--<template v-if="item.renderHeader" #header="{column, $index}">
            <RenderDom v-if="item.renderHeader" :column="column" :index="$index" :render="item.renderHeader" />
          </template>-->
          <template v-if="(item || {}).render || (item || {}).slot" #default="{row, column, $index}">
            <slot v-if="item.slot" :name="item.slot" :item="row" :column="column" :index="$index"></slot>
            <RenderDom
              v-if="(item || {}).render && !item.slot"
              :row="row"
              :column="column"
              :index="$index"
              :render="item.render"
              :column-index="index"
            />
          </template>

          <template v-if="(item || {}).children">
            <el-table-column
              v-for="(child, jIndex) of item.children"
              :key="index + '————' + jIndex"
              v-bind="getColBind(child)"
            >
              <!--  <template v-if="child.renderHeader" #header="{column, $index}">
                  <RenderDom v-if="child.renderHeader" :column="column" :index="$index" :render="item.renderHeader" />
                </template>-->
              <template v-if="child.render || child.slot" #default="{row, column, $index}">
                <slot v-if="child.slot" :name="child.slot" :item="row" :column="column" :index="$index"></slot>
                <RenderDom
                  v-if="(child || {}).render"
                  :row="row"
                  :column="column"
                  :index="$index"
                  :render="child.render"
                />
              </template>
            </el-table-column>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </KoList>
  <!-- #endif -->
</template>

<style scoped lang="scss">
.ko-table {
  height: 100%;
  width: 100%;
  overflow-y: auto;

  &__loading {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__no-more {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
  }
}
</style>
