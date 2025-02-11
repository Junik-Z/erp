<script>
export default {
  name: "LongPressButton",
  props: {
    label: String,
    isCard: Boolean,
    loading: Boolean,
    disabled: Boolean,
    longPressDuration: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      // 记录时间
      timeline: false,
    };
  },
  methods: {
    onTouchStart() {
      console.log("事件开始");
      this.timeline = +new Date();
    },
    onTouchEnd() {
      const time = +new Date();
      const isLong = this.timeline && ((time - this.timeline) > (this.longPressDuration * 1000));

      if (isLong) {
        this.$emit("long");
      } else {
        this.$emit("click");
      }

      this.timeline = false;
    },
    onTouchMove() {
    },
  },
};
</script>

<template>
  <!-- #ifdef MP -->
  <button
    :class="[isCard ? 'ko-basic-button__card' : 'ko-basic-button']"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchMove"
    :disabled="disabled || loading"
    :loading="loading"
    class="ko-long-press-button"
  >
    <slot>
      <text>{{ label }}</text>
    </slot>
  </button>
  <!-- #endif -->
  <!-- #ifdef H5 -->
  <button
    :class="[isCard ? 'ko-basic-button__card' : 'ko-basic-button']"
    @pointerdown="onTouchStart"
    @pointerup="onTouchEnd"
    @pointermove="onTouchMove"
    :disabled="disabled || loading"
    :loading="loading"
  >
    <slot>
      <text>{{ label }}</text>
    </slot>
  </button>
  <!-- #endif -->
</template>

<style lang="scss">

</style>
