<script>
import mixins from "@/mixins/mixins";
import { businessClassifyApi, getSettingApi, supplyListApi } from "@/api/user";
import KoList from "@/components/List/List.vue";
import { _isEmpty } from "@/utils";
import GoodsCard from "@/components/GoodsCard.vue";
import { getProductFieldApi } from "@/api/erp/product";
import { PageEnums } from "@/utils/config";

export default {
  name: "Hypermarket",
  components: {GoodsCard, KoList},
  mixins: [mixins],
  data() {
    return {
      classifyList: [],

      list: [],
      queryList: {
        pageSize: 30,
        pageNum: 0,
        classifyId: "",
        name: "",
      },
      noMore: false,
      loading: false,
      config: {},

      fieldList: [],
    };
  },
  async onLoad() {
    await this.getInfo();
    await this.getClassify();
    await this.getFieldList();
  },
  methods: {
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
          this.getList(true);
        });
    },

    // 获取卖场列表
    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;

      return supplyListApi(this.queryList)
        .then((res) => {
          const data = res.data;
          this.list = this.onMergeArrays(this.list, data, "name");
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
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 选分类
    onTagItme(item) {
      this.queryList.classifyId = item.id;
      this.getList(true);
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
      uni.reLaunch({
        url: `${PageEnums.shopping}?scene=${item.name}&p_name=${child?.name || ""}`,
      });
    },
  },

  computed: {
    FImage() {
      return this.config.head || "";
    },

    SList() {
      return (this.config.banner ? this.config.banner.split(",") : []).map(item => this.getImageUrl(item));
    },
  },
};
</script>

<template>
  <view class="ko-hypermarket" :style="[menuButtonRectStyle]">
    <button class="ko-top-black" @click="onBlack">
      <uni-icons size="24" color="#000" type="left" />
    </button>

    <view class="ko-hypermarket__header">
      <image
        v-if="FImage"
        mode="heightFix"
        class="ko-hypermarket__header--image"
        :src="getImageUrl(FImage)"
      />
    </view>

    <view class="ko-hypermarket__search">
      <uv-search
        search-icon-color="#D95B64"
        placeholder="请输入"
        shape="square"
        bg-color="transparent"
        :action-style="{color: '#E61D3E'}"
        placeholder-color="rgba(230, 29, 62, 0.4)"
        v-model="queryList.name"
        @search="getList(true)"
        @custom="getList(true)"
        @clear="getList(true)"
      />
    </view>

    <view class="ko-hypermarket__wrap">
      <KoList
        :data="list"
        :loading="loading"
        :no-more="noMore"
        :no-data="!list.length"
        @next-load="onRequestNextPage"
        @lower="onRequestNextPage"
        hide-tips
      >
        <view class="ko-hypermarket__swiper">
          <uv-swiper
            :list="SList"
            :height="150"
            :radius="20"
          />
        </view>

        <block v-if="list.length || loading || noMore">
          <scroll-view
            scroll-x
            scroll-with-animation
            :show-scrollbar="false"
            class="ko-hypermarket__card"
          >
            <view class="ko-hypermarket__card--wrap">
              <button
                class="ko-hypermarket__tag"
                @click.stop="onTagItme({id: ''})"
                :class="{active: !queryList.classifyId}"
              >
                <uv-image
                  width="20px"
                  height="20px"
                  shape="square"
                  lazy-load
                  radius="3px"
                  :custom-style="{marginRight: '4px'}"
                  src="data:image/png;base64,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"
                />
                全部
              </button>

              <button
                class="ko-hypermarket__tag"
                v-for="item of classifyList"
                :key="item.id"
                @click.stop="onTagItme(item)"
                :class="{active: isEqual(item.id, queryList.classifyId)}"
              >
                <uv-image
                  width="20px"
                  height="20px"
                  shape="square"
                  lazy-load
                  radius="3px"
                  :custom-style="{marginRight: '4px'}"
                  :src="getImageUrl(item.classifyIcon)"
                />
                {{ item.classifyName }}
              </button>
            </view>
          </scroll-view>

          <view class="ko-hypermarket__list">
            <BasicCard
              bg-color="#fff"
              :spacing="10"
              v-for="(item, index) of list"
              :key="index"
            >
              <view class="ko-hypermarket__row">
                <view class="ko-hypermarket__item" @click="goShopping(item)">
                  <uv-image
                    :src="getImageUrl(item.logo)"
                    lazy-load
                    observe-lazy-load
                    width="64px"
                    height="64px"
                    radius="6px"
                    icon-size="32px"
                    :custom-style="{'margin-right': '10px'}"
                    v-if="item.logo"
                  />

                  <view class="ko-hypermarket__item--info">
                    <view class="ko-hypermarket__item--info--name">{{ item.remark }}</view>
                    <view style="display: flex; align-items: center; font-size: 12px; color: #000;">
                      <view
                        @click.stop="onCopyText(item.merchantPhone)"
                        style="display: flex; align-items: center; margin-right: 10px"
                        v-if="item.merchantPhone"
                      >
                        <uni-icons size="14" color="#000" type="phone-filled" />
                        <text>{{ item.merchantPhone }}</text>
                      </view>
                      <view
                        @click.stop="onCopyText(item.merchantAddress)"
                        style="display: flex; align-items: center"
                        v-if="item.merchantAddress"
                      >
                        <uni-icons size="14" color="#000" type="location-filled" />
                        <text>{{ item.merchantAddress }}</text>
                      </view>
                    </view>
                  </view>
                </view>

                <scroll-view
                  scroll-x
                  scroll-with-animation
                  :show-scrollbar="false"
                  class="ko-hypermarket__products-scroll"
                >
                  <view
                    class="ko-hypermarket__products"
                    v-if="item.products && item.products.length"
                  >
                    <view class="ko-hypermarket__products--item" v-for="(child, j) of item.products" :key="j">
                      <GoodsCard
                        :field="fieldList"
                        :node="child"
                        @operate="goShopping(item, child)"
                        is-shopping
                        is-supply
                        :image-size="120"
                        ellipsis2lines
                      />
                    </view>
                  </view>
                  <view
                    v-if="item.products && !item.products.length"
                    style="text-align: center;color: #c7c9ce;font-size: 12px;"
                  >
                    该商户未发布产品
                  </view>
                </scroll-view>
              </view>
            </BasicCard>

           <!-- <view
              v-if="noMore && !loading && list.length"
              style="text-align: center;color: #c7c9ce;font-size: 12px;margin-top: 10px;"
            >
              没有更多商户了
            </view>-->
            <view
              v-if="!loading && !list.length"
              style="text-align: center;color: #c7c9ce;font-size: 12px;"
            >
              暂无商户
            </view>
          </view>
        </block>
      </KoList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-top-black {
  position: fixed;
  top: var(--m-top);
  height: var(--m-height);
  left: 10px;
  z-index: 999;
  padding: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.ko-hypermarket {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    height: calc(var(--m-top) + var(--m-height) + 50px);
    background: linear-gradient(to bottom, #FE1120 0%, #FE1120 80%, #fff 100%);
    display: flex;
    justify-content: flex-end;

    &--image {
      height: calc(100% - 50px);
      display: block;
    }
  }

  &__search {
    margin: -40px 16px;
    border: 1px solid #DA0F1B;
    background: #fff;
    border-radius: 10px;
    padding-right: 8px;
  }

  &__swiper {
    padding: 10px;
  }

  &__wrap {
    flex: 1;
    overflow-y: auto;
    margin-top: 50px;
    background: #F3F4F6;
  }

  &__card {
    padding: 0 10px;
    margin: -5px 0;

    &--wrap {
      display: flex;
      align-items: center;
      margin: 0 -5px;
    }
  }

  &__tag {
    margin: 5px;
    padding: 8px 10px;
    line-height: 1.2;
    background: #FDFBFA;
    color: #545351;
    font-size: 14px;
    display: flex;
    align-items: center;
    transition: background .3s, color .3s, border-color .3s;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 6px;
    overflow: inherit;
    white-space: nowrap;

    &.active {
      color: #583E30;
      background: #FDFBFA;
      border-color: #e9e9eb;
      border-radius: 6px 6px 0 0;
      position: relative;

      &:before {
        content: '';
        display: inline-block;
        height: 10px;
        background: #FDFBFA;
        position: absolute;
        left: -1px;
        right: -1px;
        bottom: -10px;
        border-left: 1px solid #e9e9eb;
        border-right: 1px solid #e9e9eb;
      }
    }
  }

  &__list {
    margin: 4px 10px 0;
    padding: 10px;
    border: 1px solid #e9e9eb;
    border-radius: 0 0 6px 6px;
    background: #FDFBFA;
  }

  /*&__row {

  }*/

  &__item {
    display: flex;

    &--info {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &--name {
        color: #000;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }

  &__products-scroll {
    //padding: 10px 0;
    margin-top: 10px;
  }

  &__products {
    display: flex;
    align-items: flex-end;
    padding: 10px 0;

    &--item {
      flex-shrink: 0;
      width: 140px;
      padding: 0 8px;
    }
  }
}
</style>
