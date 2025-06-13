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
    },
    boxShadow: {
      type: String,
      default: "0 1px 8px 1px rgba($color: #a5a5a5, $alpha: 0.2)"
    },
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
    :style="{ marginBottom: `${spacing || 0}px`, backgroundColor: bgColor, padding: `${paddingSize}px`, boxShadow }"
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
