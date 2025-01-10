<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import ViewVersion from "./components/ViewVersion.vue";
import OrderList from "./components/OrderList.vue";
import ClientList from "./components/ClientList.vue";
import RefundList from "./components/RefundList.vue";
import MyOrderList from "./components/MyOrderList.vue";
import { _deepCopy, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "sale",
  components: {
    MyOrderList,
    RefundList,
    ClientList,
    OrderList,
    ViewVersion,
    UniSegmentedControl,
  },
  mixins: [mixins],
  data() {
    return {
      tabList: [
        {
          label: "销售看版",
          ref: "VVRef",
          roles: ["Sales_Read", "Sales_Write"],
        },
        {
          label: "销售订单",
          ref: "OLRef",
          roles: ["Sales_Read", "Sales_Write"],
        },
        {
          label: "客户管理",
          ref: "CLRef",
          roles: ["Sales_Read", "Sales_Write"],
        },
        {
          label: "退货处理",
          ref: "RLRef",
          roles: ["Sales_Read", "Sales_Write"],
        },
        {
          label: "我的订单",
          ref: "MOLRef",
          roles: ["Sales_Member"],
        },
      ],
      // TAB: 2,
    };
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
  mounted() {
    // #ifdef H5
    this.getList();
    // #endif
  },
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);

    if (option.PAGE_INDEX) {
      this.$nextTick(() => {
        this.TAB = +option.PAGE_INDEX;

        setTimeout(() => {
          this.getList();
        }, 100);
      });
    }

    if (option.TO_REF) {
      this.$nextTick(() => {
        setTimeout(() => {
          const key = this.GET_TAB_LIST.findIndex(v => _isEqual(v.ref, option.TO_REF));
          this.TAB = key > -1 ? key : 0;
          console.log("要显示的索引", key);
          this.getList();
        }, 300);
      });
    }
  },
  methods: {
    getList() {
      this.$nextTick(() => {
        if (!this.GET_TABS_REF_NAME) return false;
        this.$refs[this.GET_TABS_REF_NAME]?.getList?.(true);
      });
    },
  },

  // 分享相关
  onShareAppMessage(res) {
    const obj = res.target.dataset.params;
    return new Promise(async (resolve) => {
      const query = await this._GET_SHARE_APP_PARAMS_(obj);

      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;

      console.log(query);
      resolve(query);
    });
  },
};
</script>

<template>
  <view class="ko-stock">
    <view class="ko-stock__tabs" v-if="GET_TAB_LIST.length > 1">
      <UniSegmentedControl
        :values="GET_TAB_LIST"
        label-key="label"
        :current.sync="TAB"
        @clickItem="getList"
      />
    </view>

    <ViewVersion ref="VVRef" v-if="isEqual(GET_TABS_REF_NAME, 'VVRef')" />

    <OrderList ref="OLRef" v-if="isEqual(GET_TABS_REF_NAME, 'OLRef')" />

    <ClientList ref="CLRef" v-if="isEqual(GET_TABS_REF_NAME, 'CLRef')" />

    <RefundList ref="RLRef" v-if="isEqual(GET_TABS_REF_NAME, 'RLRef')" />

    <MyOrderList ref="MOLRef" v-if="isEqual(GET_TABS_REF_NAME, 'MOLRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-stock {
  width: 100%;

  &__tabs {
    padding: 10px;
    // #ifdef H5
    width: 500px;
    // #endif
  }
}

</style>
