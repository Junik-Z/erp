<script>

export default {
  name: "LoadMore",
  props: {
    loading: Boolean,
    more: Boolean,
    noMore: Boolean,
    contentText: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    getStatus() {
      return this.loading ? "loading" : this.more ? "more" : "noMore";
    },
  },
};
</script>

<template>
  <view style="font-size: 12px;color: #999;">没有更多数据了</view>
</template>

<style scoped lang="scss">

</style>
