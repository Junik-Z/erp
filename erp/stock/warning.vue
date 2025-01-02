<script>
import { getWarningListApi } from "@/api/erp/stock";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _get, _groupBy } from "@/utils";
import mixins from "@/mixins/mixins";
import { getProductFieldApi } from "@/api/erp/product";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";

export default {
  name: "warning",
  mixins: [mixins],
  components: {UvAvatar, BasicCard, UniSection, KoTable, ProductCard, UniList, UniListItem, LoadMore},
  data() {
    return {
      list: [],
      loading: false,
      FieldList: [],

      groupList: {},
    };
  },
  async onLoad() {
    await this.getExtendList();
    await this.getList();
  },
  methods: {
    getList() {
      this.loading = false;
      getWarningListApi({pageSize: 10000, pageNum: 0})
        .then(res => {
          this.list = res.data;
          this.groupList = _groupBy(res.data, (item) => item.className);

          console.log(this.groupList);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getExtendList() {
      return getProductFieldApi({pageSize: 1000, pageNum: 0})
        .then(res => {
          uni.$__FIELD_LIST__ = res.data;
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
    <view class="ko-warning__wrap">
      <view v-for="(item, key) of groupList" :key="key">
        <UniSection :title="key" type="line">
          <BasicCard>
            <view
              v-for="child of item" :key="child.id"
              style="display: flex; align-items: center; font-size: 12px; padding: 5px 0;"
            >
              <view style="flex: 1;">
                <label class="ko-basic-label">名称：</label>
                <text>{{ child.name }}</text>
              </view>
              <view style="padding: 0 10px">
                <label class="ko-basic-label">库存：</label>
                <text class="ko-basic-money">{{ child.quantity }}</text>
              </view>
              <view style="padding: 0 10px">
                <label class="ko-basic-label">预警：</label>
                <text class="ko-basic-money">{{ child.stockWarning }}</text>
              </view>
              <view style="width: 40px;">
                <UvAvatar
                  v-if="child.images"
                  :src="getImageUrl(child.images)"
                  shape="square"
                />
              </view>
            </view>
          </BasicCard>
        </UniSection>
        <!--<ProductCard :node="item" is-warning readonly />-->
      </view>
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
  padding-bottom: 50px;

  &__wrap {
    padding: 10px;
  }
}
</style>
