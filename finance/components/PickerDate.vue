<script>
// #ifdef H5
import { DatePicker } from "@/uni_modules/element-ui/element.min";
// #endif
import UvDatetimePicker from "./uv-datetime-picker/uv-datetime-picker.vue";

import dayjs from "@/utils/dayjs";
import advancedFormat from "../advancedFormat";
import weekOfYear from "../weekOfYear";

dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

let visibleItemCount = 6;

// #ifdef H5
visibleItemCount = 15;
// #endif


export default {
  name: "PickerDate",
  components: {
    // #ifdef H5
    DatePicker,
    // #endif

    UvDatetimePicker,
  },
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
    showFormat: String,
  },
  data() {
    return {visibleItemCount};
  },
  methods: {
    onOpen() {
      this.$refs.UDPRef.open();
    },

    // 时间转换
    onConversionTime(time, isShow = false) {
      console.log(time);
      const day = dayjs(time);
      if (day.isValid()) {
        return day.format(isShow && this.showFormat ? this.showFormat : this.format);
      }
      return time;
    },

    onConfirm(event) {
      let val = event.value;

      if (this.toFormatValue) {
        val = this.onConversionTime(val);
      }

      this.$emit("input", val);
      this.$emit("change", {...event, formatValue: val, value: event.value});
    },
  },
  computed: {
    getValue() {
      return this.value ? this.onConversionTime(this.value, true) : "";
    },

    getPValue() {
      return this.value ? this.onConversionTime(this.value) : +new Date();
    },

    // #ifdef H5
    ElDateType() {
      return {
        datetime: "date",//	年月日时分选择
        date: "date",//		年月日选择
        time: "date",//		时分选择，mode="time"时value的格式应该类似00:00
        "year-month": "month",//		年月选择
        year: "year",//		年选择
      }[this.mode] || this.mode;
    },
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },

    getFormat() {
      return this.format?.replace("YYYY", "yyyy");
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-picker-date">
    <!-- #ifdef MP | H5 -->
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
      :visible-item-count="visibleItemCount"
    />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <DatePicker
      v-if="false"
      :placeholder="placeholder"
      :type="ElDateType"
      :format="getFormat"
      v-model="modelValue"
    ></DatePicker>
    <!-- #endif -->
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

  // #ifdef H5
  ::v-deep .uv-popup__content.bottom {
    width: 800px;
    margin: 0 auto;
  }

  // #endif
}
</style>
