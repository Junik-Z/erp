<script>
export default {
  name: "KoRadioGroup",
  props: {
    options: {
      type: [Array],
      default() {
        return [];
      },
    },
    value: [String, Number],
  },
  methods: {
    onRadioChange(event) {
      this.$emit("input", event.detail.value);
    },
  },
};
</script>

<template>
  <radio-group class="ko-radio-group" @change="onRadioChange">
    <radio
      style="transform:scale(0.9);"
      :value="item.value"
      v-for="item of options"
      :key="item.value"
      color="#256eff"
      class="ko-radio-group__item"
      :checked="item.value === value"
    >
      {{ item.label }}
    </radio>
  </radio-group>
</template>

<style scoped lang="scss">
.ko-radio-group {
  &__item + &__item {
    margin-left: 10px;
  }
}
</style>
