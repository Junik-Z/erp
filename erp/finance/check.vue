<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import KoNotice from "@/components/Notice/Notice.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  getPayableCheckApi,
  getPayableHistoryListApi,
  getReceivableCheckApi,
  getReceivableHistoryListApi,
} from "@/api/erp/finance";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import mixins from "@/mixins/mixins";

export default {
  name: "check",
  mixins: [mixins],
  components: {OrderCard, LoadMore, UniListItem, UniList, KoNotice, UniSegmentedControl},
  data() {
    return {
      tabs: ["应收账款", "应付账款", "已收账款", "已付账款"],
      current: 0,

      loading: false,
      list: [],
    };
  },
  onLoad(option) {
    this.option = option;
    this.getList();
  },
  methods: {
    getList() {
      const Func = [getReceivableCheckApi, getPayableCheckApi, getReceivableHistoryListApi, getPayableHistoryListApi][this.current];
      Func({
        supplierId: this.option.id,
        ...(this.current > 1 ? {status: "FINISHED"} : {}),
      })
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    getPageType() {
      return ["receivable", "payable", "receivable", "payable"][this.current];
    },
  },
};
</script>

<template>
  <view class="ko-check">
    <KoNotice />
    <view class="ko-check__tabs">
      <UniSegmentedControl :values="tabs" :current.sync="current" @clickItem="getList" />
    </view>
    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard is-check-finance :item="item" @click.stop="onJumpDetails(item, getPageType)" />
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-check {
  padding-bottom: 50px;

  // #ifdef H5
  &__tabs {
    width: 400px;
  }

  // #endif
}
</style>
