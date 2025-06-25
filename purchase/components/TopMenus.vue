<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { _get, _haveCommonElements, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PageEnums } from "@/utils/config";


export const TabList = [
  {
    label: "采购看版",
    path: PageEnums.purchaseView,
    roles: ["SUPPLIER_COUNT"],
  },
  {
    label: "采购订单",
    path: PageEnums.purchase,
    roles: ["PURCHASE_LIST", "PURCHASE_WAIT_PAYMENT", "PURCHASE_HISTORY"],
  },
  {
    label: "供应商",
    path: PageEnums.purchaseClient,
    roles: ["SUPPLIER_LIST", "SUPPLIER_TEMP"],
  },
  {
    label: "退货处理",
    path: PageEnums.purchaseRefundList,
    roles: ["PURCHASE_RETURN_LIST", "PURCHASE_RETURN_WAIT_PAYMENT", "PURCHASE_RETURN_HISTORY"],
  },
  {
    label: "我的订单",
    path: PageEnums.purchaseMyList,
    roles: ["PURCHASE_MY_LIST", "PURCHASE_RETURN_MY_LIST"],
  },
];


export default {
  name: "Tabs",
  components: {UniSegmentedControl},
  mixins: [mixins],
  data() {
    return {
      TabList,
    };
  },
  props: {
    path: String,
    noRole: Boolean,
  },
  watch: {
    sPurchase: {
      handler() {
        this.$nextTick(() => {
          this.TabList = this.TabList.map(item => {
            if (_isEqual(item.label, "采购订单")) {
              item.path = this.sPurchase ? PageEnums.purchaseOrder : PageEnums.purchase;
            }
            return item;
          });
        });
      },
      immediate: true,
    },
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
      return this.TabList?.flatMap(item => {
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
