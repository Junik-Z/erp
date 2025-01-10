<script>

export default {
  name: "LoadMore",
  props: {
    loading: Boolean,
    more: Boolean,
    noMore: Boolean,
    contentText: {
      type: String,
    },
  },
  computed: {
  },
};
</script>

<template>
  <view style="font-size: 12px;color: #999; text-align: center;">{{ contentText || '没有更多数据了' }}</view>
</template>

<style scoped lang="scss">

</style>
