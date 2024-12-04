<script>
export default {
  name: "BasicCard",
  props: {
    notPadding: Boolean,
    spacing: Number,
    className: String,
  },
  methods: {
    onClick() {
      this.$emit("click");
    },
  },
};
</script>

<template>
  <view
    class="ko-basic-card ko-basic-box-shadow"
    @click.stop="onClick"
    :class="[{'not-padding': notPadding}, className || '']"
    :style="{ marginBottom: `${spacing || 0}px` }"
  >
    <slot></slot>
  </view>
</template>

<style scoped lang="scss">
.ko-basic-card {
  width: 100%;
  padding: 10px;
  position: relative;
  border-radius: 6px;

  &.not-padding {
    padding: 0;
  }
}
</style>
