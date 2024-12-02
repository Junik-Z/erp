<script>
export default {
  name: "HistoryBar",
  props: {
    value: Boolean,
    text: {
      type: String,
      default: "列表",
    },
  },
  computed: {
    getButtonText() {
      return (this.value ? "" : "历史") + this.text;
    },
    getText() {
      return (this.value ? "历史" : "") + this.text;
    },
  },
  methods: {
    onClick() {
      this.$emit("input", !this.value);
      this.$emit("change");
    },
  },
};
</script>

<template>
  <view class="ko-history ko-basic-box-shadow">
    <text>{{ getText }}</text>

    <button class="ko-basic-button__card" @click.stop="onClick">
      {{ getButtonText }}
    </button>
  </view>
</template>

<style scoped lang="scss">
.ko-history {
  padding: 16px 10px;
  text-align: center;
  position: relative;
  font-size: 18px;
  font-weight: bold;

  .ko-basic-button__card {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: normal;
    //padding: 2px 10px;
    background-color: #8f939c;
  }
}
</style>
