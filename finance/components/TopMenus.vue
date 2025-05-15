<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { _get, _haveCommonElements, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import { PageEnums } from "@/utils/config";

export const TabList = [
  {
    label: "应收款",
    path: PageEnums.financeReceivable,
    roles: ["FINANCE_RECEIVABLE_COUNT", "FINANCE_RECEIVABLE_LIST", "FINANCE_RECEIVABLE_HISTORY"],
  },
  {
    label: "应付款",
    path: PageEnums.financePay,
    roles: ["FINANCE_PAYABLE_COUNT", "FINANCE_PAYABLE_LIST", "FINANCE_PAYABLE_HISTORY"],
  },
  {
    label: "其他支出",
    path: PageEnums.financeExpenses,
    roles: ["COST_STATISTICS", "COST_GET_LIST", "COST_GET_CATEGORY_LIST"],
  },
  {
    label: "核对款项",
    path: PageEnums.financeVerification,
    roles: ["CUSTOMER_LIST", "SUPPLIER_LIST"],
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
    sOrStyle: {
      handler() {
        this.$nextTick(() => {
          this.TabList = this.TabList.map(item => {
            if (_isEqual(item.label, "应收款")) {
              item.path = this.sOrStyle ? PageEnums.financeOrOrder : PageEnums.financeReceivable;
            }
            return item;
          });
        });
      },
      immediate: true,
    },
    sApStyle: {
      handler() {
        this.$nextTick(() => {
          this.TabList = this.TabList.map(item => {
            if (_isEqual(item.label, "应付款")) {
              item.path = this.sApStyle ? PageEnums.financeApPay : PageEnums.financePay;
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
