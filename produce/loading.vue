<script>
import TopMenus from "./components/TopMenus.vue";
import mixins from "@/mixins/mixins";
import { TabList } from "./define";

export default {
  name: "loading",
  components: {TopMenus},
  mixins: [mixins],
  data() {
    return {
      noRole: false,
    };
  },
  computed: {
    TabList() {
      return TabList;
    },
  },
  methods: {
    onJumpPath(path) {
      setTimeout(() => {
        uni.redirectTo({url: path});
      }, 400);
    },
  },
};
</script>

<template>
  <view style="padding: 10px;">
    <TopMenus
      v-show="false"
      :tabs="TabList"
      :path="PageEnums.produce"
      @jump-path="onJumpPath"
      :no-role.sync="noRole"
    />

    <view class="ko-not-perm" v-if="noRole" />

    <view v-else style="height: 30vh; display: flex; align-items: center; justify-content: center;">
      <uv-loading-icon size="40" />
    </view>
  </view>
</template>
