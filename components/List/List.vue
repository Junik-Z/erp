<script>
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

import { _deepCopy, getRect } from "@/utils";

export default {
  name: "KoList",
  components: {UvLoadingIcon},
  props: {
    loading: Boolean,
    noMore: Boolean,
    noData: Boolean,
    hideTips: Boolean,
    safeAreaInsetBottom: {
      type: Boolean,
      default: true,
    },
    noMoreText: {
      type: String,
      default: "没有更多数据了",
    },
    noDataText: {
      type: String,
      default: "暂无数据",
    },
    data: Array,
    // 不许要滚动
    noRefresh: Boolean,
    // 滚动到指定id位置
    scrollIntoView: [String, null],
  },
  watch: {
    data: {
      handler(t, f) {
        // #ifdef H5
        if (!t || !t.length) {
          this.bTop = 0;
        }

        if (t && t?.length !== f?.length && this.$refs.SRef) {
          const sEl = this.$refs.SRef?.$el?.querySelector?.(".uni-scroll-view > .uni-scroll-view");
          this.$nextTick(() => {
            sEl.scrollTop = this.bTop;
          });
        }
        // #endif

        if (this.noRefresh) return false;
        this.T_V && clearTimeout(this.T_V);
        this.$nextTick(() => {
          this.T_V = setTimeout(this.judgeNext, 600);
        });
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      scrollTop: 0,

      cTop: 0,
      bTop: 0,
    };
  },
  methods: {
    // 滚动到底部了
    onToLower() {
      if (this.loading || this.noMore) return false;
      this.getSTop();
      this.$emit("lower", this.cTop);
    },

    getSTop() {
      // #ifdef H5
      const T = this.$refs.SRef.$el?.querySelector?.(".uni-scroll-view > .uni-scroll-view")?.scrollTop || this.cTop;
      this.bTop = _deepCopy(T);
      // #endif
    },

    // 处理判断是否要加载下一页
    async judgeNext() {
      if (this.noMore) return false;
      const root = await getRect(".ko-list", this);
      const cWrap = await getRect(".ko-list__wrap", this);

      // 内容高度 - 滚动触发距离 小于等于 容器高度的时候触发加载下一页数据用于填充数据
      if ((cWrap.height - 100) <= root.height) {
        this.getSTop();

        this.$emit("load-next", this.cTop);
      }
    },

    // 获取滚动距离
    onScroll(event) {
      this.cTop = event.detail?.scrollTop;
    },

    // 处理设置滚动距离
    setScrollTop(top) {
      if (!this.noRefresh) {
        this.scrollTop = top;
      }
    },
  },
  beforeDestroy() {
    this.T_V && clearTimeout(this.T_V);
  },
};
</script>

<template>
  <scroll-view
    :scroll-y="!noRefresh"
    class="ko-list"
    :lower-threshold="100"
    @scrolltolower="onToLower"
    :refresher-threshold="60"
    @scroll="onScroll"
    :scroll-top="scrollTop"
    ref="SRef"
    :scroll-into-view="scrollIntoView || ''"
    scroll-with-animation
  >
    <view class="ko-list__wrap" :class="{'safe': safeAreaInsetBottom}">
      <slot />

      <view class="ko-list__loading" v-if="loading">
        <UvLoadingIcon size="40" />
      </view>

      <block v-if="!hideTips">
        <view class="ko-list__no-more" v-if="noMore && !loading && !noData">
          {{ noMoreText }}
        </view>

        <view class="ko-list__no-data" v-if="!loading && noData">
          {{ noDataText }}
        </view>
      </block>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.ko-list {
  height: 100%;
  width: 100%;

  &__wrap {
    &.safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 50px;
  }

  &__no-data, &__no-more {
    padding: 20px 10px 30px;
    text-align: center;
    color: #c7c9ce;
    font-size: 12px;
  }

  &__no-more {
    color: #c7c9ce;
  }
}
</style>
