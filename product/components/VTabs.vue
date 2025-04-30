<script>
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";

import { getProductClassApi, getProductFieldApi, getProductListApi } from "@/api/erp/product";
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isEmpty, _isEqual } from "@/utils";
import GoodCard from "./GoodCard.vue";
import { PageEnums } from "@/utils/config";
import DaTreeVue2 from "./da-tree-vue2/index.vue";

export default {
  name: "VTabs",
  mixins: [mixins],
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
    };
  },
  created() {
    this.getClassifyList();
    this.getFieldList();
  },
  components: {GoodCard, DaTreeVue2, UniSearchBar},
  props: {
    // 购物模式
    isShopping: Boolean,
  },
  methods: {
    // 获取分类列表
    getClassifyList() {
      // 加载分类
      getProductClassApi({pageNum: 0, pageSize: 1000})
        .then(res => {
          const data = res.data;
          this.classList = data;
          !data && (this.queryList.classId = _get(data, "0.id"));

          this.getList();
        });
    },

    // 获取扩张字段
    getFieldList() {
      getProductFieldApi({pageSize: 100, pageNum: 0})
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
          this.list = this.onMergeArrays(this.list, res.data.map(v => ({...v, value: v.id})));

          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
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
    search(query) {
      this.queryList.name = query.name;
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
      console.log(key);
      this.queryList.classId = _isEqual(this.queryList.classId, key) ? "" : key;
      this.getList(true);
    },

    // 取消搜索
    onCancel() {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.getList(true);
    },
  },
  computed: {},
};
</script>

<template>
  <view class="ko-v-tabs">
    <view class="ko-v-tabs__search">
      <view style="flex: 1;">
        <UniSearchBar
          :radius="999"
          @confirm="getList(true)"
          @cancel="onCancel"
          v-model="queryList.name"
          placeholder="产品名称"
          clear-button="none"
          no-t-b-padding
        />
      </view>
      <button
        class="ko-basic-button__card"
        @click="showPurchasePrice = !showPurchasePrice"
      >
        <i class="iconfont" :class="[!showPurchasePrice ? 'icon-xianshi' : 'icon-mimaxianshiyincang-']"></i>
      </button>
    </view>

    <view class="ko-v-tabs__wrap">
      <scroll-view scroll-y="true" class="ko-v-tabs__left">
        <view class="ko-v-tabs__classify">
          <DaTreeVue2
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
      <view class="ko-v-tabs__right">
        <view class="ko-v-tabs__right--content">
          <view
            class="ko-v-tabs__goods"
            v-for="(item, index) in list"
            :key="index"
          >
            <GoodCard
              :show-purchase-price="showPurchasePrice"
              :field="fieldList"
              :node="item"
              @operate="onOperate(item, index)"
              @click="onClick(item)"
              :is-shopping="isShopping"
            />
          </view>

          <uv-loading-icon v-if="loading" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-v-tabs {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__search {
    width: 100%;
    padding-bottom: 10px;
    display: flex;
    align-items: center;
    padding-right: 10px;

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


  &__left {
    width: 33%;
    box-shadow: 0 2px 10px 0 rgba(31, 38, 135, 0.3);
  }

  &__classify {
    padding-bottom: 40px;

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
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  &__right {
    flex: 1;
    overflow-y: auto;
    padding-top: 6px;

    &--content {
      height: 100%;
      overflow-y: auto;
      padding: 6px 10px 50px;
    }
  }

  &__goods {
    margin-bottom: 10px;
  }
}
</style>
