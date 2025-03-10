<script>
import { getWarningListApi } from "@/api/erp/stock";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import { getProductFieldApi } from "@/api/erp/product";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import KoList from "@/components/List/List.vue";
import InventoryList from "./components/InventoryList/InventoryList.vue";

export default {
  name: "warning",
  mixins: [mixins],
  components: {
    InventoryList,
    KoList,
    UvAvatar,
    BasicCard,
    UniSection,
    KoTable,
    ProductCard,
    LoadMore,
  },
  data() {
    return {
      list: [],
      loading: false,
      FieldList: [],
      groupList: {},
      queryList: {
        pageSize: 34,
        pageNum: 0,
      },
      noMore: false,

      columnTable: [
        {
          label: "名称",
          key: "name",
          isField: true,
          span: 12,
        },
        {
          label: "预警",
          key: "stockWarning",
          span: 6,
          class: "ko-basic-money",
        },
        {
          label: "库存",
          key: "quantity",
          span: 6,
          class: "ko-basic-money",
        },
      ],
    };
  },
  async onLoad() {
    await this.getExtendList();
    await this.getList(true);
  },
  methods: {
    RequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset = false) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = false;

      getWarningListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data, "id");
          this.noMore = res.data.length < this.queryList.pageSize || _isEmpty(res.data);
          console.log(this.list);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getExtendList() {
      return getProductFieldApi({pageSize: 1000, pageNum: 0})
        .then(res => {
          uni.$__FIELD_LIST__ = res.data;
          this.FieldList = res.data;
        });
    },

    // 点击列表项了
    onClickCell(obj) {
      const node = obj.item;
      if (node.images) {
        const image = this.getImageUrl(node.images);
        if (image) {
          uni.previewImage({
            urls: [image],
          });
        }
      }
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
          label: "预警库存",
          prop: "stockWarning",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.stockWarning]);
          },
        },
        {
          label: "库存数量",
          prop: "quantity",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.quantity]);
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
    <view class="ko-warning__wrap">
      <InventoryList
        :list="list"
        :no-more="noMore"
        :no-data="!list.length"
        :columns="columnTable"
        @lower="RequestNextPage"
        :field-list="FieldList"
        @click-cell="onClickCell"
      />
    </view>
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

  &__wrap {
    height: 100vh;
  }
}
</style>
