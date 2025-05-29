<script>
export default {
  name: "BasicCard",
  props: {
    notPadding: Boolean,
    spacing: Number,
    className: String,
    noShadow: Boolean,
    bgColor: String,
    paddingSize: {
      type: Number,
      default: 10
    }
  },
  methods: {
    onClick(event) {
      this.$emit("click", event);
    },
  },
};
</script>

<template>
  <view
    class="ko-basic-card"
    @click.stop="onClick"
    :class="[{'not-padding': notPadding}, className || '', noShadow ? '' : 'ko-basic-box-shadow']"
    :style="{ marginBottom: `${spacing || 0}px`, backgroundColor: bgColor, padding: `${paddingSize}px` }"
  >
    <slot></slot>
  </view>
</template>

<style scoped lang="scss">
.ko-basic-card {
  width: 100%;
  position: relative;
  border-radius: 6px;

  &.not-padding {
    padding: 0;
  }
}
</style>
