<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Classify from "./components/Classify.vue";
import ProductList from "./components/ProductList.vue";
import FieldList from "@/erp/product/components/Field.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "product",
  components: {ProductList, Classify, UniSegmentedControl, FieldList},
  data: () => ({
    tabList: [
      {
        label: "产品管理",
        ref: "ListRef",
      },
      {
        label: "分类管理",
        ref: "ClassRef",
      },
      {
        label: "扩展字段",
        ref: "FieldRef",
      },
    ],
    current: 0,
  }),
  methods: {
    onTab(event) {
      this.current = event.currentIndex;
      this.getList();
    },
    getList() {
      if (!this.getRefName) return false;

      this.$nextTick(() => {
        this.$refs[this.getRefName]?.getList?.();
      });
    },
  },
  onShow() {
    this.getList();
    console.log("触发两次");
  },
  computed: {
    getTabList() {
      return this.tabList;
    },
    getRefName() {
      return _get(this.getTabList, `${this.current}.ref`);
    },
    isEqual() {
      return _isEqual;
    },
  },
};
</script>

<template>
  <view class="ko-purchase">
    <view style="padding: 10px;">
      <UniSegmentedControl :values="tabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ProductList ref="ListRef" v-if="isEqual(getRefName, 'ListRef')" />

    <Classify ref="ClassRef" v-if="isEqual(getRefName, 'ClassRef')" />

    <FieldList ref="FieldRef" v-if="isEqual(getRefName, 'FieldRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;
}
</style>
