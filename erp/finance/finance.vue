<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Receivable from "./components/Receivable.vue";
import PayList from "./components/PayList.vue";
import CostList from "./components/CostList.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "finance",
  components: {CostList, PayList, Receivable, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "收款统计",
        ref: "VVRef",
      },
      {
        label: "付款统计",
        ref: "PLRef",
      },
      {
        label: "成本统计",
        ref: "CLRef",
      },
    ],
    current: 0,
  }),
  onShow() {
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
  <view class="ko-purchase">
    <view class="ko-purchase__tabs">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <Receivable ref="VVRef" v-if="isEqual(getRefName,'VVRef')" />

    <PayList ref="PLRef" v-if="isEqual(getRefName,'PLRef')" />

    <CostList ref="CLRef" v-if="isEqual(getRefName,'CLRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 300px;
    // #endif
  }
}
</style>
