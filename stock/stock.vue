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
  data() {
    return {
      tabList: [
        {
          label: "库存看版",
          ref: "VVRef",
          roles: ["STOCK_COUNT"],
        },
        {
          label: "入库审批",
          ref: "WRef",
          roles: ["STOCK_INBOUND_LIST", "STOCK_INBOUND_HISTORY", "STOCK_INBOUND_CANCEL"],
        },
        {
          label: "出库审批",
          ref: "ORef",
          roles: ["STOCK_OUTBOUND_LIST", "STOCK_OUTBOUND_HISTORY", "STOCK_OUTBOUND_CANCEL"],
        },
        {
          label: "核对库存",
          ref: "VRef",
          roles: ["STOCK_CHECK", "STOCK_TAKING"],
        },
      ],
      // TAB: 1,
    };
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
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

    <view v-if="GET_TAB_LIST.length > 1" class="ko-stock__tabs" style="padding: 10px;">
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

    <view class="ko-not-perm" v-if="!GET_TAB_LIST.length" />
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
