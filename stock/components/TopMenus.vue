<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { _get, _haveCommonElements, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PageEnums } from "@/utils/config";


export const TabList = [
  {
    label: "库存看版",
    path: PageEnums.stockView,
    roles: ["STOCK_COUNT"],
  },
  {
    label: "入库审批",
    path: PageEnums.stockWarehouse,
    roles: ["STOCK_INBOUND_LIST", "STOCK_INBOUND_HISTORY", "STOCK_INBOUND_CANCEL"],
  },
  {
    label: "出库审批",
    path: PageEnums.stockOut,
    roles: ["STOCK_OUTBOUND_LIST", "STOCK_OUTBOUND_HISTORY", "STOCK_OUTBOUND_CANCEL"],
  },
  {
    label: "核对库存",
    path: PageEnums.stockVerification,
    roles: ["STOCK_CHECK", "STOCK_TAKING"],
  },
];


export default {
  name: "Tabs",
  components: {UniSegmentedControl},
  mixins: [mixins],
  data() {
    return {
      tabs: TabList,
    };
  },
  props: {
    path: String,
    noRole: Boolean,
  },
  methods: {
    // 跳转到指定页面 来自 tabs 的跳转
    onJumpByTabs({currentIndex}) {
      const node = this.getTabsList[currentIndex];

      this.$emit("click-tab", node);

      if (node.path) {
        uni.redirectTo({url: node.path});
      }
    },
  },
  computed: {
    getTabsList() {
      return TabList?.flatMap(item => {
        if (item.roles) {
          const role = this.GET_USER_ROLE;
          if (_haveCommonElements(role, item.roles) || this.isAdmin) {
            return [item];
          } else {
            return [];
          }
        }
        return [item];
      }) || [];
    },

    getCurrent() {
      return this.getTabsList?.findIndex(item => _isEqual(item.path, this.path));
    },
  },
  mounted() {
    setTimeout(() => {
      this.$nextTick(() => {
        if (this.getTabsList.length) {
          const path = _get(this.getTabsList, "0.path") || this.PageEnums.produce;
          this.$emit("jump-path", path);
        }

        this.$emit("update:no-role", !this.getTabsList.length);
      });
    }, 10);
  },
};
</script>

<template>
  <view class="ko-tabs" v-if="getTabsList.length > 1">
    <UniSegmentedControl
      :values="getTabsList"
      label-key="label"
      :current="getCurrent"
      @clickItem="onJumpByTabs"
      is-router
    />
  </view>
</template>

<style scoped lang="scss">
.ko-tabs {
  padding: 0 10px 10px;

  // #ifdef H5
  width: 500px;
  // #endif
}
</style>
