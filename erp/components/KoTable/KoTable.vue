<script>
// #ifdef H5
import { Table, TableColumn } from "@/uni_modules/element-ui/element.min";
import { _deepCopy, _keys, _pick } from "@/utils";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

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
  },
  watch: {
    data: {
      handler(to, form) {
        if (to?.length === form?.length || ((to?.length - 1) || 0) === form?.length) return false;

        const top = _deepCopy(this.$refs.WrapRef.scrollTop);
        this.$nextTick(() => {
          this.$refs.WrapRef.scrollTop = top;
        });
      },
      deep: true,
    },
  },
  data() {
    return {
      isLoading: true,
    };
  },
  components: {
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
      !this.noMore && this.$emit("next-load");
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
  <div
    v-infinite-scroll="onInfiniteLoad"
    class="ko-table"
    infinite-scroll-immediate
    :infinite-scroll-delay="200"
    :infinite-scroll-disabled="noMore"
    :infinite-scroll-distance="200"
    ref="WrapRef"
  >
    <div :style="{paddingBottom: noPaddingBottom ? 0 : '40px'}">
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
      
      <view class="ko-table__loading" v-if="loading">
        <UvLoadingIcon size="40" />
      </view>
      <view class="ko-table__no-more" v-if="noMore && !loading && data.length">
        没有更多数据了
      </view>
    </div>
  </div>
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
