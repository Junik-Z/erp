<script>
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BusinessAdvertising from "@/components/BusinessAdvertising/BusinessAdvertising.vue";

export default {
  name: "MerchantsHeader",
  components: {BusinessAdvertising, UvAvatar},
  props: {
    isQrCode: Boolean,
    disabled: Boolean,
  },
  mixins: [mixins],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    onOpen() {
      if (this.disabled) return false;

      this.visible = true;
    },
  },
  mounted() {
  },
  computed: {
    CONFIG() {
      return CONFIG;
    },

    // 获取头像大小
    getAvatarSize() {
      let size = 100;
      // #ifdef H5
      size = 130;
      // #endif
      return size;
    },
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
        :size="getAvatarSize"
        :src="getImageUrl(GET_CONFIG_INFO.logo)"
        random-bg-color
        :text="GET_SHOP_NAME"
        not-view
        @click.stop="onOpen()"
      />
    </view>

    <view class="ko-merchants-header__desc">
      {{ CONFIG.TITLE }}
    </view>

    <BusinessAdvertising :visible.sync="visible" :is-qr-code="isQrCode" />
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


  // #ifdef H5
  &__title {
    font-size: 80px;
    line-height: 1.2;
  }


  &__desc {
    font-size: 16px;
    color: #8f939c;
    text-align: center;
    margin-bottom: 20px;
  }

  // #endif
}
</style>
