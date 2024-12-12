<script>
import KoNotice from "@/components/Notice/Notice.vue";
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import { getInboundDetailListApi, getOutboundDetailListApi } from "@/api/erp/stock";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import OrderCard from "@/erp/components/OrderCard/OrderCard.vue";

export default {
  name: "check",
  components: {OrderCard, UniListItem, UniList, LoadMore, UniSegmentedControl, KoNotice},
  data() {
    return {
      tabList: ["入库核对", "出库核对"],
      current: 0,
      loading: false,
      option: {},
      list: [],
    };
  },
  onLoad(option) {
    this.option = option;
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      this.list = [];
      const Func = [getInboundDetailListApi, getOutboundDetailListApi][this.current];
      Func(this.option)
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<template>
  <view class="ko-check">
    <KoNotice />
    <view class="ko-check__tabs" style="padding: 10px;">
      <UniSegmentedControl :values="tabList" :current.sync="current" @clickItem="getList" />
    </view>

    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard is-check-stock :item="item" />
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
    </UniList>

  </view>
</template>

<style scoped lang="scss">
.ko-check {
  width: 100%;

  // #ifdef H5
  &__tabs {
    width: 200px;
  }

  // #endif
}
</style>
