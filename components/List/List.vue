<script>
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";

export default {
  name: "KoList",
  components: {UvLoadingIcon},
  props: {
    loading: Boolean,
    noMore: Boolean,
    noData: Boolean,
  },
  methods: {
    // 滚动到底部了
    onToLower() {
      if (!this.loading && !this.noMore && !this.noData) {
        this.$emit("lower");
      }
    },
  },
};
</script>

<template>
  <scroll-view
    scroll-y
    class="ko-list"
    lower-threshold="100"
    @scrolltolower="onToLower"
    refresher-threshold="60"
  >
    <view class="ko-list__wrap">
      <slot />

      <view class="ko-list__loading" v-if="loading">
        <UvLoadingIcon size="40" />
      </view>

      <view class="ko-list__no-more" v-if="noMore && !loading && !noData">
        没有更多数据了
      </view>

      <view class="ko-list__no-data" v-if="!loading && noData">
        暂无数据
      </view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.ko-list {
  height: 100%;
  width: 100%;

  &__wrap {
    padding-bottom: env(safe-area-inset-bottom);
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
  }

  &__no-more {
    color: #c7c9ce;
  }
}
</style>
