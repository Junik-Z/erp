<script>
import { getWarningListApi } from "@/api/erp/stock";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get } from "@/utils";
import mixins from "@/mixins/mixins";

export default {
  name: "warning",
  mixins: [mixins],
  components: {KoTable, ProductCard, UniList, UniListItem, LoadMore},
  data() {
    return {
      list: [],
      loading: false,

      FieldList: [],
    };
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = false;
      getWarningListApi({pageSize: 10000, pageNum: 0})
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

    // #ifdef H5
    columnsList() {
      return [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "产品图片",
          prop: "name",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: this.getImageUrl(_get(row, "images")),
                  size: 64,
                  text: _get(row, "images"),
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        ...(this.FieldList.map(item => ({
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        }))),
        {
          label: "库存数量",
          prop: "quantity",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.quantity]);
          },
        },
        {
          label: "预警库存",
          prop: "stockWarning",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.stockWarning]);
          },
        },
      ];
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-warning">
    <!-- #ifdef MP -->
    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <ProductCard :node="item" is-warning readonly />
        </template>
      </UniListItem>
      <LoadMore :loading="loading" />
    </UniList>
    <!-- #endif -->


    <!-- #ifdef H5 -->
    <view style="padding: 10px;">
      <KoTable
        :loading="loading"
        :columns="columnsList"
        :data="list"
        empty-text="暂无数据"
        stripe
      >
      </KoTable>
    </view>
    <!-- #endif -->


  </view>
</template>

<style scoped lang="scss">
.ko-warning {
  padding-bottom: 50px;
}
</style>
