<script>
// #ifdef H5
import PrintInvoice from "./pages/PrintInvoice.vue";
import CustomTable from "./pages/CustomTable.vue";
import CustomizedBoards from "./pages/CustomizedBoards.vue";
import TkPrint from "./sxktxg/Print.vue";

import pMixins from "./pMixins";
import { TabPane, Tabs } from "@/uni_modules/element-ui/element.min";

export default {
  name: "DetailsOrder",
  mixins: [pMixins],
  components: {
    CustomTable,
    PrintInvoice,
    CustomizedBoards,
    Tabs,
    TabPane,

    TkPrint,
  },
};
// #endif
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="ko-print-wrap">
    <block v-if="isTkCustom && isEqual(TabValue, 'default')">
      <TkPrint v-bind="bindObj" />
    </block>

    <block v-else>
      <PrintInvoice
        v-if="isEqual(TabValue, 'default')"
        :is-a4="isA4"
        :columns="columns"
        :data="node.details || []"
        :fees-list="feesList"
        :root-style="rootStyle"
        :node="node"
        :header="header"
        :option="option"
      />

      <CustomTable
        v-if="isEqual(TabValue, 'CustomTable')"
        :is-a4="isA4 || true"
        :data="node.CustomTable || []"
        :fees-list="feesList"
        :root-style="rootStyle"
        :node="node"
        :header="header"
        :config="node.CustomTableConfig"
      />

      <CustomizedBoards
        v-if="isEqual(TabValue, 'CustomizedBoards')"
        :is-a4="isA4"
        :data="GET_FUNC(node, 'CustomizedBoards')|| []"
        :fees-list="feesList"
        :root-style="rootStyle"
        :node="node"
        :header="header"
      />
    </block>
  </view>
  <!-- #endif -->
</template>

<style lang="scss">
// #ifdef H5
.ko-print-wrap {
  padding: 0;

  @include print-style();
}

// #endif
</style>
