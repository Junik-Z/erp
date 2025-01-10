<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";

export default {
  name: "Tabs",
  components: {UniSegmentedControl},
  data() {
    return {};
  },
  props: {
    tabs: Array,
    current: Number,
  },
  methods: {
    // 跳转到指定页面 来自 tabs 的跳转
    onJumpByTabs({currentIndex}) {
      const node = this.tabs[currentIndex];
      this.$emit("click-tab", node);
      if (node.path) {
        uni.redirectTo({url: node.path});
      }
    },
  },
};
</script>

<template>
  <view class="ko-tabs">
    <UniSegmentedControl
      :values="tabs"
      label-key="label"
      :current="current"
      @clickItem="onJumpByTabs"
      is-router
    />
  </view>
</template>

<style scoped lang="scss">
.ko-tabs {
  padding: 10px;
  // #ifdef H5
  width: 300px;
  // #endif
}
</style>
