<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import WorkList from "./components/WorkList.vue";
import { _deepCopy, _get, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "sale",
  components: {WorkList, ViewVersion, UniSegmentedControl},
  mixins: [mixins],
  data() {
    return {
      tabList: [
        {
          label: "生产看版",
          ref: "VVRef",
        },
        {
          label: "生产工单",
          ref: "WLRef",
        },
      ],
      current: 0,
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
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);

    if (option.PAGE_INDEX) {
      this.TAB = +option.PAGE_INDEX;
    }
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
    <view class="ko-purchase__tabs">
      <UniSegmentedControl
      :values="GET_TAB_LIST"
      label-key="label"
      :current.sync="TAB"
      @clickItem="getList"
    />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(GET_TABS_REF_NAME, 'VVRef')" />

    <WorkList ref="WLRef" v-if="isEqual(GET_TABS_REF_NAME, 'WLRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;
  padding-bottom: 80px;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 200px;
    // #endif
  }
}
</style>
