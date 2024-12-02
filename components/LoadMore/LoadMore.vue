<script>
import DaTreeVue2 from "@/components/da-tree-vue2/index.vue";
import UniLoadMore from "@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue";

export default {
  name: "LoadMore",
  components: {UniLoadMore, DaTreeVue2},
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
  <UniLoadMore
    :status="getStatus"
    :content-text="contentText"
  />
</template>

<style scoped lang="scss">

</style>
