<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "@/erp/sale/components/ViewVersion.vue";
import OrderList from "@/erp/sale/components/OrderList.vue";
import ClientList from "@/erp/sale/components/ClientList.vue";
import RefundList from "@/erp/sale/components/RefundList.vue";
import { _get, _isEqual } from "@/utils";

export default {
  name: "sale",
  components: {RefundList, ClientList, OrderList, ViewVersion, UniSegmentedControl},
  data: () => ({
    tabList: [
      {
        label: "销售看版",
        ref: "VVRef",
      },
      {
        label: "销售订单",
        ref: "OLRef",
      },
      {
        label: "客户管理",
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

  // 分享相关
  onShareAppMessage(res) {
    console.log(res);
    return {};
  },
};
</script>

<template>
  <view class="ko-stock">
    <view class="ko-stock__tabs">
      <UniSegmentedControl :values="getTabList" label-key="label" :current="current" @clickItem="onTab" />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(getRefName, 'VVRef')" />

    <OrderList ref="OLRef" v-if="isEqual(getRefName, 'OLRef')" />

    <ClientList ref="CLRef" v-if="isEqual(getRefName, 'CLRef')" />

    <RefundList ref="RLRef" v-if="isEqual(getRefName, 'RLRef')" />
  </view>
</template>

<style scoped lang="scss">

.ko-stock {
  width: 100%;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 400px;
    // #endif
  }
}

</style>
