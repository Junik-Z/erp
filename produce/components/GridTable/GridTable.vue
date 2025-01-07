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
            v-for="(col, index) of columns"
            :key="col.prop || index"
            :style="[getCellStyle(col)]"
          >
            <view class="ko-table__cell">{{ col.label }}</view>
          </view>
        </view>

        <view class="ko-table__tbody">
          <block >

          </block>
          <view
            class="ko-table__tr"
            v-for="(col, index) of columns"
            :key="col.prop || index"
            :style="[getCellStyle(col)]"
          >
            <view class="ko-table__cell">{{ col.label }}</view>
          </view>
        </view>
      </view>
    </scroll-view>


    <view
      v-if="false"
      class="_table"
      :style="{'--col':'auto '.repeat(tableData.thead.length).trim(),'text-align':align}"
    >
      <view
        class="_th" v-for="(item,i) in tableData.thead"
        :key="i"
      >
        {{ item.name }}
      </view>
      <view
        class="_td"
        :class="item.isFlex?'isFlex':''" v-for="(item,i) in tableData.tbody"
        :key="i"
        :style="{'grid-area': item.gridArea||'unset','display':item.gridArea=='auto'||item.value==''?'none':'','color':item.color,'backgroundColor':item.bgColor,'text-align':item.align}"
      >
        {{ item.value }}
      </view>
    </view>
  </view>
</template>

<script>
import { _sum } from "@/utils";

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

    cellWidth: {
      type: Number,
      default: 40,
    },

    tableData: Object,
    align: String,
  },
  data() {
    return {};
  },
  computed: {
    rootStyle() {
      return {
        "--table-col": "auto ".repeat(this.columns?.length).trim(),
        "--table-width": _sum(this.columns.map(v => (v.width || this.cellWidth) + 1)) - 1 + "px",
      };
    },

    getCellStyle() {
      return (col) => {
        return {
          width: col.width ? col.width + "px" : "auto",
        };
      };
    },
  },
};
</script>

<style lang="scss" scoped>

$border-color: rgb(81, 82, 83);
$cell-padding: 4px 8px;

.ko-grid-table {
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__scroll {
    height: 100%;
    width: 100%;
  }

  &__wrap {
  }
}

.ko-table {
  &__thead {
    display: grid;
    grid-template-columns:  var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;
  }

  &__tbody {
    display: grid;
    grid-template-columns:  var(--table-col);
    white-space: break-spaces;
    box-sizing: border-box;
    border-left: 1px solid $border-color;
  }

  &__th {
    font-size: 14px;
    color: #333;
    border: 1px solid $border-color;
    border-left: none;
  }

  &__tr {
    font-size: 12px;
    color: #333;
    border: 1px solid $border-color;
    border-left: none;
    border-top: none;
  }

  &__cell {
    padding: $cell-padding;
    text-align: center;
  }
}


$tb-pd: 4px 8px;
$tb-color: rgb(81, 82, 83);

@mixin isFlex() {
  display: flex;
  justify-content: center;
  align-items: center;
}

._table {
  width: 100%;
  box-sizing: border-box;
  border-left: 1px solid $tb-color;
  border-right: 1px solid $tb-color;
  border-top: 1px solid $tb-color;
  // border: 1px solid $tb-color;
  grid-template-columns:  var(--col);
  display: grid;
  overflow: auto;
  white-space: break-spaces;
}

._th {
  text-align: center;
  padding: $tb-pd;
  font-size: 26rpx;
  font-weight: bold;
  border-right: 1px solid $tb-color;
  border-bottom: 1px solid $tb-color;
  @include isFlex;

  &:nth-child(4n) {
    border-right: none;
  }
}

._td {
  padding: $tb-pd;
  font-size: 24rpx;
  border-right: 1px solid $tb-color;
  border-bottom: 1px solid $tb-color;

  &:nth-child(4n) {
    border-right: none;
  }
}

.isFlex {
  @include isFlex;
}

// 固定表头样式
.fixed-thead {
  display: grid;
  grid-template-columns:  var(--col);
}

.fiexd_td {
  visibility: collapse;
}
</style>
