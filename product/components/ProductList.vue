<script>
import {
  deleteProductApi,
  getDetailApi,
  getProductClassApi,
  getProductFieldApi,
  getProductListApi,
  upDownPurchaseApi,
  upDownSaleApi,
} from "@/api/erp/product";
import { _deepCopy, _isEmpty, _isEqual } from "@/utils";
import mixins from "@/mixins/mixins";
import PickerClass from "../components/PickerClass/PickerClass.vue";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";
import IndexList from "@/components/IndexList/IndexList.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import KoMovable from "@/components/Movable/index.vue";
import { PageEnums } from "@/utils/config";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";

export default {
  name: "ProductList",
  mixins: [mixins],
  components: {
    UniSearchBar,
    KoMovable,
    ProductCard,
    IndexList,
    UvActionSheet,
    PickerClass,
  },
  data() {
    return {
      MOVABLE_LIST: [
        // #ifdef MP
        {
          text: "分享",
          iconfont: "icon-icon-test",
          path: PageEnums.shareProduct,
          perm: "SHARE_PRODUCT",
          /* openType: "share",
          params: {
            title: `邀请您绑定产品！`,
            path: PageEnums.shareAddedProduct,
            query: {
              PAGE_TYPE: "BINDING_PRODUCT",
            },
          }, */
        },
        // #endif
        {
          text: "新增",
          iconfont: "icon-tianjia",
          path: PageEnums.addedProduct,
          perm: "PRODUCT_ADD",
        },
      ],

      list: [],
      loading: true,
      noMore: false,

      className: [],
      classList: [],

      queryList: {
        classId: "",
        pageNum: 0,
        pageSize: 10,
        name: "",
      },

      FieldList: [],

      isHideStockPrice: true,

      isChecked: false,

      checked: [],

      tableKey: +new Date(),

      node: {},
      nodeIndex: null,
      noRefresh: false,
    };
  },
  created() {
    this.getSelectList();

    // #ifdef H5
    this.getClassList();
    // #endif
  },
  methods: {
    // 获取商品列表
    getList(reset = false) {

      if (reset && !this.noRefresh) {
        this.list = [];
        this.queryList.pageNum = 0;
        this.tableKey = +new Date();
      }

      const info = uni.getStorageSync("TENP_ORDER_INFO");

      if (this.noRefresh && info && this.list.length) {
        this.updateList();
        return false;
      }

      this.loading = true;
      getProductListApi(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data.map(v => ({...v, value: v.id})));
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;

          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },

    getSelectList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        uni.$__FIELD_LIST__ = res.data;
        this.FieldList = res.data;
      });
    },

    onFabClick(item) {
      this.noRefresh = true;

      let query = "";
      if (!_isEmpty(item)) {
        query = `?id=${item.id}`;
      }
      uni.navigateTo({
        url: `${PageEnums.addedProduct}${query}`,
      });
    },

    onRemove(row, index) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要删除 ${row.name} 产品吗？`,
        success: (res) => {
          if (res.confirm) {
            this.$set(row, "__remove_loading__", true);
            deleteProductApi(row)
              .then(() => {
                uni.showToast({title: "删除成功"});
                // this.getList(true);
                this.list.splice(index || this.nodeIndex, 1);
              });
          }
        },
      });
    },

    upDownSale(row) {
      const node = _deepCopy(row);
      node.saleOff = !node.saleOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${node.saleOff ? "下架" : "上架"} 该产品到销售吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownSaleApi(node)
              .then(() => {
                uni.showToast({title: "操作成功"});
                // this.getList(true);
                this.$set(this.list[this.nodeIndex], "saleOff", node.saleOff);

              });
          }
        },
      });
    },

    upDownPurchase(row) {
      const node = _deepCopy(row);
      node.purchaseOff = !node.purchaseOff;
      uni.showModal({
        title: "温馨提示",
        content: `您确定要 ${node.purchaseOff ? "下架" : "上架"} 该产品到采购吗？`,
        success: (res) => {
          if (res.confirm) {
            upDownPurchaseApi(node)
              .then(() => {
                uni.showToast({title: "操作成功"});
                // this.getList(true);
                this.$set(this.list[this.nodeIndex], "purchaseOff", node.purchaseOff);
              });
          }
        },
      });
    },

    onActionClick(item, index) {
      this.node = item;
      this.nodeIndex = index;

      this.$refs.UASRef.open();
    },

    onSelect(item) {
      this[item.func](_deepCopy(this.node));
    },

    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    onTrigger(event) {
      const {path} = event.item || {};
      if (path) {
        if (_isEqual(PageEnums.addedProduct, path)) {
          this.onFabClick({});
        } else {
          uni.navigateTo({url: path});
        }
      }
      if (_isEqual("share", path)) {
        this.isChecked = true;
      }
    },

    onCheck(item) {
      if (this.checked.includes(item.value)) {
        this.checked = this.checked.filter(id => !_isEqual(item.value, id));
      } else {
        this.checked.push(item.value);
      }
    },

    onUnshare() {
      this.checked = [];
      this.isChecked = false;
    },

    // #ifdef H5
    getClassList() {
      // 盘点不需要传上下架数据
      getProductClassApi({pageNum: 0, pageSize: 1000})
        .then(res => {
          this.classList = res.data;
          uni.$__product_class_list__ = res.data;
        });
    },
    onCheckTree(node) {
      if (_isEqual(this.queryList.classId, node.id)) {
        this.queryList.classId = "";
        this.$refs.TreeRef.setCheckedKeys([]);
      } else {
        this.queryList.classId = node.id;
        this.$refs.TreeRef.setCheckedKeys([node.id]);
      }

      this.$nextTick(() => {
        this.getList(true);
      });
    },
    // #endif

    // 更新列表数据
    updateList() {
      const info = uni.getStorageSync("TENP_ORDER_INFO");
      const id = info ? info.id : this.node.id;

      getDetailApi({id})
        .then(res => {
          const data = res.data || {};
          this.onProcessingListData(data);
        })
        .finally(() => {
          this.noRefresh = false;
          uni.setStorageSync("TENP_ORDER_INFO", null);
        });
    },
  },
  computed: {
    getActionsList() {
      return () => {
        const {saleOff, purchaseOff} = this.node || {};

        return [
          {
            name: saleOff ? "上架销售" : "下架销售",
            func: "upDownSale",
            perm: "PRODUCT_UPDOWN_SALE",
          },
          {
            name: purchaseOff ? "上架采购" : "下架采购",
            func: "upDownPurchase",
            perm: "PRODUCT_UPDOWN_PURCHASE",
          },
          {
            name: "编辑",
            func: "onFabClick",
            perm: "PRODUCT_EDIT",
          },
          {
            name: "删除",
            color: "#e43d33",
            func: "onRemove",
            perm: "PRODUCT_DELETE",
          },
        ].filter(item => this.isPerm(item.perm));
      };
    },

    // #ifdef H5
    columnsList() {
      return [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        {
          label: "预警库存",
          prop: "stockWarning",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.stockWarning]);
          },
        },
        ...(this.FieldList.map(item => ({
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        }))),
        {
          label: "销售",
          prop: "salePrice",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, this.toYuan(row.salePrice));
          },
        },
        ...(this.isHideStockPrice ? [] : [
          {
            label: "采购",
            prop: "purchasePrice",
            render: (h, {row}) => {
              return h("label", {class: "ko-basic-money"}, this.toYuan(row.purchasePrice));
            },
          },
        ]),
        {
          label: "上架销售",
          prop: "saleOff",
          render: (h, {row}) => {
            return h("label", [row.saleOff ? "否" : "是"]);
          },
        },
        {
          label: "上架采购",
          prop: "purchaseOff",
          render: (h, {row}) => {
            return h("label", [row.purchaseOff ? "否" : "是"]);
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          slot: "operate",
          width: 380,
        },
      ];
    },
    // #endif

    getParams() {
      return {
        title: `推送产品信息给您！`,
        path: PageEnums.shareAddedProduct,
        checked: this.checked,
        query: {
          PAGE_TYPE: "BINDING_PRODUCT",
        },
      };
    },
  },
};
</script>

<template>
  <view class="ko-product">
    <view class="ko-product__wrap">
      <view class="ko-product__class">
        <view style="flex: 1;">
          <UniSearchBar
            @confirm="getList(true)"
            @cancel="onCancel"
            v-model="queryList.name"
            placeholder="产品名称"
            clear-button="none"
          />
        </view>

        <!-- #ifdef MP -->
        <PickerClass v-model="queryList.classId" @change="getList(true)" />
        <!-- #endif -->

        <button
          class="ko-basic-button__card"
          @click="isHideStockPrice = !isHideStockPrice"
        >
          <i class="iconfont" :class="[isHideStockPrice ? 'icon-xianshi' : 'icon-mimaxianshiyincang-']"></i>
        </button>
      </view>

      <view class="ko-product__list">
        <!-- #ifdef MP -->
        <IndexList
          :data="list"
          @lower="onLower"
          :no-more="noMore"
          @search="onSearchToNameIndex"
          is-double-row
          :is-checked="isChecked"
          :value="checked"
          @click="onCheck"

          v20241216
          is-product
          :loading="loading"
          @action-click="onActionClick"
          :is-hide-stock-price="isHideStockPrice"
        />
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <div class="ko-product__list--center" style="height: 100%;">
          <div style="height: 100%; overflow-y: auto;">
            <el-tree
              node-key="id"
              ref="TreeRef"
              :data="classList"
              :show-checkbox="true"
              :props="{label: 'name'}"
              check-strictly
              :default-checked-keys="[queryList.classId]"
              @check="onCheckTree"
              style="min-height: 100%;"
            />
          </div>
          <div style="height: 100%; overflow: hidden; flex: 1;">
            <KoTable
              :key="tableKey"
              style="padding: 10px 10px 40px;"
              :loading="loading"
              :columns="columnsList"
              :data="list"
              empty-text="暂无数据"
              stripe
              @next-load="onLower"
              :no-more="noMore || loading"
            >
              <template #operate="{item, index}">
                <view style="display: flex; align-items: center; justify-content: center;">
                  <button
                    class="ko-basic-button__card"
                    @click.stop="upDownSale(item, index)"
                    v-if="isPerm('PRODUCT_UPDOWN_SALE')"
                  >
                    {{ item.saleOff ? "上架销售" : "下架销售" }}
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="upDownPurchase(item, index)"
                    v-if="isPerm('PRODUCT_UPDOWN_PURCHASE')"
                  >
                    {{ item.purchaseOff ? "上架采购" : "下架采购" }}
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onFabClick(item, index)"
                    v-if="isPerm('PRODUCT_EDIT')"
                  >
                    编辑
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onRemove(item, index)"
                    v-if="isPerm('PRODUCT_DELETE')"
                  >
                    删除
                  </button>
                </view>
              </template>
            </KoTable>
          </div>
        </div>
        <!-- #endif -->
      </view>

      <view class="ko-product__checked ko-basic-box-shadow" v-if="isChecked">
        <button class="ko-basic-button__card" @click="onUnshare">取消</button>
        <button
          class="ko-basic-button__card"
          open-type="share"
          :data-params="getParams"
        >
          分享
        </button>
      </view>
    </view>

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable && !isChecked"

      @click="onTrigger"
    />

    <!-- #ifdef MP -->
    <UvActionSheet
      ref="UASRef"
      :actions='getActionsList()'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.ko-product {
  &__class {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    // #ifdef H5
    width: 1000px;
    margin: 0 auto;
    // #endif

    .ko-basic-button__card {
      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;
      height: 30px;
      width: 30px;
      padding: 0;
      margin-left: 10px;

      .iconfont {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  }

  &__wrap {
    height: calc(100vh - 56px);
    // #ifdef H5
    height: calc(100vh - 56px - 44px);
    // #endif
    display: flex;
    flex-direction: column;
  }

  &__list {
    flex: 1;
    position: relative;
    // #ifdef H5
    overflow: hidden;

    &--center {
      display: flex;
      padding: 10px;

      ::v-deep .el-tree {
        width: 260px;
        margin-right: 20px;
        border: 1px solid #EBEEF5;
        padding: 10px;

        .el-checkbox {
          margin-right: 6px;
        }
      }
    }

    // #endif
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

  &__checked {
    display: flex;
    justify-content: space-around;
    align-items: center;

    padding: 10px 30px 30px;
    background: #fff;

    .ko-basic-button__card {
      padding: 10px 15px;
      width: 100px;
    }
  }
}
</style>
