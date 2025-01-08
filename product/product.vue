<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import Classify from "./components/Classify.vue";
import ProductList from "./components/ProductList.vue";
import FieldList from "@/product/components/Field.vue";
import { _deepCopy } from "@/utils";
import mixins from "@/mixins/mixins";
import { shareProductApi } from "@/api/erp/product";

export default {
  name: "product",
  components: {ProductList, Classify, UniSegmentedControl, FieldList},
  data: () => ({
    tabList: [
      {
        label: "产品管理",
        ref: "ListRef",
      },
      {
        label: "分类管理",
        ref: "ClassRef",
      },
      {
        label: "扩展字段",
        ref: "FieldRef",
      },
    ],
    // TAB: 0,
  }),
  onLoad(option) {
    this.TABS_LIST = _deepCopy(this.tabList);
    if (option.PAGE_INDEX) {
      this.TAB = +option.PAGE_INDEX;
    }
  },
  mixins: [mixins],
  methods: {
    getList() {
      this.$nextTick(() => {
        console.log(this.GET_TAB_LIST);
        if (!this.GET_TABS_REF_NAME) return false;
        this.$refs[this.GET_TABS_REF_NAME]?.getList?.(true);
      });
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

      const query = await this._GET_SHARE_APP_PARAMS_(obj, 'form_scene');

      if (query.title) query.title = `${this.GET_SHOP_NAME || ""} ${query.title}`;

      resolve(query);
    });
  },
};
</script>

<template>
  <view class="ko-purchase">
    <view class="ko-purchase__tabs" v-if="GET_TAB_LIST.length > 1">
      <UniSegmentedControl
        :values="GET_TAB_LIST"
        label-key="label"
        :current.sync="TAB"
        @clickItem="getList"
      />
    </view>

    <ProductList ref="ListRef" v-if="isEqual(GET_TABS_REF_NAME, 'ListRef')" />

    <Classify ref="ClassRef" v-if="isEqual(GET_TABS_REF_NAME, 'ClassRef')" />

    <FieldList ref="FieldRef" v-if="isEqual(GET_TABS_REF_NAME, 'FieldRef')" />
  </view>
</template>

<style scoped lang="scss">
.ko-purchase {
  width: 100%;

  &__tabs {
    padding: 10px;

    /* #ifdef H5 */
    width: 300px;
    /* #endif */
  }
}
</style>
