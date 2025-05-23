<script>
import UvVtabs from "./vtabs/uv-vtabs/uv-vtabs.vue";
import UvVtabsItem from "./vtabs/uv-vtabs-item/uv-vtabs-item.vue";

import VTabs from "./VTabs.vue";
import mixins from "@/mixins/mixins";
import UvActionSheet from "@/uni_modules/uv-action-sheet/components/uv-action-sheet/uv-action-sheet.vue";

import { _deepCopy, _isEmpty, _isEqual } from "@/utils";
import { PageEnums } from "@/utils/config";
import { deleteProductApi, upDownPurchaseApi, upDownSaleApi } from "@/api/erp/product";
import KoMovable from "@/components/Movable/index.vue";

// 商品列表
export default {
  name: "Commodity",
  components: {KoMovable, VTabs, UvVtabs, UvVtabsItem, UvActionSheet},
  mixins: [mixins],
  data() {
    return {
      queryList: {
        name: "",
      },
      list: [],
      node: null,
      nIndex: null,


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
    };
  },
  methods: {
    // 处理点击产品
    onClickItem(item, index) {
      this.node = _deepCopy(item);
      this.nIndex = index;

      this.$refs.UASRef.open();
    },

    onSelect(item) {
      this[item.func](_deepCopy(this.node), this.nIndex);
    },

    // 处理修改
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

    // 上下架销售
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

    // 处理删除
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
                this.$refs.VTRef.remove(this.nIndex);
              });
          }
        },
      });
    },

    // 点击右下角的按钮
    onTrigger(event) {
      const {path} = event.item || {};
      if (path) {
        if (_isEqual(PageEnums.addedProduct, path)) {
          this.onFabClick({});
        } else {
          uni.navigateTo({url: path});
        }
      }
    },
  },
  computed: {
    ActionsList() {
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
    },
  },
};
</script>

<template>
  <view class="ko-commodity">
    <view class="ko-commodity__wrap">
      <VTabs
        @operate="onClickItem"
        ref="VTRef"
      />
    </view>

    <!-- #ifdef MP | H5 -->
    <UvActionSheet
      ref="UASRef"
      :actions='ActionsList'
      safe-area-inset-bottom
      round="10"
      cancel-text="取消"
      @select="onSelect"
    />
    <!-- #endif -->

    <KoMovable
      :content="GET_MOVABLE_LIST"
      v-if="isShowMovable"

      @click="onTrigger"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-commodity {
  height: 100%;
  display: flex;
  flex-direction: column;


  &__wrap {
    flex: 1;
    overflow: hidden;
  }
}
</style>
