<script>
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";

import { getProductClassApi, getProductFieldApi, getProductListApi } from "@/api/erp/product";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import GoodsCard from "./GoodsCard.vue";
import { PageEnums } from "@/utils/config";
import DaTreeVue2 from "./da-tree-vue2/index.vue";
import GoodsMixins from "./GoodsMixins";

export default {
  name: "VTabs",
  mixins: [mixins, GoodsMixins],
  data() {
    return {
      cLoading: false,
      classList: [],
      queryList: {
        classId: "",
        pageNum: 0,
        pageSize: 30,
        name: "",
      },
      CurrentItemId: null,
      list: [],
      noMore: false,
      fieldList: [],
      loading: false,

      showPurchasePrice: false,

      // 显示搜索
      showSearch: false,
    };
  },
  created() {
    this.getClassifyList();
    this.getFieldList();
  },
  components: {GoodsCard, DaTreeVue2, UniSearchBar},
  props: {
    // 购物模式
    isShopping: Boolean,
    // 外部编辑
    isExternal: Boolean,

    // 显示切换
    showSwitch: {
      type: Boolean,
      default: true,
    },

    // 更新显示搜索状态
    isShowSearch: Boolean,
  },
  methods: {
    async reset() {
      await this.getClassifyList();
      await this.getFieldList();
    },
    // 获取分类列表
    getClassifyList() {
      // 加载分类
      return getProductClassApi({pageNum: 0, pageSize: 1000})
        .then(res => {
          const data = res.data;
          this.classList = data;
          !data && (this.queryList.classId = _get(data, "0.id"));

          this.getList();
        });
    },

    // 获取扩张字段
    getFieldList() {
      return getProductFieldApi({pageSize: 100, pageNum: 0})
        .then(res => {
          console.log(res.data);
          this.fieldList = res.data;
        });
    },

    // 加载列表数据
    getList(reset = false) {
      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
      }

      this.loading = true;
      getProductListApi(this.queryList)
        .then(res => {
          const data = res.data || [];
          this.list = this.onMergeArrays(this.list, data.map(v => ({...v, productId: v.id})));
          this.noMore = _isEmpty(data) || data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
          this.noRefresh = false;
        });
    },

    // 处理搜索
    onInputSearch() {
      if (!this.$refs.DaTreeRef) return false;
      const keys = this.$refs.DaTreeRef.getCheckedKeys();
      this.$refs.DaTreeRef.setCheckedKeys(keys, false);

      this.queryList.classId = "";
      this.getList(true);
    },

    // 点击分类
    onClassify(item) {
      this.queryList.classId = item.id;
      this.getList(true);
    },

    // 处理点击产品项目
    onOperate(item, index) {
      this.$emit("click-item", item, index);
    },

    // 删除列表项目
    remove(index) {
      this.list.splice(index, 1);
    },

    // 点击商品查看详情
    onClick(item) {
      uni.navigateTo({
        url: `${PageEnums.productDetail}?id=${item.id}`,
      });
    },

    // 切换分类搜索
    onChangeClassItem(key, _item) {
      this.queryList.classId = _isEqual(this.queryList.classId, key) ? "" : key;
      this.queryList.name = "";
      this.getList(true);
    },

    // 取消搜索
    onCancel() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.getList(true);
    },

    // 切换样式
    onStyle() {
      const Func = this.isShopping ? this.setBillStyle : this.setProductStyle;
      Func();

      if (this.isShopping) {
        const path = this.sStyle ? PageEnums.shopping : PageEnums.NewSale;
        this.$emit("switch", path);
      }
    },

    // 滚动到底部
    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList(false);
    },

    // 处理搜索显示隐藏
    onShowSearch() {
      this.showSearch = !this.showSearch;
      this.$emit("update:is-show-search", this.showSearch);
    },
  },
  computed: {
    sStyle() {
      return this.isShopping ? this.sBill : this.getProductStyle;
    },
  },
};
</script>

<template>
  <view class="ko-v-tabs">
    <button
      class="ko-basic-button__card ko-v-tabs__search--btn"
      @click="onShowSearch"
      v-if="!showSwitch"
    >
      <uni-icons color="#fff" type="search"></uni-icons>
    </button>

    <view
      class="ko-v-tabs__search glass no-border"
      :class="{show: showSearch, 'show-switch': showSwitch}"
    >
      <view style="flex: 1;">
        <UniSearchBar
          :radius="10"
          @confirm="onInputSearch(true)"
          @cancel="onCancel"
          v-model="queryList.name"
          placeholder="产品名称"
          clear-button="none"
          no-t-b-padding
          bg-color="#fff"
          input-class-name="glass"
        />
      </view>
      <button
        class="ko-basic-button__card"
        @click="showPurchasePrice = !showPurchasePrice"
        v-if="!isShopping"
      >
        <i class="iconfont" :class="[!showPurchasePrice ? 'icon-xianshi' : 'icon-mimaxianshiyincang-']"></i>
      </button>
      <button
        class="ko-basic-button__card"
        @click="onStyle"
        v-if="showSwitch"
      >
        <uni-icons color="#fff" :type="!sStyle ? 'list' : 'tune-filled'"></uni-icons>
      </button>
    </view>

    <view class="ko-v-tabs__wrap">
      <scroll-view scroll-y="true" class="ko-v-tabs__left">
        <view class="ko-v-tabs__classify">
          <DaTreeVue2
            theme-color="rgba(239, 68, 68, 1)"
            ref="DaTreeRef"
            :data="classList"
            labelField="name"
            valueField="id"
            :default-expand-all="false"
            @change="onChangeClassItem"
            expand-checked
            :indent="20"
            :show-radio-icon="false"
            :active-key="queryList.classId"
            :padding-bottom="80"
            :padding-top="20"
          />
          <!-- <view
             v-for="(item, index) of classList"
             :key="index"
             class="ko-v-tabs__classify&#45;&#45;item"
             :class="{active: isEqual(item.id, queryList.classId)}"
             @click="onClassify(item)"
           >
             {{ item.name }}
           </view>-->
        </view>
      </scroll-view>
      <scroll-view scroll-y="true" class="ko-v-tabs__right" @scrolltolower="onLower">
        <view class="ko-v-tabs__right--content">
          <view
            class="ko-v-tabs__goods"
            v-for="(item, index) in list"
            :key="index"
          >
            <GoodsCard
              :show-purchase-price="showPurchasePrice"
              :field="fieldList"
              :node="item"
              @operate="onOperate(item, index)"
              @click="onClick(item)"
              :is-shopping="isShopping"
            />
          </view>

          <view v-if="noMore && !loading && list.length" class="ko-no-more" style="margin: 20px 0;">
            该分类没有更多数据了
          </view>

          <view v-if="noMore && !loading && !list.length" class="ko-no-more" style="margin: 20px 0;">
            该分类暂无数据
          </view>

          <uv-loading-icon v-if="loading" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-v-tabs {
  --footer-padding-height: 100px;
  position: relative;

  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__search {
    width: 100%;
    display: flex;
    align-items: flex-start;
    padding: 0;
    padding-right: calc(32px + 10px + 10px);
    height: 0;
    overflow: hidden;

    transition: height .3s, padding .3s;

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

    &--btn {
      position: absolute;
      top: 8px;
      right: 10px;
      z-index: 999;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    &.show {
      height: 58px;

      padding-top: 10px;
      padding-bottom: 10px;
    }

    &.show-switch {
      height: 58px;
      padding-right: 10px;

      padding-top: 10px;
      padding-bottom: 10px;
    }
  }

  &__left {
    width: 33%;
    //box-shadow: 0 2px 10px 0 rgba(31, 38, 135, 0.3);
  }

  &__classify {
    padding-bottom: var(--footer-padding-height);

    &--item {
      color: rgba(75, 85, 99, 1);
      font-size: 13px;
      padding: 12px 10px;
      line-height: 1.4;
      text-align: center;
    }

    .active {
      background: rgba(254, 242, 242, .3);
      box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
  }

  &__wrap {
    padding-top: 10px;
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  &__right {
    flex: 1;
    overflow: hidden;
    padding-top: 6px;

    &--content {
      padding: 6px 10px var(--footer-padding-height);
    }
  }

  &__goods {
    margin-bottom: 20px;
  }
}
</style>
