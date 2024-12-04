<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "@/erp/stock/components/ViewVersion.vue";
import Warehouse from "@/erp/stock/components/Warehouse.vue";
import Out from "@/erp/stock/components/Out.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "stock",
  components: {Out, Warehouse, ViewVersion, UniSegmentedControl},
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
    <view class="ko-stock__tabs" style="padding: 10px;">
      <UniSegmentedControl :values="tabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <Warehouse ref="WRef" v-if="isEqual(getRefName, 'WRef')" />

    <Out ref="ORef" v-if="isEqual(getRefName, 'ORef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-stock {
  width: 100%;
  padding-bottom: 50px;

  // #ifdef H5
  &__tabs {
    width: 300px;
  }

  // #endif
}
</style>
