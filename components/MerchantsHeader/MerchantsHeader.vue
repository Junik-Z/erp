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
      let size = 50;
      // #ifdef H5
      size = 100;
      // #endif
      return size;
    },
  },
};
</script>

<template>
  <view class="ko-merchants-header">
    <view
      class="ko-merchants-header__wrap"
      :class="{'no-logo': !GET_CONFIG_INFO.logo}"
    >
      <view
        @click.stop="onOpen()"
        class="ko-logo"
        v-if="GET_CONFIG_INFO.logo"
      >
        <UvAvatar
          :size="getAvatarSize"
          :src="getImageUrl(GET_CONFIG_INFO.logo)"
          :random-bg-color="false"
          :text="GET_SHOP_NAME"
          not-view
          @click.stop="onOpen()"
        />
      </view>

      <view class="ko-title__wrap">
        <view @click.stop="onOpen()" class="ko-title">
          {{ GET_SHOP_NAME }}

          <view class="ko-title__desc">
            {{ CONFIG.TITLE }}
          </view>
        </view>
      </view>

    </view>

    <BusinessAdvertising :visible.sync="visible" :is-qr-code="isQrCode" />
  </view>
</template>

<style scoped lang="scss">
.ko-merchants-header {
  &__wrap {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 36px;

    &.no-logo {
      padding-top: 30px;
      justify-content: center;
    }
  }

  .ko-logo {
    margin-right: 20px;
    padding-right: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 30%;
  }

  .ko-title {
    font-size: 28px;
    font-weight: bold;

    &__wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__desc {
      font-size: 16px;
      color: #8f939c;
      text-align: center;
    }
  }

  // #ifdef H5
  &__wrap {
    justify-content: center;
    padding-right: 80px;

    &.no-logo {
      padding-right: 0;
    }
  }

  .ko-logo {
    width: auto;
  }

  .ko-title {
    font-size: 80px;
    line-height: 1.2;

    &__desc {
      margin-top: 20px;
      font-size: 16px;
      color: #8f939c;
    }
  }

  // #endif
}
</style>
