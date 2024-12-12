<script>
import Verification from "./components/Verification.vue";

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
  padding-bottom: 80px;
}
</style>
