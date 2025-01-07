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
import { _deepCopy, _isEmpty } from "@/utils";
import * as uni from "@/utils";

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

      noMore: false,
      queryList: {
        pageSize: 20,
        pageNum: 0,
      },
      tableKey: +new Date()
    };
  },
  methods: {
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
        this.tableKey = +new Date()
      }
      this.loading = true;
      const Func = (this.isReconcile ? [getUnpaidCustomerApi, getUnpaidSupplierApi] : [getCustomerListApi, getSupplierListApi])[+this.current];

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


    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
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
      @change="getList(true)"
    />

    <view class="ko-verification__content">
      <IndexList
        @click="onJump"
        :data="list"
        :events="getEvents"
        @click-item="onClickItem"
        show-amount
        :is-supplier="!!current"
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

  // #ifdef H5
  /deep/ .ko-history {
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
