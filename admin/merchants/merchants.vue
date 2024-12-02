<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { _get, _isEqual } from "@/utils";
import SetRole from "@/admin/merchants/conponents/SetRole.vue";

export default {
  name: "merchants",
  components: {SetRole, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "职员授权",
        ref: "SRRef",
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
  <view class="ko-merchants">
    <view class="ko-merchants__tabs" v-if="getTabList.length > 1">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <SetRole ref="SRRef" v-if="isEqual(getRefName, 'SRRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-merchants {

  &__tabs {
    padding: 10px;

    // #ifdef H5
    width: 200px;
    // #endif
  }
}
</style>
