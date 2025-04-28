<script>
import Verification from "./verification.vue";

export default {
  name: "reconcile",
  components: {Verification},
  onLoad() {
    this.$nextTick(() => {
      this.$refs.VerificationRef.getList();
    });
  },
  data() {
    return {};
  },
};
</script>

<template>
  <view class="ko-reconcile">
    <Verification ref="VerificationRef" is-reconcile/>
  </view>
</template>

<style scoped lang="scss">
.ko-reconcile {
  //padding-bottom: 80px;
}
</style>
