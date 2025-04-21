<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { _get, _haveCommonElements, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PageEnums } from "@/utils/config";


export const TabList = [
  {
    label: "销售看版",
    path: PageEnums.saleView,
    roles: ["SALE_STATISTICS"],
  },
  {
    label: "销售订单",
    path: PageEnums.sale,
    roles: ["SALE_LIST", "SALE_WAIT_PAYMENT", "SALE_HISTORY"],
  },
  {
    label: "客户管理",
    path: PageEnums.saleClient,
    roles: ["CUSTOMER_LIST", "CUSTOMER_TEMP"],
  },
  {
    label: "退货处理",
    path: PageEnums.saleRefundList,
    roles: ["SALE_RETURN_LIST", "SALE_RETURN_WAIT_PAYMENT", "SALE_RETURN_HISTORY"],
  },
  {
    label: "我的订单",
    path: PageEnums.saleMyList,
    roles: ["SALE_MY", "SALE_MY_STATISTICS", "SALE_RETURN_MY"],
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
