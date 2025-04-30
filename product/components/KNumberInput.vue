<script>
import { _deepCopy, _isEqual, _toFinite } from "@/utils";

export default {
  name: "KNumberInput",
  props: {
    value: [String, Number],
    step: {
      type: Number,
      default: 1,
    },
    min: {
      type: Number,
      default: 0,
    },
    trim: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    value: {
      handler() {
        const v = _toFinite(this.value);
        this.val = isNaN(v) ? undefined : v;
      },
      immediate: true,
    },
  },
  data() {
    return {
      val: undefined,
    };
  },
  methods: {
    onInput(event) {
      let value = event.detail.value;
      // 判断是否去除空格
      if (this.trim) {
        if (typeof this.trim === "boolean" && this.trim) {
          value = this.trimStr(value);
        }
        if (typeof this.trim === "string") {
          value = this.trimStr(value, this.trim);
        }
      }
      this.val = value;
      this.onChange();
    },

    trimStr(str, pos = "both") {
      if (pos === "both") {
        return str.trim();
      } else if (pos === "left") {
        return str.trimLeft();
      } else if (pos === "right") {
        return str.trimRight();
      } else if (pos === "start") {
        return str.trimStart();
      } else if (pos === "end") {
        return str.trimEnd();
      } else if (pos === "all") {
        return str.replace(/\s+/g, "");
      } else if (pos === "none") {
        return str;
      }
      return str;
    },

    onBtnClick(type) {
      if (_isEqual(type, "minus")) this.val -= _deepCopy(this.step || 1);
      if (_isEqual(type, "added")) this.val += _deepCopy(this.step || 1);
      if (this.val <= (this.min || 0)) this.val = _deepCopy(this.min || 0);
      this.onChange();
    },

    onChange() {
      this.$emit("input", this.val);
    },
  },
};
</script>

<template>
  <view class="ko-number-input" @click.stop>
    <button v-show="val" class="ko-number-input__btn" :disabled="val <= (min || 0)" @click.stop="onBtnClick('minus')">
      -
    </button>
    <input v-show="val" v-model="val" class="ko-number-input__input" @input="onInput" />
    <button class="ko-number-input__btn" @click.stop="onBtnClick('added')">
      +
    </button>
  </view>
</template>

<style scoped lang="scss">
.ko-number-input {
  --k-number-input-btn-size: 26px;
  --k-number-input-btn-font-size: 20px;

  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;

  &__btn {
    height: var(--k-number-input-btn-size);
    width: var(--k-number-input-btn-size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    box-shadow: 0 0 15px rgba(255, 214, 0, 0.5);
    background-image: linear-gradient(to right, #f59e0b, #fbbf24);
    z-index: 20;

    color: #fff;
    padding-bottom: 3px;
    font-size: var(--k-number-input-btn-font-size);
  }

  &__input {
    flex: 1;
    margin: 0 4px;
    text-align: center;
    font-size: 14px;
  }
}
</style>
