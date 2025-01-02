<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import Warehouse from "./components/Warehouse.vue";
import Out from "./components/Out.vue";
import Verification from "./components/Verification.vue";

import { _deepCopy } from "@/utils";
import KoNotice from "@/components/Notice/Notice.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "stock",
  components: {Verification, KoNotice, Out, Warehouse, ViewVersion, UniSegmentedControl},
  mixins: [mixins],
  data: () => ({
    tabList: [
      {
        label: "库存看版",
        ref: "VVRef",
        roles: ["Stock_Read", "Stock_Write"],
      },
      {
        label: "入库审批",
        ref: "WRef",
        roles: ["Stock_Read", "Stock_Write"],
      },
      {
        label: "出库审批",
        ref: "ORef",
        roles: ["Stock_Read", "Stock_Write"],
      },
      {
        label: "核对库存",
        ref: "VRef",
        roles: ["Stock_Write"],
      },
    ],
    // TAB: 0,
  }),
  onShow() {
    this.getList();
  },
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);

    if (option.PAGE_INDEX) {
      this.TAB = +option.PAGE_INDEX;
    }
  },
  methods: {
    getList() {
      this.$nextTick(() => {
        if (!this.GET_TABS_REF_NAME) return false;
        this.$refs[this.GET_TABS_REF_NAME]?.getList?.(true);
      });
    },
  },
};
</script>

<template>
  <view class="ko-stock">
    <KoNotice />

    <view class="ko-stock__tabs" style="padding: 10px;">
      <UniSegmentedControl
        :values="GET_TAB_LIST"
        label-key="label"
        :current.sync="TAB"
        @clickItem="getList"
      />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(GET_TABS_REF_NAME, 'VVRef')" />

    <Warehouse ref="WRef" v-if="isEqual(GET_TABS_REF_NAME, 'WRef')" />

    <Out ref="ORef" v-if="isEqual(GET_TABS_REF_NAME, 'ORef')" />

    <Verification ref="VRef" v-if="isEqual(GET_TABS_REF_NAME, 'VRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-stock {
  width: 100%;

  // #ifdef H5
  &__tabs {
    width: 500px;
  }

  // #endif
}
</style>
