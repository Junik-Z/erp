<script>
import mixins from "@/mixins/mixins";
import {
  businessClassifyApi,
  getActivityApi,
  getRecommendApi,
  getSettingApi,
  getSupplyADListApi,
  supplyListApi,
} from "@/api/user";
import KoList from "@/components/List/List.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _omit } from "@/utils";
import GoodsCard from "@/components/GoodsCard.vue";
import { getProductFieldApi } from "@/api/erp/product";
import { PageEnums } from "@/utils/config";
import ReLogin from "@/mixins/re-login";
import RecommendTabs from "./components/RecommendTabs.vue";
import Market from "@/shop/components/Market.vue";
import RecommendList from "./components/RecommendList.vue";

export default {
  name: "Hypermarket",
  components: {Market, GoodsCard, KoList, RecommendTabs, RecommendList},
  mixins: [mixins, ReLogin],
  data() {
    return {
      classifyList: [],

      list: [],
      queryList: {
        pageSize: 10,
        pageNum: 0,
        classifyId: "",
        name: "",
      },
      noMore: false,
      loading: false,
      config: {},

      fieldList: [],

      isShowBack: false,

      text: [],

      // 激活的推荐 tab
      aRecommend: "1",

      // 需要显示前往管理端
      isToAdmin: false,
    };
  },
  async onLoad() {
    // #ifdef MP
    try {
      const pages = getCurrentPages() || [];
      this.isShowBack = pages.length > 1;

      if (this.isShowBack) {
        uni.$__DEF_SCENE__ = uni.getStorageSync("__APP_SCENE__");
      }

    } catch (e) {
      console.error(e);
    }
    // #endif

    // #ifdef H5
    this.isShowBack = true;
    // #endif
  },
  onShow() {
    const sOpt = this.$store.getters.getShowOption;
    this.isToAdmin = _isEqual(sOpt.scene, 1089) && this.$store.getters.sPath;

    console.log("获取到的首页数据", this.isToAdmin, sOpt);
  },
  methods: {
    // 获取列表数据
    async getList() {
      await this.getInfo();
      await this.getClassify();
      await this.getFieldList();
      await this.getACList();
    },

    // 获取广告
    getACList() {
      return getSupplyADListApi()
        .then(res => {
          this.text = res.data;
        });
    },

    // 获取卖场配置
    getInfo() {
      return getSettingApi()
        .then(res => {
          this.config = res.data;
          console.log(res.data);
        });
    },

    // 获取卖场分类
    getClassify() {
      return businessClassifyApi({pageNum: 0, pageSize: 100})
        .then(res => {
          this.classifyList = res.data;
        })
        .finally(() => {
          this.getPList(true);
        });
    },

    // 获取卖场列表
    getPList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      const Func = {1: supplyListApi, 2: getRecommendApi, 3: getActivityApi}[this.aRecommend];

      let params = _deepCopy(this.queryList);

      if (!_isEqual(this.aRecommend, "1")) {
        params = _omit(params, ["classifyId"]);
      }

      this.loading = true;
      return Func(params)
        .then((res) => {
          const data = res.data;
          this.list = this.onMergeArrays(this.list, data, _isEqual(this.aRecommend, "1") ? "name" : "id");
          this.noMore = _isEmpty(data) || data.length < this.queryList.pageSize;
          console.log(data);
        })
        .catch(() => {
          this.noMore = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    onRequestNextPage() {
      if (this.noMore || !_isEqual(this.aRecommend, "1")) return false;
      this.queryList.pageNum += 1;
      this.getPList();
    },

    // 选分类
    onTagItme(item) {
      this.queryList.classifyId = item.id;
      this.getPList(true);
    },

    // 获取扩张字段
    getFieldList() {
      return getProductFieldApi({pageSize: 100, pageNum: 0})
        .then(res => {
          this.fieldList = res.data;
        });
    },

    // 前往商铺
    goShopping(item, child) {
      uni.navigateTo({
        url: `${PageEnums.shopping}?scene=${item.name}&p_name=${child?.name || ""}&__switch_login__=true`,
      });
    },

    // 切换集市内容
    onRChange(item) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      this.getPList(true);
    },

    // 点击活动商品
    onRecommendItem(item) {
      this.goShopping({name: item.tenantId}, {name: _get(item, "product.name")});
    },
  },
  computed: {
    FImage() {
      return this.config.head || "";
    },

    SList() {
      return (this.config.banner ? this.config.banner.split(",") : []).map(item => this.getImageUrl(item));
    },

    // 推荐列表
    rList() {
      return [
        {
          value: "1",
          image: "data:image/png;base64,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",
          label: "供应链集市",
        },
        {
          value: "2",
          image: "data:image/png;base64,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",
          label: "产品推荐",
        },
        {
          value: "3",
          image: "data:image/png;base64,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",
          label: "今日活动",
        },
      ];
    },
  },
  onUnload() {
    if (this.isShowBack) {
      if (uni.$__DEF_SCENE__) {
        this.onSwitchLogin({scene: uni.$__DEF_SCENE__});
        uni.$__DEF_SCENE__ = "";
      }
    }
  },
};
</script>

<template>
  <view class="ko-hypermarket" :style="[menuButtonRectStyle]">
    <button class="ko-top-black" @click="onBlack" v-if="isShowBack && !isToAdmin">
      <uni-icons size="24" color="#000" type="left" />
    </button>

    <button class="ko-top-black" @click="onGoHome" v-if="isToAdmin">
      <view style="display: flex; align-items: center; font-size: 13px">
        <uv-icon name="home" :size="24" color="#000" style="margin-right: 4px;" />
        <text style="padding-top: 2px;">前往管理端</text>
      </view>
    </button>

    <view class="ko-hypermarket__header">
      <view class="ko-hypermarket__header--notice">
        <uv-notice-bar
          :text="text"
          direction="column"
          bg-color="transparent"
          color="#000"
          duration="3000"
          v-if="text.length && !isToAdmin"
        />
      </view>
      <view
        class="ko-hypermarket__header--image"
        v-if="FImage"
      >
        <uv-image
          mode="widthFix"
          width="100%"
          height="100%"
          lazy-load
          :icon-size="42"
          :src="getImageUrl(FImage)"
        />
      </view>
    </view>

    <view class="ko-hypermarket__search">
      <uv-search
        search-icon-color="#000"
        placeholder="请输入"
        shape="square"
        bg-color="transparent"
        color="#000"
        placeholder-color="#333"
        :action-style="{color: '#000'}"
        v-model="queryList.name"
        @search="getPList(true)"
        @custom="getPList(true)"
        @clear="getPList(true)"
      />
    </view>

    <view class="ko-hypermarket__wrap">
      <KoList
        :data="list"
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @load-next="onRequestNextPage"
        @lower="onRequestNextPage"
        hide-tips
        :hide-loading="!isEqual(aRecommend, '1')"
      >
        <view class="ko-hypermarket__swiper">
          <uv-swiper
            :list="SList"
            :height="150"
            :radius="10"
          />
        </view>

        <block v-if="list.length || loading || noMore">
          <view class="ko-hypermarket__tags">
            <RecommendTabs
              :options="rList"
              v-model="aRecommend"
              @change="onRChange"
            />
          </view>

          <view style="background: #fff; width: 100%;">
            <!-- 供应链集市 -->
            <block v-if="isEqual(aRecommend, '1')">
              <Market
                :list="list"
                :loading="loading"
                :classify-list="classifyList"
                :field-list="fieldList"
                :query-list="queryList"
                @click-tag="onTagItme"
                @click-shopping="goShopping"
              />
            </block>

            <block v-if="!isEqual(aRecommend, '1')">
              <RecommendList
                :list="list"
                :loading="loading"
                @click-item="onRecommendItem"
              />
            </block>
          </view>
        </block>
      </KoList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-hypermarket {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    height: calc(var(--m-top) + var(--m-height) + 50px);
    //background: linear-gradient(to bottom, #FE1120 0%, #FE1120 80%, #fff 100%);
    display: flex;
    justify-content: space-between;
    position: relative;
    overflow: hidden;

    &--image {
      display: block;
      position: absolute;
      width: 100vw;
      top: 0;
      right: 0;
      left: 0;
      bottom: 30px;
    }

    &--notice {
      width: calc(72vw);
      padding-top: calc(var(--m-top) - 2px);
      padding-left: 30px;
      position: relative;
      z-index: 10;
    }
  }

  &__search {
    margin: -44px 16px;
    border: 1px solid #000;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    padding-right: 8px;
    z-index: 12;
    position: relative;
  }

  &__swiper {
    padding: 10px 5px;
  }

  &__wrap {
    flex: 1;
    overflow: hidden;
    margin-top: 50px;
    background: #F3F4F6;
  }

  // 集市/新品推荐/今日活动
  &__tags {
    width: 100%;
    padding-bottom: 5px;
  }
}
</style>
