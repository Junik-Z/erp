<script>
import PickerClass from "./components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import mixins from "@/mixins/mixins";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { getCustomerListApi, refreshCustomerApi } from "@/api/erp/sale";
import { getSupplierListApi, refreshSupplierApi } from "@/api/erp/purchase";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { getUnpaidCustomerApi, getUnpaidSupplierApi } from "@/api/erp/finance";
import IndexList from "@/components/IndexList/IndexList.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import { _get, _isEmpty, _isEqual } from "@/utils";
import { PageEnums } from "@/utils/config";
import TopMenus from "@/finance/components/TopMenus.vue";
import { getStaffListApi, refreshStaffApi } from "@/api/erp/product";

export default {
  name: "Verification",
  components: {
    TopMenus,
    HistoryBar,
    IndexList,
    UvAvatar,
    UniSegmentedControl,
    UniCol,
    BasicCard,
    UniRow,
    LoadMore,
    PickerClass,
  },
  mixins: [mixins],
  props: {
    // 是否是对账客户点击进入的
    isReconcile: Boolean,
  },
  data() {
    return {
      list: [],
      loading: false,
      current: 0,

      noMore: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },

      noRefresh: false,
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
  methods: {
    getList(reset = false) {
      if (reset && !this.noRefresh) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      const Func = (this.isReconcile
          ? [getUnpaidCustomerApi, getUnpaidSupplierApi]
          : [getCustomerListApi, getSupplierListApi, getStaffListApi]
      )[+this.getCurrent];

      Func(this.queryList)
        .then((res) => {
          const list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));

          this.list = this.onMergeArrays(this.list, list, "id");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;
        });
    },

    onRefresh(item, index) {
      this.$set(item, "__r_loading__", true);
      ;[refreshCustomerApi, refreshSupplierApi, refreshStaffApi][+this.getCurrent]({id: item.id})
        .then((res) => {
          uni.showToast({title: "刷新成功"});
          !_isEqual(this.getCurrent, 2) && this.$set(item, "amount", res.data);
        })
        .finally(() => {
          this.$set(item, "__r_loading__", false);
        });
    },

    onJump(item) {
      this.noRefresh = true;
      if ([this.isPerm("FINANCE_RECEIVABLE_CHECK"), this.isPerm("FINANCE_PAYABLE_CHECK")][+this.getCurrent]) {
        uni.navigateTo({
          url: PageEnums.financeCheck + `?id=${item.id}&customer_type=${["sale", "purchase"][+this.getCurrent]}&FORM=${["F_SALE", "F_PURCHASE"][+this.getCurrent]}`,
        });
      } else if (_isEqual(this.getCurrent, 2) && this.isPerm("STAFF_SALARY_LIST")) {
        uni.navigateTo({
          url: PageEnums.staffWages + `?id=${item.id}&name=${item.name}`,
        });
      } else {
        this.noRefresh = false;
      }
    },

    onClickItem(it, node, index) {
      this.onRefresh(node, index);
    },

    onLower() {
      this.noRefresh = false;
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.noRefresh = false;
      this.queryList.nameIndex = key;
      this.getList(true);
    },
  },
  computed: {
    getTabsList() {
      return (this.isReconcile
        ? [
          {
            label: "客户",
            func: 0,
            perm: "FINANCE_UNPAID_CUSTOMER",
          },
          {
            label: "供应商",
            func: 1,
            perm: "FINANCE_UNPAID_SUPPLIER",
          },
        ]
        : [
          {
            label: "客户",
            func: 0,
            perm: "CUSTOMER_LIST",
          },
          {
            label: "供应商",
            func: 1,
            perm: "SUPPLIER_LIST",
          },
          {
            label: "员工",
            func: 2,
            perm: "STAFF_LIST",
          },
        ]).filter(item => this.isPerm(item.perm));
    },

    getCurrent() {
      return _get(this.getTabsList, `${this.current}.func`);
    },

    getEvents() {
      return !this.isReconcile
      && [this.isPerm("CUSTOMER_REFRESH"), this.isPerm("SUPPLIER_REFRESH"), this.isPerm("STAFF_REFRESH")][this.getCurrent]
        ? [{label: "刷新款项"}]
        : [];
    },
  },
};
</script>

<template>
  <view class="ko-verification">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <TopMenus :path="PageEnums.financeVerification" v-if="!isReconcile" />

    <HistoryBar
      v-if="getTabsList.length"
      :values="getTabsList"
      v-model="current"
      label-key="label"

      @change="getList(true)"
    />

    <view class="ko-verification__content">
      <IndexList
        @click="onJump"
        :data="list"
        :events="getEvents"
        @click-item="onClickItem"
        show-amount
        :is-supplier="getCurrent === 1"
        :loading="loading"

        @lower="onLower"
        :no-more="noMore"
        @search="onSearchToNameIndex"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
/* #ifdef MP */
.ko-verification {
  padding-top: 10px;

  display: flex;
  flex-direction: column;
  height: calc(100vh - 10px);

  &__tabs {
    padding: 10px;
  }

  &__content {
    height: 100%;
    flex: 1;
    position: relative;
  }
}

/* #endif */

/* #ifdef H5 */
.ko-verification {
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);

  // #ifdef H5
  ::v-deep .ko-history {
    width: 100%;
  }

  // #endif

  &__tabs {
    padding: 10px;
  }

  &__content {
    width: 1000px;
    margin: 0 auto;
    height: 100%;
    flex: 1;
    position: relative;
  }
}

/* #endif */
</style>
