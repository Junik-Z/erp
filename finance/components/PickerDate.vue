<script>
import UvDatetimePicker from "./uv-datetime-picker/uv-datetime-picker.vue";

import dayjs from "@/utils/dayjs";

export default {
  name: "PickerDate",
  components: {UvDatetimePicker},
  props: {
    placeholder: {
      type: String,
      default: "请选择",
    },
    value: [String, Number],

    mode: {
      type: String,
      default: "datetime",
    },
    format: {
      type: String,
      default: "YYYY-MM-DD HH:mm:ss",
    },
    toFormatValue: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    onOpen() {
      this.$refs.UDPRef.open();
    },

    // 时间转换
    onConversionTime(time) {
      const day = dayjs(time);
      if (day.isValid()) {
        return day.format(this.format);
      }
      return time;
    },

    onConfirm(event) {
      let val = event.value;

      if (this.toFormatValue) {
        val = this.onConversionTime(val);
      }

      this.$emit("input", val);
      this.$emit("change", {...event, formatValue: val});
    },
  },
  computed: {
    getValue() {
      return this.value ? this.onConversionTime(this.value) : "";
    },

    getPValue() {
      return this.value ? this.onConversionTime(this.value) : +new Date();
    },
  },
};
</script>

<template>
  <view class="ko-picker-date">
    <view class="ko-picker-date__input" @click="onOpen">
      <uni-easyinput
        :placeholder="placeholder"
        :clearable="false"
        suffix-icon="down"
        style="width: 100%;"
        :value="getValue"
      />
    </view>

    <UvDatetimePicker
      :mode="mode"
      ref="UDPRef"
      round="10"
      :title="placeholder"
      :value="getPValue"
      @confirm="onConfirm"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-picker-date {
  width: 100%;

  &__input {
    position: relative;

    &:before {
      content: " ";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9;
    }
  }
}
</style>
