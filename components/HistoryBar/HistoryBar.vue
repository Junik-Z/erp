<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";

export default {
  name: "HistoryBar",
  components: {UniSegmentedControl},
  props: {
    value: Boolean,
    text: {
      type: String,
      default: "列表",
    },
    values: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      content: 0,
    };
  },
  computed: {
    getButtonText() {
      return (this.value ? "" : "历史") + this.text;
    },
    getText() {
      return (this.value ? "历史" : "") + this.text;
    },
  },
  watch: {
    value: {
      handler(val) {
        this.content = +val;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onClick() {
      this.$emit("input", !!this.content);
      this.$emit("change");
    },
  },
};
</script>

<template>
  <view class="ko-history ko-basic-box-shadow">
    <UniSegmentedControl
      :current.sync="content"
      :values="values.length ? values : [text, `历史${text}`]"
      @clickItem="onClick"
      style-type="text"
    />

    <block v-if="false">
      <text>{{ getText }}</text>

      <button class="ko-basic-button__card" @click.stop="onClick">
        {{ getButtonText }}
      </button>
    </block>
  </view>
</template>

<style scoped lang="scss">
.ko-history {
  padding: 2px 30px;
  text-align: center;
  position: relative;
  font-size: 18px;
  font-weight: bold;
  border-radius: 20px;
  margin: 0 20px 10px;

  // #ifdef H5
  width: 1024px;
  margin: 0 auto 16px;
  // #endif

  .ko-basic-button__card {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: normal;
    //padding: 2px 10px;
    background-color: #8f939c;
    color: #337fff;
  }
}
</style>
