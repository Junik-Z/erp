<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import OrderList from "./components/OrderList.vue";
import ClientList from "./components/ClientList.vue";
import RefundList from "./components/RefundList.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "Purchase",
  components: {RefundList, ClientList, OrderList, ViewVersion, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "采购看版",
        ref: "VVRef",
      },
      {
        label: "采购订单",
        ref: "OLRef",
      },
      {
        label: "供应商管理",
        ref: "CLRef",
      },
      {
        label: "退货处理",
        ref: "RLRef",
      },
    ],
    current: 0,
  }),
  onShow() {
    this.getList();
  },
  mounted() {
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

  onShareAppMessage(res) {
    console.log(res);
    return {};
  },
};
</script>

<template>
  <view class="ko-purchase">
    <view class="ko-purchase__tabs">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <OrderList ref="OLRef" v-if="isEqual(getRefName, 'OLRef')" />

    <ClientList ref="CLRef" v-if="isEqual(getRefName, 'CLRef')" />

    <RefundList ref="RLRef" v-if="isEqual(getRefName, 'RLRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 400px;
    // #endif
  }
}
</style>
