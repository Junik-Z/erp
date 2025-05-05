<script>
import ProductList from "./components/ProductList.vue";
import mixins from "@/mixins/mixins";
import { shareProductApi } from "@/api/erp/product";
import TopMenus from "./components/TopMenus.vue";

import CommodityList from "./components/CommodityList.vue";
import GoodsMixins from "./components/GoodsMixins";

export default {
  name: "product",
  components: {
    ProductList,
    TopMenus,
    CommodityList,
  },
  data() {
    return {};
  },
  mixins: [mixins, GoodsMixins],
  watch: {
    getProductStyle: {
      handler() {
        this.getList();
      },
    },
  },
  methods: {
    getList() {
      setTimeout(() => {
        this.$refs.ListRef && this.$refs.ListRef.getList();
      }, 230);
    },
  },
  onShow() {
    const isNotRefresh = uni.getStorageSync("TO_DETAILS");

    this.$nextTick(() => {
      if (!isNotRefresh) {
        this.getList();
      }
      setTimeout(() => {
        uni.setStorageSync("TO_DETAILS", false);
      }, 100);
    });
  },

  // 分享相关
  onShareAppMessage(res) {
    const obj = res.target.dataset.params;

    return new Promise(async (resolve) => {
      try {
        const res = await shareProductApi(obj.checked.map(productId => ({productId})));
        obj.query.PRODUCT_SHARE_ID = res.data;
      } catch (e) {
      }

      const query = await this._GET_SHARE_APP_PARAMS_(obj, "form_scene");

      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;

      resolve(query);
    });
  },
};
</script>

<template>
  <view class="ko-purchase">
    <TopMenus :path="PageEnums.product" />

    <view class="ko-purchase__wrap">
      <CommodityList v-if="getProductStyle" />
      <ProductList ref="ListRef" v-if="!getProductStyle" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  padding-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__wrap {
    flex: 1;
    overflow: hidden;
  }
}
</style>
