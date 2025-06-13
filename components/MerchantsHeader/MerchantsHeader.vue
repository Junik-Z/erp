<script>
import mixins from "@/mixins/mixins";
import { CONFIG } from "@/utils/config";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BusinessAdvertising from "@/components/BusinessAdvertising/BusinessAdvertising.vue";
import { _isDev } from "@/utils";

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
      if (this.disabled && !_isDev()) return false;

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
    justify-content: center;
    width: 100%;
    margin-bottom: 36px;

    &.no-logo {
      padding-top: 30px;

      .ko-title__wrap {
        padding-right: 0;
      }
    }
  }

  .ko-logo {
    margin-right: 10px;
    padding-right: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .ko-title {
    font-size: 28px;
    font-weight: bold;

    &__wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-right: 50px;
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

    &.no-logo {
      padding-right: 0;
    }
  }

  .ko-logo {
    padding-right: 30px;
  }

  .ko-title {
    font-size: 80px;
    line-height: 1.2;

    &__wrap {
      padding-right: 50px;
      flex: none;
      width: auto;
    }

    &__desc {
      margin-top: 20px;
      font-size: 16px;
      color: #8f939c;
    }
  }

  // #endif
}
</style>
