<script>
// #ifdef H5
import PrintTable from "./components/NewPrintTable.vue";
import PrintFooter from "./components/PrintFooter.vue";
import PrintHeader from "./components/PrintHeader.vue";
import { Button } from "@/uni_modules/element-ui/element.min";

import { VuePrintLast } from "./vue-print-last";
import mixins from "@/mixins/mixins";
import { cmToPx } from "@/shop/print/utils";
import { _get } from "@/utils";

// 纸张大小
const PaperHeight = cmToPx(14);
// 设置纸张的上下间隙的和
const UpperAndLowerClearance = cmToPx(2);

export default {
  name: "CustomTable",
  mixins: [mixins],
  components: {
    PrintTable,
    PrintFooter,
    PrintHeader,
    Button,
  },
  props: {
    isA4: Boolean,
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    feesList: {
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
    rootStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    header: String,
    config: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      groupList: [],
      rect: {},
    };
  },
  methods: {
    // 获取各个元素的大小
    getGroupList() {
      // 获取表格每行的高度
      const rect = this.$refs.PTableRef.getListSize();

      // 表头总高度
      const headerHeight = (rect.slotThead || 0) + (rect?.thead || 0);
      // 表尾的高度
      const footerHeight = (rect.slotTFoot || 0);

      // 纸张高度
      const totalHeight = PaperHeight - UpperAndLowerClearance;

      // 最大高度
      const maxHeight = totalHeight - headerHeight - footerHeight;

      const pages = [];

      let vessel = [];
      // 各个数据项加起来的高度
      let count = 0;
      let pageNumberSize = 0;

      ;(this.data || []).forEach((row, index) => {
        const h = rect[index] || 0;

        const obj = row;

        if (!pageNumberSize) {
          pageNumberSize = Math.floor(maxHeight / h);
        }

        if (count + h <= maxHeight) {
          vessel.push(obj);
          count += h;
        } else {
          pages.push(vessel);
          vessel = [obj];
          count = h;
        }

        pageNumberSize = pageNumberSize < vessel.length ? vessel.length : pageNumberSize;
      });

      const getEmptyList = (length) => {
        let L = [];
        for (let i = 0; i < length; i++) {
          L.push(null);
        }
        return L;
      };

      // 数据的行数
      const evLength = getEmptyList(_get(this.data, "0")?.length || 0);

      if (vessel.length < pageNumberSize) {
        let number = pageNumberSize - vessel.length - 2;

        for (let i = 0; i < number; i++) {
          vessel.push(evLength);
        }
      }

      // 当最后一页小于最大高度时直接渲染 否则就新开一页
      if ((count + footerHeight + (rect.fees || 0)) <= maxHeight) {
        pages.push(vessel);
      } else {
        // const foot = pageNumberSize - 2;
        // const li = [];
        /*  for (let i = 0; i < foot; i++) {
           li.push(evLength);
         } */
        pages.push(vessel);
      }

      this.maxHeight = maxHeight;
      this.groupList = pages;
      this.rect = rect;
    },
    onPrint() {
      const el = this.isA4 ? this.$refs.A4Ref : this.$refs.PrintRef;

      new VuePrintLast({
        el,
        standard: "html5",
        customSize: this.isA4 ? {
          width: "210mm",
          height: "297mm",
        } : {
          width: "216mm",
          height: "140mm",
        },
      });
    },

    // 设置打印的表格高度
    setRowHeight(page, index, item) {
      const groupList = this.groupList;
      let pNum = 0;

      for (let i = 0; i < page; i++) {
        pNum += groupList[i].length;
      }

      const rIndex = pNum + index;
      const height = this.rect[rIndex];

      if (height) {
        return {
          height: `${height}px`,
        };
      }

      return {
        height: "23px",
      };
    },
  },
  watch: {
    watchSize: {
      handler() {
        if (!this.isA4) {
          setTimeout(() => {
            this.$nextTick(() => {
              this.getGroupList();
            });
          }, 300);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    watchSize() {
      return [...this.data, ...this.feesList];
    },
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <div class="ko-print-custom-table" :style="rootStyle">
    <div class="ko-print-custom-table__header ko-basic-box-shadow">
      <div>
        <Button type="primary" size="mini" @click="onPrint">打印</Button>
      </div>
    </div>

    <div class="ko-print-custom-table__wrap">
      <div class="ko-print-custom-table__content" ref="A4Ref" :class="{'is-a4': isA4}">
        <PrintTable
          ref="PTableRef"
          :data="data || []"
          :is-fees="!!feesList.length && false"
          :fees-list="feesList"
          is-custom-table
          :config="config"
        >
          <template #thead v-if="false">
            <PrintHeader ref="HeaderRef" :title="GET_SHOP_NAME + header" :node="node" />
          </template>
          <template #tfoot v-if="false">
            <PrintFooter ref="FooterRef" :out-name="GET_USER_INFO.nickName" :info="GET_CONFIG_INFO" />
          </template>
        </PrintTable>
      </div>
    </div>

    <div v-if="!isA4" class="ko-print-custom-table__pages" :style="rootStyle" :key="JSON.stringify(groupList)">
      <div class="ko-print-custom-table__pages--wrap" ref="PrintRef">
        <div class="ko-print-custom-table__pages--item" v-for="(item, index) of groupList" :key="'print' + index">
          <div class="ko-print-custom-table__pages--center">
            <PrintTable
              :data="item || []"
              is-custom-table
              :is-fees="!!feesList.length"
              :fees-list="feesList"
              :config="config"
              :set-row-height="setRowHeight.bind(this, index)"
            >
              <template #thead>
                <PrintHeader :title="GET_SHOP_NAME + header" :node="node" />
              </template>
              <template #tfoot>
                <PrintFooter :out-name="GET_USER_INFO.nickName" :info="GET_CONFIG_INFO" />
              </template>
            </PrintTable>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- #endif -->
</template>

<style lang="scss">
// #ifdef H5
//@page Triple {
//  size: 216mm 140mm;
//  margin: 0;
//}

.ko-print-custom-table {
  padding-top: 70px;
  padding-bottom: 80px;
  background: #fff;
  min-height: calc(100vh - 65px);
  position: relative;

  &__header {
    position: absolute;
    top: 0;
    width: 1366px;
    left: 50%;
    transform: translateX(-50%);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: #fff;
    padding: 0 30px;
    margin: 0 auto 20px;
    z-index: 9999;
  }

  &__wrap {
    width: var(--ko-paper-width);
    margin: 0 auto;
  }

  &__content {
    border-top: none;
    border-bottom: none;

    /deep/ .ko-print-header {
      border: none;
    }

    /deep/ .ko-print-footer {
      border: none;
    }
  }

  &__pages {
    @include print-style();
    position: absolute;
    left: -999999999px;

    &--wrap {
      width: 100%;
    }

    &--item {
      height: var(--ko-paper-height);
      width: var(--ko-paper-width);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &--center {
      width: calc(var(--ko-paper-width) - 2cm);
      padding: 0 4px;
    }

    /deep/ .ko-print-table {
      height: var(--ko-paper-max-height, 100%);
    }
  }
}

// #endif
</style>
