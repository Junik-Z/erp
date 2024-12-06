<script>
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BusinessAdvertising from "@/components/BusinessAdvertising/BusinessAdvertising.vue";

export default {
  name: "MerchantsHeader",
  components: {BusinessAdvertising, UvAvatar},
  computed: {
    CONFIG() {
      return CONFIG;
    },
  },
  mixins: [mixins],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    onOpen() {
      this.visible = true;
    },
  },
  mounted() {
  },
};
</script>

<template>
  <view class="ko-merchants-header">
    <view @click.stop="onOpen()" class="ko-merchants-header__title" v-if="!GET_CONFIG_INFO.logo">
      {{ GET_SHOP_NAME }}
    </view>

    <view @click.stop="onOpen()" class="ko-merchants-header__logo" v-else>
      <UvAvatar
        :size="100"
        :src="getImageUrl(GET_CONFIG_INFO.logo)"
        random-bg-color
        :text="GET_SHOP_NAME"
      />
    </view>

    <view class="ko-merchants-header__desc">
      {{ CONFIG.TITLE }}
    </view>

    <BusinessAdvertising :visible.sync="visible" />
  </view>
</template>

<style scoped lang="scss">
.ko-merchants-header {
  &__title {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 16px;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  &__desc {
    font-size: 16px;
    color: #8f939c;
    text-align: center;
    margin-bottom: 50px;
  }
}
</style>
