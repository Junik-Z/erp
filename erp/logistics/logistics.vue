<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import SendList from "./components/SendList.vue";
import ReceiptList from "./components/ReceiptList.vue";
import { _get, _isEqual } from "@/utils";
import OrderList from "@/erp/sale/components/OrderList.vue";

export default {
  name: "finance",
  components: {OrderList, ReceiptList, SendList, ViewVersion, UniSegmentedControl},
  data: () => ({
    tabs: ["物流看版", "发件", "收件"],
    tabList: [
      /*  {
         label: "物流看版",
         ref: "VVRef",
       }, */
      {
        label: "配送",
        ref: "SLRef",
      },
      /*  {
         label: "收件",
         ref: "RLRef",
       }, */
    ],
    current: 0,
  }),
  onShow() {
    this.getList();
  },
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
    <view class="ko-purchase__tabs" v-if="getTabList.length < 1">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <SendList ref="SLRef" v-if="isEqual(getRefName, 'SLRef')" />

    <ReceiptList ref="RLRef" v-if="isEqual(getRefName, 'RLRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 300px;
    // #endif
  }
}
</style>
