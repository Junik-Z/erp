<script>
import { _isEmpty, getRect } from "@/utils";
import mixins from "@/mixins/mixins";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";

import UniSkeletons from "@/uni_modules/uv-skeletons/components/uv-skeletons/uv-skeletons.vue";

// 索引列表
const IndexMenus = () => "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default {
  name: "IndexList",
  components: {
    UniRow, UniCol, BasicCard, UvAvatar,
    UvLoadingIcon,
    ProductCard,
    UniSkeletons,
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    noMore: Boolean,
    loading: Boolean,
    // 是否使用双列布局
    isDoubleRow: Boolean,
    safeAreaInsetBottom: {
      type: Boolean,
      default: true,
    },

    events: {
      type: Array,
      default() {
        return [];
      },
    },
    showAmount: Boolean,
    isChecked: Boolean,
    value: [String, Array],
    disabled: [Boolean, Array],
    buttonPerm: String,

    // 是否是供应商
    isSupplier: Boolean,

    // 可选的数据列表
    checkedList: [Array],
    groupKey: {
      type: String,
      default: "nameIndex",
    },

    // 是否展示产品
    isProduct: Boolean,

    selected: {
      type: Object,
      default() {
        return {};
      },
    },
    // 隐藏金额
    hidePrices: Boolean,
    // 是否是在下单页面进来的
    isSelected: Boolean,

    extra: {
      type: Object,
      default() {
        return {};
      },
    },

    // 2024年12月16日的新功能
    v20241216: Boolean,

    // 库存盘点
    isJudge: Boolean,

    // 物流商列表
    isReceiptList: Boolean,

    // 隐藏入库价格
    isHideStockPrice: Boolean,
  },
  watch: {
    data: {
      handler(val) {
        // this.setList();
      },
      immediate: true,
    },
  },
  mixins: [mixins],
  data() {
    return {
      scrollViewId: "",
      winHeight: 0,
      itemHeight: 0,
      winOffsetY: 0,
      touchmove: false,
      touchmoveIndex: -1,
      touchmovable: false,

      // 骨架屏
      skeleton: [
        {
          type: "flex",
          num: 1,
          style: "width: 100%; justify-content: space-between;",
          children: [
            {
              type: "line",
              num: 30,
              gap: "10px",
              style: "height: 20px;",
            },
            {
              type: "custom",
              style: "width: 10px;",
            },
            {
              type: "line",
              num: 30,
              gap: "10px",
              style: "height: 20px;",
            },
          ],
        },
      ],

    };
  },
  mounted() {
    // #ifdef H5
    this.isPC = this.IsPC();
    // #endif

    setTimeout(() => {
      this.setList();
    }, 50);
  },
  methods: {
    async setList() {
      getRect(".ko-index-list__menu--wrap", this).then(res => {
        this.winOffsetY = res?.top || 0;
        this.winHeight = res?.height || 0;
        this.itemHeight = this.winHeight / this.IndexMenus?.length;
      });
    },


    touchStart(e) {
      this.touchmove = true;
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      let key = this.IndexMenus[index];

      if (this.touchmoveIndex === index) {
        key = "";
        this.touchmoveIndex = -1;
      } else {
        this.touchmoveIndex = index;
      }

      this.$emit("search", key);

      if (e) return false;

      let item = this.getGroupListByKey(key);
      if (item?.length > 0) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
    },
    touchMove(e) {
      if (e) return false;

      // #ifndef APP-PLUS
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      if (this.touchmoveIndex === index) {
        return false;
      }
      const key = this.IndexMenus[index];
      let item = this.getGroupListByKey(key);

      if (item?.length > 0) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
      // #endif

      // #ifdef APP-PLUS
      throttleTouchMove.call(this, e);
      // #endif
    },
    touchEnd() {
      this.touchmove = false;
    },

    /**
     * 兼容 PC
     */

    mousedown(e) {
      if (!this.isPC) return;
      this.touchStart(e);
    },
    mousemove(e) {
      if (!this.isPC) return;
      this.touchMove(e);
    },
    mouseleave(e) {
      if (!this.isPC) return;
      this.touchEnd(e);
    },

    // 到底部了
    onToLower(event) {
      this.$emit("lower", event);
    },

    // 到顶部了
    onToUpper(event) {
      this.$emit("upper", event);
    },

    // #ifdef H5
    IsPC() {
      const userAgentInfo = navigator.userAgent;
      const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length - 1; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    // #endif

    onClick(item, event) {
      this.$emit("click", item, event);
    },

    onItemNumberChange(...arg) {
      this.$emit("number-change", ...arg);
    },

    onActionClick(...arg) {
      this.$emit("action-click", ...arg);
    },
  },
  computed: {
    IndexMenus,

    isSelection() {
      return (node) => {
        const checked = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        return checked.indexOf(node.value) > -1;
      };
    },
    getDisabled() {
      return (node) => {
        if (!_isEmpty(this.checkedList)) {
          return this.checkedList?.indexOf(node.value) < 0;
        }
        if (Array.isArray(this.disabled)) {
          return this.disabled.indexOf(node.value) > -1;
        } else {
          return this.disabled;
        }
      };
    },

    getSkeleton() {
      return (this.v20241216 || this.isProduct || this.isSelected) ? this.skeleton : [
        {
          type: "flex",
          num: 1,
          style: "padding: 20px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 10px; height: 64px; width: 64px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 2,
              gap: "30px",
              style: ["width: 200px; height: 20px;", null],
            },
          ],
        },
        {
          type: "flex",
          num: 1,
          style: "padding: 20px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 10px; height: 64px; width: 64px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 2,
              gap: "30px",
              style: ["width: 200px; height: 20px;", null],
            },
          ],
        },
        {
          type: "flex",
          num: 1,
          style: "padding: 20px;",
          children: [
            {
              type: "avatar",
              num: 1,
              style: "marginRight: 10px; height: 64px; width: 64px; border-radius: 50%;",
            },
            {
              type: "line",
              num: 2,
              gap: "30px",
              style: ["width: 200px; height: 20px;", null],
            },
          ],
        },
      ];
    },
  },
};
</script>

<template>
  <view class="ko-index-list__wrapper">
    <view class="ko-index-list" ref="ListRef" id="list">
      <scroll-view
        :scroll-into-view="scrollViewId"
        class="ko-index-list__scroll"
        scroll-y
        :class="[{'safe-area-inset-bottom': safeAreaInsetBottom}]"
        @scrolltolower="onToLower"
        @scrolltoupper="onToUpper"
        :lower-threshold="400"
        :upper-threshold="400"
      >
        <view class="ko-index-list__content">
          <view
            class="ko-index-list__scroll--wrap"
            :class="{'is-double-row': isProduct || isSelected}"
          >
            <block v-if="v20241216">
              <!-- 添加订单的时候显示的产品列表 -->
              <block v-if="isSelected">
                <view
                  class="ko-index-list__item"
                  v-for="(item) in data"
                  :key="item.id"
                >
                  <ProductCard
                    :node="item"
                    is-editor
                    is-list
                    :selected="selected"
                    @number-change="onItemNumberChange"
                    :hide-prices="hidePrices"
                    :type="extra.type"
                    :is-judge="isJudge"
                  />
                </view>
              </block>

              <!-- 产品列表 -->
              <block v-else-if="isProduct">
                <view
                  class="ko-index-list__item"
                  v-for="(item) in data"
                  :key="item.id"
                >
                  <view v-if="isChecked" class="ko-index-list__item--checked" @click.stop="onClick(item)">
                    <view class="ko-index-list__item--checked--box">
                      <checkbox :checked="isSelection(item)" :disabled="getDisabled(item)" />
                    </view>
                  </view>
                  <ProductCard
                    :is-hide-stock-price="isHideStockPrice"
                    :node="item"
                    is-list
                    :span="24"
                    perm="Product_Write"
                    custom-style="height: 100%;"
                    style="height: 100%;"
                  >
                    <template #footer>
                      <view class="ko-product__item--footer">
                        <button
                          class="ko-basic-button__card action"
                          @click="onActionClick(item)"
                        >
                          更多
                        </button>
                      </view>
                    </template>
                  </ProductCard>
                </view>
              </block>

            </block>

            <block v-else>
              <!-- 产品显示 -->
              <block v-if="isProduct || isSelected">
                <view
                  class="ko-index-list__item"
                  v-for="(item) in data"
                  :key="item.id"
                >
                  <slot
                    v-if="$slots.cell"
                    name="cell"
                    :node="item"
                    :selected="selected"
                    :hide-prices="hidePrices"
                    :extra="extra"
                  ></slot>
                </view>
              </block>

              <!-- 人员 -->
              <template v-else>
                <view
                  class="ko-index-list__item"
                  v-for="(item, index) in data"
                  :key="index"
                >
                  <BasicCard no-shadow :spacing="0" style="width: 100%;" @click.stop="onClick(item)">
                    <view class="ko-user">
                      <view class="ko-user__wrap">
                        <view style="margin-right: 10px;" v-if="isChecked">
                          <checkbox :checked="isSelection(item)" :disabled="getDisabled(item)" />
                        </view>

                        <UvAvatar
                          :size="64"
                          :src="getImageUrl(item.logo)"
                          mode="aspectFill"
                          :text="item.label || GET_SHOP_NAME"
                          random-bg-color
                        />
                        <view style="padding-left: 10px; flex: 1;">
                          <UniRow :gutter="10">
                            <UniCol :span="24">
                              <view class="ko-user__name">{{ item.label || "-" }}</view>
                            </UniCol>
                            <UniCol :span="24" v-if="item.amount">
                              <label v-if="isReceiptList" class="ko-basic-label" style="font-size: 14px;">
                                {{ item.amount > 0 ? "待结账" : "多付" }}：
                              </label>
                              <label v-else class="ko-basic-label" style="font-size: 14px;">
                                {{ item.amount > 0 ? "多付" : isSupplier ? "应付" : "欠款" }}：
                              </label>
                              <text class="ko-basic-money" style="font-weight: 500; font-size: 14px">
                                {{ absYuan(item.amount) }}元
                              </text>
                            </UniCol>
                          </UniRow>
                          <i v-if="false" class="iconfont icon-shanghuguanli"></i>
                        </view>
                      </view>
                      <view class="ko-user__buttons" v-if="buttonPerm ? isPerm(buttonPerm) : true">
                        <button
                          class="ko-basic-button__user"
                          v-for="(button, dx) of events"
                          @click.stop="$emit('click-item', button, item)"
                          :key="dx"
                        >
                          {{ button.label }}
                        </button>
                        <slot v-if="$slots.default" :node="item"></slot>
                      </view>
                    </view>
                  </BasicCard>
                </view>
              </template>
            </block>
          </view>

          <view class="ko-index-list__loading" v-if="loading">
            <UniSkeletons
              loading
              :skeleton="getSkeleton"
              animate
            />
          </view>
          <view class="ko-index-list__not-list" v-if="!loading && !data.length && !noMore">
            暂无数据
          </view>
          <view class="ko-index-list__not-list" v-if="!loading && noMore">
            没有更多数据了
          </view>
        </view>
      </scroll-view>

      <view class="ko-index-list__menu">
        <view
          class="ko-index-list__menu--wrap"
          @touchstart="touchStart"
          @touchmove.stop.prevent="touchMove"
          @touchend="touchEnd"
          @mousedown.stop="mousedown"
          @mousemove.stop.prevent="mousemove"
          @mouseleave.stop="mouseleave"
        >
          <view
            v-for="(key, index) in IndexMenus"
            :key="index"
            class="ko-index-list__menu--item"
            :class="{'is-active': touchmoveIndex === index}"
          >
            <text
              class="ko-index-list__menu--text"
              :class="{'is-active': touchmoveIndex === index}"
            >
              {{ key }}
            </text>
          </view>
        </view>
      </view>
      <view v-if="touchmove" class="ko-index-list__alert--wrapper">
        <text class="ko-index-list__alert">{{ IndexMenus[touchmoveIndex] }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-index-list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;

  &__content {
    padding-bottom: 100px;
  }


  &__loading, &__not-list {
    /* position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -200%);
     z-index: 88;*/

    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__loading {
    height: 300px;
    display: block;
    overflow: hidden;
  }

  &__not-list {
    color: #c7c9ce;
    font-size: 12px;
  }

  &__scroll {
    flex: 1;

    &.safe-area-inset-bottom {
      padding-bottom: env(safe-area-inset-bottom);
    }

    &--wrap {
      &.is-double-row {
        display: flex;
        flex-wrap: wrap;
        // #ifdef MP
        width: 100vw;
        // #endif
        padding: 5px 5px;

        .ko-index-list__item {
          border-bottom: none;
          padding: 0;
          width: calc(50vw - 20px);
          max-width: calc(50vw - 20px);
          min-width: calc(50vw - 20px);
          margin: 5px;
        }
      }
    }
  }

  &__menu {
    width: 30px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;

    &--wrap {
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    &--item {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      /* #ifdef H5 */
      cursor: pointer;
      /* #endif */

      &.disabled .ko-index-list__menu-text {
        color: #ccc;
      }
    }

    &--text {
      font-size: 14px;
      text-align: center;
      color: #333;

      &.is-active {
        border-radius: 50%;
        width: 26px;
        height: 26px;
        line-height: 26px;
        background-color: #007aff;
        color: #fff;
      }
    }
  }

  &__alert {
    width: 80px;
    height: 80px;
    border-radius: 80px;
    text-align: center;
    line-height: 80px;
    font-size: 35px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);

    &--wrapper {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      /* #ifndef APP-NVUE */
      display: flex;
      /* #endif */
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  }

  &__item {
    border-bottom: 0.5px solid #c7c9ce;
    padding: 0 10px 0 10px;
    font-size: 16px;

    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    position: relative;

    &--checked {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 9;

      &:before {
        content: " ";
        position: absolute;
        z-index: 10;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
    }
  }
}

.ko-product__item--footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .action {
    padding: 5px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.ko-user {
  &__wrap {
    display: flex;
    align-items: center;
    position: relative;

    &:before {
      content: " ";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9;
    }

    .iconfont.icon-shanghuguanli {
      position: absolute;
      right: -6px;
      top: -10px;
      color: #f3a73f;
      font-size: 18px;
    }
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;
  }

  &__name {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
