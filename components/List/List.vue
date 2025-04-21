<script>
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

import { getRect } from "@/utils";

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
    noRefresh: Boolean
  },
  watch: {
    data: {
      handler() {
        if (this.noRefresh) return false

        this.T_V && clearTimeout(this.T_V);
        this.$nextTick(() => {
          this.T_V = setTimeout(this.judgeNext, 600);
        })
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 滚动到底部了
    onToLower() {
      if (!this.loading && !this.noMore && !this.noData) {
        this.$emit("lower");
      }
    },

    // 处理判断是否要加载下一页
    async judgeNext() {
      if (this.noMore) return false;

      const root = await getRect(".ko-list", this);
      const cWrap = await getRect(".ko-list__wrap", this);

      console.log(cWrap.height, root.height);

      if (cWrap.height <= root.height) {
        this.$emit('load-next');
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
