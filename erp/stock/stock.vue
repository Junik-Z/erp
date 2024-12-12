<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import Warehouse from "./components/Warehouse.vue";
import Out from "./components/Out.vue";
import Verification from "./components/Verification.vue";

import { _get, _isEqual } from "@/utils";
import KoNotice from "@/components/Notice/Notice.vue";

export default {
  name: "stock",
  components: {Verification, KoNotice, Out, Warehouse, ViewVersion, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "库存看版",
        ref: "VVRef",
      },
      {
        label: "入库审批",
        ref: "WRef",
      },
      {
        label: "出库审批",
        ref: "ORef",
      },
      {
        label: "核对库存",
        ref: "VRef",
      },
    ],
    current: 0,
  }),
  onLoad() {
    this.getList();
  },
  methods: {
    onTab(event) {
      this.current = event.currentIndex;
      this.getList();
    },
    getList() {
      if (!this.getRefName) return false;
      this.$nextTick(() => {
        this.$refs[this.getRefName]?.getList?.();
      });
    },
  },
  computed: {
    getTabList() {
      return this.tabList;
    },
    getRefName() {
      return _get(this.getTabList, `${this.current}.ref`);
    },
    isEqual() {
      return _isEqual;
    },
  },
};
</script>

<template>
  <view class="ko-stock">
    <KoNotice />
    <view class="ko-stock__tabs" style="padding: 10px;">
      <UniSegmentedControl :values="tabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <Warehouse ref="WRef" v-if="isEqual(getRefName, 'WRef')" />

    <Out ref="ORef" v-if="isEqual(getRefName, 'ORef')" />

    <Verification ref="VRef" v-if="isEqual(getRefName, 'VRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-stock {
  width: 100%;

  // #ifdef H5
  &__tabs {
    width: 300px;
  }

  // #endif
}
</style>
