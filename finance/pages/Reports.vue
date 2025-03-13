<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";

export default {
  name: "Reports",
  data() {
    return {};
  },
  components: {
    BasicCard,
  },
  methods: {},
};
</script>

<template>
  <view class="ko-reports">
    <view class="ko-reports__trend">
      <BasicCard>
        <view>收支趋势</view>
      </BasicCard>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-reports {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 56px - 60px - 10px);
  overflow-y: auto;
  // #endif

  &__trend {
    padding: 0 10px 10px;
  }
}
</style>
