<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import QiunDataCharts from "@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import UniFormsItem from "@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
import UniFab from "@/uni_modules/uni-fab/components/uni-fab/uni-fab.vue";
import {
  deleteProductApi,
  getProductFieldApi,
  getProductListApi,
  upDownPurchaseApi,
  upDownSaleApi,
} from "@/api/erp/product";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import UniCard from "@/uni_modules/uni-card/components/uni-card/uni-card.vue";
import { _deepCopy, _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import UniDataPicker from "@/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import IndexUser from "@/components/IndexList/IndexList.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";

export default {
  name: "ProductList",
  mixins: [mixins],
  components: {
    ProductCard,
    IndexUser,
    UvActionSheet,
    PickerClass,
    UniDataPicker,
    UniCard,
    LoadMore,
    UniFab,
    UniForms,
    BasicPopup,
    UniFormsItem,
    UniEasyinput,
    UniListItem,
    BasicCard,
    UniCol,
    UniRow,
    UniList,
    QiunDataCharts,
    UniGridItem,
    UniGrid,
  },
  data: () => ({
    list: [],
    loading: true,

    className: [],
    classList: [],

    queryList: {
      classId: "",
      ...{pageSize: 1000000, pageNum: 0}
    },
    actionItem: {},
  }),
  created() {
    this.getSelectList();
  },
  methods: {
    getList() {
      this.loading = true;
      getProductListApi(this.queryList)
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getSelectList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        uni.$__FIELD_LIST__ = res.data;
      });
    },

    onFabClick(item) {
      let query = "";

      if (!_isEmpty(item)) {
        query = `?id=${item.id}`;
      }

      uni.navigateTo({
        url: `/erp/product/added${query}`,
      });
    },

    onRemove(row) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 产品吗？`,
        success: (res) => {
          if (res.confirm) {
            this.$set(row, "__remove_loading__", true);
            deleteProductApi(row)
              .then(() => {
                uni.showToast({title: "删除成功"});
                this.getList();
              });
          }
        },
      });
    },

    upDownSale(row) {
      row.saleOff = !row.saleOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${row.saleOff ? "下架" : "上架"} 该产品到销售吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownSaleApi(row)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },

    upDownPurchase(row) {
      row.purchaseOff = !row.purchaseOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${row.purchaseOff ? "下架" : "上架"} 该产品到采购吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownPurchaseApi(row)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList();
              });
          }
        },
      });
    },

    onActionClick(item) {
      this.actionItem = item;
      this.$refs.UASRef.open();
    },

    onSelect(item) {
      this[item.func](_deepCopy(this.actionItem));
    },
  },
  computed: {
    getFieldValue() {
      return (item, child) => {
        return _get(item, `extend.${child.fieldCode}`) || "-";
      };
    },

    getActionsList() {
      return () => {
        if (!this.isPerm("Product_Write")) return [];
        const {saleOff, purchaseOff} = this.actionItem || {};

        return [
          {
            name: saleOff ? "上架销售" : "下架销售",
            func: "upDownSale",
          },
          {
            name: purchaseOff ? "上架采购" : "下架采购",
            func: "upDownPurchase",
          },
          {
            name: "编辑",
            func: "onFabClick",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "onRemove",
          },
        ];
      };
    },
  },
};
</script>

<template>
  <view class="ko-product">
    <view class="ko-product__wrap">
      <view class="ko-product__class">
        <PickerClass v-model="queryList.classId" @change="getList" />
      </view>
      <view class="ko-product__list">
        <IndexUser :options="list" is-product :loading="loading">
          <template #cell="{node}">
            <view class="ko-product__wrap--item">
              <ProductCard :node="node" is-list :span="24" perm="Product_Write">
                <template #footer="{item}">
                  <view class="ko-product__item--footer">
                    <button
                      class="ko-basic-button__card action"
                      @click="onActionClick(item)"
                    >
                      <i class="iconfont icon-gengduocaozuo"></i>
                    </button>
                  </view>
                </template>
              </ProductCard>
            </view>
          </template>
        </IndexUser>
      </view>
    </view>

    <UniFab
      v-if="isPerm('Product_Write')"
      ref="FabRef"
      :pattern='{
        color: "#7A7E83",
        backgroundColor: "#fff",
        selectedColor: "#007AFF",
        buttonColor: "#007AFF",
        iconColor: "#fff"
      }'
      horizontal="right"
      direction="vertical"
      :offset-button="10"
      @fabClick="onFabClick"
    />

    <UvActionSheet
      ref="UASRef"
      :actions='getActionsList()'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-product {
  &__class {
    padding: 0 10px 15px;
  }

  &__wrap {
    height: calc(100vh - 56px);
    display: flex;
    flex-direction: column;
  }

  &__list {
    flex: 1;
    position: relative;
  }

  &__item {
    &--footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .action {
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
