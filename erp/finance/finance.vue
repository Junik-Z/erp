<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Receivable from "./components/Receivable.vue";
import PayList from "./components/PayList.vue";
import CostList from "./components/CostList.vue";
import Verification from "./components/Verification.vue";
import { _deepCopy, _get, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "finance",
  components: {Verification, CostList, PayList, Receivable, UniSegmentedControl},
  mixins: [mixins],
  data: () => ({
    tabList: [
      {
        label: "应收款",
        ref: "VVRef",
      },
      {
        label: "应付款",
        ref: "PLRef",
      },
      {
        label: "成本统计",
        ref: "CLRef",
      },
      {
        label: "核对款项",
        ref: "VRef",
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
    })
  },
  methods: {
    getList() {
      this.$nextTick(() => {
        console.log(this.GET_TAB_LIST);
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

    <Receivable ref="VVRef" v-if="isEqual(GET_TABS_REF_NAME,'VVRef')" />

    <PayList ref="PLRef" v-if="isEqual(GET_TABS_REF_NAME,'PLRef')" />

    <CostList ref="CLRef" v-if="isEqual(GET_TABS_REF_NAME,'CLRef')" />

    <Verification ref="VRef" v-if="isEqual(GET_TABS_REF_NAME,'VRef')" />
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
