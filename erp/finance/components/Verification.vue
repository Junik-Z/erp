<script>
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import mixins from "@/mixins/mixins";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { getCustomerListApi, refreshCustomerApi } from "@/api/erp/sale";
import { getSupplierListApi, refreshSupplierApi } from "@/api/erp/purchase";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { getUnpaidCustomerApi, getUnpaidSupplierApi } from "@/api/erp/finance";
import IndexList from "@/components/IndexList/IndexList.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";

export default {
  name: "Verification",
  components: {
    HistoryBar,
    IndexList,
    UvAvatar,
    UniSegmentedControl,
    UniList,
    UniCol,
    BasicCard,
    UniRow,
    LoadMore,
    PickerClass,
  },
  mixins: [mixins],
  props: {
    isReconcile: Boolean,
  },
  data() {
    return {
      list: [],
      loading: false,
      current: 0,
    };
  },
  methods: {
    getList() {
      this.loading = true;
      const Func = (this.isReconcile ? [getUnpaidCustomerApi, getUnpaidSupplierApi] : [getCustomerListApi, getSupplierListApi])[+this.current];

      Func({pageSize: 1000000, pageNum: 0})
        .then((res) => {
          this.list = (res.data || []).map(item => ({
            ...item,
            value: item.id,
            label: item.name,
            logo: item.logo,
          }));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onRefresh(item) {
      this.$set(item, "__r_loading__", true);
      ;[refreshCustomerApi, refreshSupplierApi][+this.current]({id: item.id})
        .then(() => {
          uni.showToast({title: "刷新成功"});
          this.getList();
        })
        .finally(() => {
          this.$set(item, "__r_loading__", false);
        });
    },

    onJump(item) {
      uni.navigateTo({
        url: "/erp/finance/check" + `?id=${item.id}&customer_type=${["sale", "purchase"][+this.current]}`,
      });
    },

    onClickItem(it, node) {
      this.onRefresh(node);
    },
  },
  computed: {
    getTabsList() {
      return this.isReconcile ? ["客户列表", "供应商列表"] : ["客户列表", "供应商列表"];
    },

    getEvents() {
      return this.isRefreshPayment && !this.isReconcile ? [{label: "刷新款项"}] : [];
    },
  },
};
</script>

<template>
  <view class="ko-verification">
    <HistoryBar
      :values="getTabsList"
      v-model="current"
      @change="getList()"
    />

    <view class="ko-verification__content">
      <IndexList
        @click="onJump"
        :options="list"
        :events="getEvents"
        @click-item="onClickItem"
        show-amount
        :is-supplier="!!current"
        :loading="loading"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
/* #ifdef MP */
.ko-verification {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);

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
  width: 1366px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 88vh;

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
