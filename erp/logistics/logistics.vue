<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import SendList from "./components/SendList.vue";
import LogisticsList from "./components/ReceiptList.vue";
import MyLogistics from "./components/MyLogistics.vue";
import { _deepCopy } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "finance",
  components: {LogisticsList, SendList, ViewVersion, UniSegmentedControl, MyLogistics},
  mixins: [mixins],
  data: () => ({
    tabList: [
      /*  {
         label: "物流看版",
         ref: "VVRef",
         roles: ["Admin", "Business", "Delivery_Write", "Delivery_Read"],
       }, */
      {
        label: "配送",
        ref: "SLRef",
        roles: ["Delivery_Write", "Delivery_Read"],
      },
      {
        label: "物流商",
        ref: "RLRef",
        roles: ["Delivery_Write"],
      },
      {
        label: "我的配送",
        ref: "MOLRef",
        roles: ["Delivery_Member"],
      },
    ],
    // TAB: 0,
  }),
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);

    if (option.PAGE_INDEX) {
      this.TAB = +option.PAGE_INDEX;
    }
  },
  onShow() {
    this.$nextTick(() => {
      this.getList();
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

    <!-- <ViewVersion ref="VVRef" v-if="isEqual(GET_TABS_REF_NAME, 'VVRef')" /> -->

    <SendList ref="SLRef" v-if="isEqual(GET_TABS_REF_NAME, 'SLRef')" />

    <LogisticsList ref="RLRef" v-if="isEqual(GET_TABS_REF_NAME, 'RLRef')" />

    <MyLogistics ref="MOLRef" v-if="isEqual(GET_TABS_REF_NAME, 'MOLRef')" />
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
