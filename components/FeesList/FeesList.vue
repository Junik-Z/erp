<script>
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import { getOtherCostListApi } from "@/api/erp/sale";
import { _deepCopy, _isEqual, _keys, _omit } from "@/utils";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "FeesList",
  components: {UvActionSheet, UniEasyinput, UniFormsItem},
  props: {
    isForm: Boolean,
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  mixins: [mixins],
  data() {
    return {
      fees: [],

      modelValue: {},

      visible: false,
    };
  },
  methods: {
    getList() {
      getOtherCostListApi()
        .then(res => {
          const obj = res.data;
          this.fees = _keys(obj).map(value => ({value, name: obj[value]}));
        });
    },

    onAdded() {
      this.$refs.UASRef.open();
    },

    onSelect(val) {
      this.$set(this.modelValue, val.value, undefined);
    },

    onInput(key, val) {
      const value = this.toFen(+(val?.replace?.(/\D/g, "") || 0));
      this.$set(this.modelValue, key, value);
      this.$emit("input", _deepCopy(this.modelValue));
    },

    onRemove(key) {
      this.modelValue = _omit(this.modelValue, [key]);
      this.$emit("input", _deepCopy(this.modelValue));
    },
  },
  watch: {
    value: {
      handler(val) {
        this.modelValue = _deepCopy(val) || {};
      },
      immediate: true,
    },
  },
  mounted() {
    this.getList();
  },
  computed: {
    getFeesList() {
      return _keys(this.modelValue);
    },
    getFeesActions() {
      return this.fees.map(item => ({
        ...item,
        disabled: _keys(this?.modelValue || {}).includes(item.value),
      }));
    },
    getLabel() {
      return (key) => {
        return this.fees.find(k => _isEqual(key, k.value))?.name;
      };
    },
  },
};
</script>

<template>
  <view v-if="isForm" class="ko-fees-list">
    <UniFormsItem v-for="(key, index) of getFeesList" :key="index" :label="getLabel(key)">
      <view style="width: 100%; display: flex; align-items: center;">
        <UniEasyinput
          placeholder="请输入"
          type="digit"
          :value="toYuan(modelValue[key]) || null"
          @input="onInput(key, $event)"
        />
        <text style="margin-left: 8px;">
          元
        </text>
        <button @click="onRemove(key)" class="ko-basic-button__card" style="margin-left: 8px;">
          移除
        </button>
      </view>
    </UniFormsItem>

    <view class="ko-fees-list__added" v-if="getFeesList.length < fees.length">
      <button class="ko-basic-button__card" @click="onAdded">添加</button>
    </view>

    <UvActionSheet cancel-text="取消" round="10" @select="onSelect" :actions="getFeesActions" ref="UASRef" />
  </view>

  <view v-else class="ko-fees-list">
    <view class="ko-fees-list__cell" style="margin-top: 10px;" v-for="key of getFeesList" :key="key">
      <label class="ko-basic-label">{{ getLabel(key) }}：</label>
      <text class="ko-fees-list__cell--text ko-basic-money"> {{ toYuan(modelValue[key]) }}元</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-fees-list {
  width: 100%;

  &__added {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &-input {
      display: flex;
      align-items: center;
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .ko-basic-label {
      margin-right: 10px;
    }

    &--text {
      @include basic-text-ellipsis(2);
    }
  }
}
</style>
