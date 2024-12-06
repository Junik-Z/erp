<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Receivable from "./components/Receivable.vue";
import PayList from "./components/PayList.vue";
import CostList from "./components/CostList.vue";
import Verification from "./components/Verification.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "finance",
  components: {Verification, CostList, PayList, Receivable, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "应收款",
        ref: "VVRef",
      },
      {
        label: "应付款",
        ref: "PLRef",
      },
      {
        label: "成本统计",
        ref: "CLRef",
      },
      {
        label: "核对款项",
        ref: "VRef",
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

    <Verification ref="VRef" v-if="isEqual(getRefName,'VRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;
  padding-bottom: 50px;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 300px;
    // #endif
  }
}
</style>
