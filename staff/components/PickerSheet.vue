<script>
export default {
  name: "PickerSheet",
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    value: [String, Number],
  },
  methods: {
    onClick() {
      this.$refs.UASRef.open();
    },
    onSelect(e) {
      this.$emit("input", e.value);
    },
    onClose() {
      console.log("关闭");
    },
  },
  computed: {
    getModelValue() {
      return this.options.find(v => v.value == this.value)?.name;
    },
  },
};
</script>

<template>
  <view class="ko-picker-sheet">
    <view class="ko-picker-sheet__input" @click="onClick">
      <uni-easyinput
        style="width: 100%"
        :value="getModelValue"
        placeholder="请选择"
        :clearable="false"
        suffix-icon="down"
      />
    </view>

    <uv-action-sheet
      ref="UASRef"
      :actions="options"
      @select="onSelect"
      @close="onClose"
      round="10"
      cancel-text="取消"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-picker-sheet {
  width: 100%;

  &__input {
    width: 100%;
    position: relative;

    &:before {
      content: " ";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 8;
    }
  }
}
</style>
