<script>
import { _deepCopy, _get, _isEmpty, getRect } from "@/utils";
import mixins from "@/mixins/mixins";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";

import UniSkeletons from "@/uni_modules/uv-skeletons/components/uv-skeletons/uv-skeletons.vue";
import { WX_USER_TAG_ENUMS } from "@/utils/config";

// 索引列表
const IndexMenus = () => "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default {
  name: "IndexList",
  components: {
    UniRow,
    UniCol,
    BasicCard,
    UvAvatar,
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
    isChecked: Boolean, // 显示选择
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

    // 员工
    isStaff: Boolean,

    // 生产工单
    isWork: Boolean,

    // 不需要索引列表
    notIndex: Boolean,
    // 显示更多按钮
    showMoreButton: Boolean,

    // 显示按钮的方法
    showEventButtonFunc: Function,

    // 显示绑定的用户列表
    showBindUserList: Boolean,

    // 显示库存
    showQuantity: Boolean,

    // 发送页面选人列表
    isSendMsg: Boolean,

    // 微信用户标签设置
    isWeChat: Boolean,
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
    }, 600);
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

    onEventItem(button, item, index, dx) {
      this.$emit("click-item", button, item, index, dx);

      this.$emit("click-event", {button, item, $index: index, buttonIndex: dx});
    },

    onMoreClick(item, index) {
      this.$emit("click-more", item, index);
    },

    onHasSub(...arg) {

      this.$emit("has-sub", ...arg);
    },
  },
  computed: {
    WX_USER_TAG_ENUMS() {
      return WX_USER_TAG_ENUMS;
    },
    IndexMenus,

    isSelection() {
      return (node) => {
        const checked = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        return checked.indexOf(node.value || node.id) > -1;
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

    getShowEventButton() {
      return (button, item, index, dx) => {
        return this.showEventButtonFunc ?
          this.showEventButtonFunc({
            button,
            item,
            index,
            dx,
          }) : true;
      };
    },

    // 获取绑定的用户头像列表
    getBindUserList() {
      return (item) => {
        const list = _deepCopy(_get(item, "users")) || [];
        return list?.slice?.(0, 3) || [];
      };
    },

    // 标签
    getWeTag() {
      return item => item.tags?.split?.(",") || [];
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
                  v-for="(item, index) in data"
                  :key="item.id"
                >
                  <view v-if="isChecked" class="ko-index-list__item--checked" @click.stop="onClick(item)">
                    <view class="ko-index-list__item--checked--box">
                      <checkbox :checked="isSelection(item)" :disabled="getDisabled(item)" />
                    </view>
                  </view>
                  <ProductCard
                    :node="item"
                    is-editor
                    is-list
                    :selected="selected"
                    @number-change="onItemNumberChange"
                    :hide-prices="hidePrices"
                    :type="extra.type"
                    :is-judge="isJudge"
                    :is-work="isWork"
                    :is-hide-quantity="isChecked"
                    :show-quantity="showQuantity"
                    @has-sub="onHasSub(item, index)"
                  />
                </view>
              </block>

              <!-- 产品列表 -->
              <block v-else-if="isProduct">
                <view
                  class="ko-index-list__item"
                  v-for="(item, index) in data"
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
                    custom-style="height: 100%;"
                    style="height: 100%;"
                    :show-quantity="showQuantity"
                  >
                    <template #footer>
                      <view class="ko-product__item--footer">
                        <button
                          class="ko-basic-button__card action"
                          @click="onActionClick(item, index)"
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
                  :class="{'is-send-msg': isSendMsg}"
                >
                  <BasicCard no-shadow :spacing="0" style="width: 100%;" @click.stop="onClick(item)">
                    <view class="ko-user">
                      <view class="ko-user__wrap" style="position: relative">
                        <view style="margin-right: 6px;" v-if="isChecked">
                          <checkbox :checked="isSelection(item)" :disabled="getDisabled(item)" />
                        </view>
                        <view style="margin-right: 6px">
                          <UvAvatar
                            :size="isSendMsg ? 32 : 54"
                            :src="getImageUrl(item.avatar || item.logo)"
                            mode="aspectFill"
                            :text="item.label || GET_SHOP_NAME"
                            random-bg-color
                            @click.stop
                          />
                        </view>
                        <view style="flex: 1;">
                          <!-- 显示用户名称 -->
                          <view class="ko-user__name">{{ item.label || "临时客户" }}</view>

                          <view v-if="item.amount && !isSendMsg">
                            <label v-if="isReceiptList" class="ko-basic-label">
                              {{ item.amount > 0 ? "待结账" : "多付" }}：
                            </label>
                            <label v-else-if="isStaff" class="ko-basic-label">
                              工资：
                            </label>
                            <label v-else class="ko-basic-label">
                              {{ item.amount > 0 ? "多付" : isSupplier ? "应付" : "欠款" }}：
                            </label>
                            <text class="ko-basic-money" style="font-weight: 500;">
                              {{ absYuan(item.amount) }}元
                            </text>
                          </view>
                        </view>

                        <!-- 绑定的用户 -->
                        <view
                          v-if="(isStaff) && !isEmpty(GET_FUNC(item, 'users')) && !isSendMsg"
                          class="ko-index-list__bind-user"
                        >
                          <view
                            style="display: flex; align-items: center;justify-content: center; flex-direction: column;">
                            <uv-avatar
                              :src="getImageUrl(GET_FUNC(item, 'users.0.avatar'))"
                              :text="GET_FUNC(item, 'users.0.nickName')"
                              random-bg-color
                              :size="22"
                            />
                            <view style="font-size: 10px;color: #999; text-align: center;">
                              {{ GET_FUNC(item, "users.0.nickName") || "-" }}
                            </view>
                          </view>
                        </view>

                        <!-- 绑定的用户列表 -->
                        <block v-if="showBindUserList && !isEmpty(GET_FUNC(item, 'users'))">
                          <view class="ko-index-list__bind-user">
                            <view
                              v-for="user of getBindUserList(item)"
                              :key="user.userId"
                              style="display: flex; justify-content: center; flex-direction: column; align-items: center; padding: 0 4px;"
                            >
                              <uv-avatar
                                :src="getImageUrl(GET_FUNC(user, 'avatar'))"
                                :text="GET_FUNC(user, 'nickName')"
                                random-bg-color
                                :size="22"
                              />
                              <view style="font-size: 10px;color: #999; text-align: center;">
                                {{ GET_FUNC(user, "nickName") || "-" }}
                              </view>
                            </view>
                          </view>
                        </block>

                        <!-- 显示标签 -->
                        <view class="ko-index-list__we-chat">
                          <text
                            class="ko-index-list__we-chat--item"
                            v-for="c of getWeTag(item)"
                            :key="c"
                            :class="c"
                          >
                            {{ WX_USER_TAG_ENUMS[c] }}
                          </text>
                          <!-- <text class="newUser ko-index-list__we-chat&#45;&#45;item">
                             新用户
                           </text>-->
                        </view>
                      </view>
                      <view class="ko-user__buttons" v-if="buttonPerm ? isPerm(buttonPerm) : true">
                        <button
                          class="ko-basic-button__user"
                          v-for="(button, dx) of events"
                          @click.stop="onEventItem(button, item, index, dx)"
                          :key="dx"
                          v-if="getShowEventButton(button, item, index, dx)"
                        >
                          {{ button.label }}
                        </button>
                        <button
                          class="ko-basic-button__user"
                          @click.stop="onMoreClick(item, index)"
                          v-if="showMoreButton"
                        >
                          更多
                        </button>
                        <slot v-if="$slots.default" :node="item" :index="index"></slot>
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

      <block v-if="!notIndex">
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
      </block>
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

    &.is-send-msg {
      padding: 0;

      .ko-user__name {
        font-size: 13px;
      }

      .ko-basic-label, .ko-basic-money {
        font-size: 12px;
      }
    }

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

    .ko-user__name {
      font-size: 16px;
    }

    .ko-basic-label, .ko-basic-money {
      font-size: 12px;
    }
  }

  // 用户标签
  &__we-chat {
    position: absolute;
    top: -6px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--item {
      font-size: 8px;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1rpx solid #000;
      margin: 2px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.newUser {
        color: rgb(255, 165, 0);
        border-color: rgb(255, 165, 0);
        background: rgba(255, 165, 0, 0.1);
      }

      &.customerTag {
        color: #4CAF50;
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
      }

      &.supplierTag {
        color: #2196F3;
        border-color: #2196F3;
        background: rgba(33, 150, 243, 0.1);
      }

      &.staffTag {
        color: #9C27B0;
        border-color: #9C27B0;
        background: rgba(156, 39, 176, 0.1);
      }

      &.logisticTag {
        color: #3F51B5;
        border-color: #3F51B5;
        background: rgba(63, 81, 181, 0.1);
      }
    }
  }

  // 绑定的用户
  &__bind-user {
    position: absolute;
    top: 14px;
    right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    margin-top: 4rpx;

    .ko-basic-button__user {
      line-height: 1.2;
    }
  }

  &__name {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
