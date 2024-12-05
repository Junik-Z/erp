<script>

import UniNoticeBar from "@/uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.vue";
import { addUnit } from "@/utils";

export default {
  name: "KoNotice",
  components: {UniNoticeBar},
  props: {
    path: String,
    isCustom: Boolean,
  },
  data() {
    return {
      isClose: "",
      boundingTop: 0,
      currentPath: "",
      visible: false,
    };
  },
  mounted() {
  },
  async created() {
    this.getCurrentPage();

    uni.$on("$__web_socket_message__", this.onSocketMessage);

    // #ifdef MP
    const Bounding = await uni.getMenuButtonBoundingClientRect();
    this.boundingTop = Bounding.top + Bounding.height;
    // #endif
  },
  methods: {
    // 获取当前页面
    getCurrentPage() {
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      this.currentPath = `/${page.route}`;

      console.log("currentPath", this.currentPath);

      // #ifdef APP-PLUS
      const currentWebview = page.$getAppWebview();
      console.log(currentWebview.id);//获得当前webview的id
      console.log(currentWebview.isVisible());//查询当前webview是否可见
      // #endif
    },
    onSocketMessage(res) {
      this.visible = true;

    },
  },
  computed: {
    rootStyle() {
      return {
        "--ko-notice-top": addUnit(this.boundingTop),
      };
    },
  },
};
</script>

<template>
  <view v-if="false" class="ko-notice" :class="{'is-custom': isCustom}" :style="[rootStyle]">
    <UniNoticeBar
      show-icon
      scrollable
      :speed="80"
      show-close
      show-get-more
      more-text="前往查看"
      text="我是一个通告栏我是一个通告栏我是一个通告栏我是一个通告栏我是一个通告栏我是一个通告栏我是一个通告栏我是一个通告栏"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-notice {
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 88;

  &.is-custom {
    top: calc(var(--ko-notice-top));
  }
}
</style>
