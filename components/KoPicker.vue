<script>
import { _get, _isEqual } from "@/utils";

export default {
  name: "KoPicker",
  data() {
    return {};
  },
  props: {
    labelKey: {
      type: String,
      default: "label",
    },
    valueKey: {
      type: String,
      default: "value",
    },
    value: [String, Number],
    placeholder: {
      type: String,
      default: "请选择",
    },

    options: {
      type: Array,
      default: () => [],
    },

    disabled: Boolean,
  },
  methods: {
    onOpen() {
      if (this.disabled) return false;
      this.$refs.ASRef.open();
    },

    // 选中
    onSelect(item) {
      this.$emit("input", _get(item, "value"));
      this.$emit("change", item);
    },
  },
  computed: {
    AList() {
      return this.options
        ?.map((item, index) => ({
          value: _get(item, this.valueKey),
          name: _get(item, this.labelKey),
          item,
          index,
        })) || [];
    },

    ILabel() {
      const item = this.AList.find(item => _isEqual(item.value, this.value));
      return _get(item, "name") || "";
    },
  },
};
</script>

<template>
  <view class="ko-picker">
    <view class="ko-picker__input" @click.stop="onOpen">
      <uv-input
        :value="ILabel"
        :placeholder="placeholder"
        :disabled="disabled"
        suffix-icon="arrow-down"
        clearable
        readonly
      />
    </view>

    <uv-action-sheet
      ref="ASRef"
      :actions="AList"
      round="10px"
      cancel-text="取消"
      @select="onSelect"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-picker {
  width: 100%;

  &__input {
    width: 100%;
  }
}
</style>
