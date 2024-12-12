<script>
import { getWarningListApi } from "@/api/erp/stock";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";

export default {
  name: "warning",
  components: {ProductCard, UniList, UniListItem, LoadMore},
  data() {
    return {
      list: [],
      loading: false,
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = false;
      getWarningListApi()
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
  <view class="ko-warning">

    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <ProductCard :node="item" is-warning readonly />
        </template>
      </UniListItem>
      <LoadMore :loading="loading" />
    </UniList>

  </view>
</template>

<style scoped lang="scss">
.ko-warning {
  padding-bottom: 50px;
}
</style>
