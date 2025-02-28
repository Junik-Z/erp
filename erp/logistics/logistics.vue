<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import SendList from "./components/SendList.vue";
import LogisticsList from "./components/ReceiptList.vue";
import MyLogistics from "./components/MyLogistics.vue";
import { _deepCopy, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "finance",
  components: {LogisticsList, SendList, ViewVersion, UniSegmentedControl, MyLogistics},
  mixins: [mixins],
  data: () => ({
    tabList: [
      {
        label: "配送",
        ref: "SLRef",
        roles: ["LOGISTICS_COUNT", "DELIVERY_LIST", "DELIVERY_HISTORY"],
      },
      {
        label: "物流商",
        ref: "RLRef",
        roles: ["LOGISTICS_LIST"],
      },
      {
        label: "我的配送",
        ref: "MOLRef",
        roles: ["DELIVER_MY_STATISTICS", "DELIVERY_MY_LIST"],
      },
    ],
    // TAB: 0,
  }),
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);

    if (option.PAGE_INDEX) {
      this.TAB = +option.PAGE_INDEX;
    }

    if (option.TO_REF) {
      this.TAB = this.GET_TAB_LIST.findIndex(v => _isEqual(v.ref, option.TO_REF)) || 0;
    }
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },
  methods: {
    getList() {
      this.$nextTick(() => {
        if (!this.GET_TABS_REF_NAME) return false;
        this.$refs[this.GET_TABS_REF_NAME]?.getList?.(true);
      });
    },
  },
};
</script>

<template>
  <view class="ko-purchase">
    <view class="ko-purchase__tabs" v-if="GET_TAB_LIST.length > 1">
      <UniSegmentedControl
        :values="GET_TAB_LIST"
        label-key="label"
        :current.sync="TAB"
        @clickItem="getList"
      />
    </view>

    <SendList ref="SLRef" v-if="isEqual(GET_TABS_REF_NAME, 'SLRef')" />

    <LogisticsList ref="RLRef" v-if="isEqual(GET_TABS_REF_NAME, 'RLRef')" />

    <MyLogistics ref="MOLRef" v-if="isEqual(GET_TABS_REF_NAME, 'MOLRef')" />

    <view class="ko-not-perm" v-if="!GET_TAB_LIST.length" />
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
