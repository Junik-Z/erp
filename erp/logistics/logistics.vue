<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import SendList from "./components/SendList.vue";
import LogisticsList from "./components/ReceiptList.vue";
import { _get, _haveCommonElements, _isEqual } from "@/utils";
import OrderList from "@/erp/sale/components/OrderList.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "finance",
  components: {OrderList, LogisticsList, SendList, ViewVersion, UniSegmentedControl},
  mixins: [mixins],
  data: () => ({
    tabList: [
      {
        label: "物流看版",
        ref: "VVRef",
        roles: ["Admin", "Business", "Delivery_Write", "Delivery_Read"],
      },
      {
        label: "配送",
        ref: "SLRef",
        roles: ["Admin", "Business", "Delivery_Write", "Delivery_Read"],
      },
      {
        label: "物流商",
        ref: "RLRef",
        roles: ["Admin", "Business", "Delivery_Write"],
      },
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
      return this.tabList
        .flatMap(item => {
          const role = this.GET_USER_ROLE;
          if (_haveCommonElements(role, item.roles)) {
            return [item];
          } else {
            return [];
          }
        });
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
    <view class="ko-purchase__tabs">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <SendList ref="SLRef" v-if="isEqual(getRefName, 'SLRef')" />

    <LogisticsList ref="RLRef" v-if="isEqual(getRefName, 'RLRef')" />
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
