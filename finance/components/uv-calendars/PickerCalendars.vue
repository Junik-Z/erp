<script>
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UvCalendars from "./uv-calendars.vue";
import { _isEqual } from "@/utils";

export default {
  name: "PickerCalendars",
  components: {UniEasyinput, UvCalendars},
  props: {
    placeholder: String,
    mode: String,
  },
  data() {
    return {
      calendar: null,
    };
  },
  methods: {
    onOpen() {
      this.$refs.UCRef.open();
    },

    // 点击输入框icon
    onIconClick(event) {
      if (_isEqual("suffix", event)) {
        if (this.getValue) {
          this.calendar = null;
          this.$emit("confirm", null);
        }
      }
    },

    // 确定
    onConfirm(event) {
      this.calendar = event;
      this.$emit("confirm", event);
    },
  },
  computed: {
    getValue() {
      if (_isEqual(this.mode, "range")) {
        if (this.calendar) {
          const r = this.calendar.range || {};
          return `${r.before || ""} 至 ${r.after || ""}`;
        }
        return "";
      }
      return "";
    },
  },
};
</script>

<template>
  <view class="ko-picker-calendars">
    <view class="ko-picker-calendars__input">
      <view class="ko-picker-calendars__input--button" @click="onOpen"></view>
      <UniEasyinput
        :placeholder="placeholder || '请选择'"
        :clearable="true"
        :suffix-icon="getValue ? 'closeempty' : 'down'"
        style="width: 100%;"
        :value="getValue"
        @iconClick.stop="onIconClick"
      />
    </view>

    <UvCalendars
      round="10"
      ref="UCRef"
      :mode="mode"
      @confirm="onConfirm"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-picker-calendars {
  width: 100%;

  &__input {
    position: relative;

    &--button {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 34px;
      z-index: 9;
    }
  }

  // #ifdef H5
  ::v-deep .uv-popup__content.bottom {
    width: 800px;
    margin: 0 auto;
  }

  // #endif
}
</style>
