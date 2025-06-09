<script>
import Merchants from "./Merchants.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import mixins from "@/mixins/mixins";
import Classify from "./Classify.vue";
import SaleSetting from "./SaleSetting.vue";

export default {
  name: "Admin",
  components: {
    Merchants,
    UniSegmentedControl,
    Classify,
    SaleSetting,
  },
  mixins: [mixins],
  data() {
    return {
      current: 0,
    };
  },
  onShow() {
  },
  onLoad() {
  },
  methods: {},
};
</script>

<template>
  <view class="ko-admin">
    <view class="ko-admin__tabs">
      <UniSegmentedControl
        :values="['商户管理', '商户分类', '卖场配置']"
        :current.sync="current"
      />
    </view>

    <view class="ko-admin__wrap">
      <Merchants v-if="isEqual(0, current)" />
      <Classify v-if="isEqual(1, current)" />
      <SaleSetting v-if="isEqual(2, current)" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-admin {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__wrap {
    flex: 1;
    overflow: hidden;
  }

  &__tabs {
    padding: 10px;
  }

  // #ifdef H5
  &__tabs {
    width: 400px;
    margin: 0 auto;
  }

  // #endif
}
</style>
