<script>
import { _deepCopy, _get, _haveCommonElements } from "@/utils";

import mixins from "@/mixins/mixins";
import { CONFIG, MENU_LIST } from "@/utils/config";
import KoNotice from "@/components/Notice/Notice.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import MerchantsHeader from "@/components/MerchantsHeader/MerchantsHeader.vue";

export default {
  components: {
    MerchantsHeader,
    UniCol,
    UniRow,
    KoNotice,
  },
  mixins: [mixins],
  data() {
    let disabled = false;

    // #ifdef H5
    disabled = true;
    // #endif

    return {
      gridList: MENU_LIST,
      disabled,

      // #ifdef MP
      menuButton: uni.getMenuButtonBoundingClientRect(),
      // #endif
    };
  },
  onLoad() {
    uni.$__FIELD_LIST__ = [];

    // console.log("用户权限", this.GET_USER_ROLE);

    // #ifdef MP
    /* const scene = uni.getStorageSync("__APP_SCENE__");
    if ((!scene || _isEqual(scene, "default")) && !_isEnv()) {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.MHRef.onOpen();
        });
      }, 600);
    } */
    // #endif
  },
  computed: {
    getMenuButtonStyle() {
      const {top, height} = this.menuButton || {};
      return {
        "--ko-menu-top": (top || 0) + "px",
        "--ko-menu-height": (height || 0) + "px",
      };
    },
    getMenuList() {
      return _deepCopy(this.gridList)
        .flatMap(item => {
          const role = this.GET_USER_ROLE;

          // 判断是否有单独的字段校验
          const checkField = this.isAdmin || !item.checkField || _get(this.GET_CONFIG_INFO, item.checkField);

          if (_haveCommonElements(role, item.role) && checkField) {
            return [item];
          } else {
            return [];
          }
        });
    },
  },
  // #ifdef H5
  watch: {
    GET_SHOP_NAME: {
      handler() {
        document.title = `${this.GET_SHOP_NAME} —— ${CONFIG.TITLE}`;
      },
      immediate: true,
      deep: true,
    },
  },
  // #endif
  methods: {
    onChange(item) {
      if (!item.value) {
        uni.showToast({
          icon: "none",
          title: "功能正在开发中，尽情期待。",
        });
        return false;
      }
      uni.navigateTo({url: item.value});
    },
    onJumpStore() {
      uni.navigateTo({
        url: "/admin/admin/store",
      });
    },
  },
};
</script>

<template>
  <view class="ko-home" :style="[getMenuButtonStyle]">
    <KoNotice is-custom />

    <MerchantsHeader ref="MHRef" :disabled="disabled" />

    <button class="ko-home__store" @click="onJumpStore" v-if="isBusiness || isAdmin">
      <i class="iconfont icon-shezhi"></i>
    </button>

    <!-- #ifdef H5 -->
    <!-- #endif -->

    <!-- #ifdef MP -->
    <UniRow
      @click.stop="() => {}"
      :gutter="20"
    >
      <UniCol
        v-for="(item, index) of getMenuList"
        :key="item.value"
        :index="index"
        :span="8"
      >
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <div class="ko-home__wrap">
          <div class="ko-home__content">
            <button
              v-for="(item) of getMenuList"
              :key="item.value"
              class="ko-home__item--button"
            >
              <!-- #endif -->
              <view class="ko-home__item" @click="onChange(item)">
                <i :class="['iconfont', item.icon]"></i>
                <text>{{ item.label }}</text>
              </view>
              <!-- #ifdef H5 -->
            </button>
          </div>
        </div>
        <!-- #endif -->

        <!-- #ifdef MP -->
      </UniCol>
    </UniRow>
    <!-- #endif -->

    <view class="ko-home__not-role" v-if="!getMenuList.length">
      <image
        src="/static/images/icons/no-role.png"
        class="ko-home__not-role--image"
      />
      您还没有任何权限，请联系管理员给您授权！
    </view>
  </view>
</template>

<style lang="scss" scoped>

// #ifdef MP
.ko-home {
  height: 100vh;
  padding: 120px 20px;

  &__item {
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .iconfont {
      font-size: 50px;
      margin-bottom: 10px;
    }

    .iconfont.icon-kucuntongjifenxi {
      margin-left: 20px;
    }

    &--checkbox {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 9;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 30px;
    }
  }

  &__button {
    position: fixed;
    top: var(--ko-menu-top);
    left: 20px;
    height: var(--ko-menu-height, 32px);
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      font-size: 20px;
    }
  }

  .ko-basic-button {
    margin-top: 50px;
  }

  &__not-role {
    color: #8f939c;
    text-align: center;
    margin-top: 30px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &--image {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
    }
  }

  &__store {
    position: fixed;
    top: var(--ko-menu-top);
    left: var(--ko-menu-left);
    height: var(--ko-menu-height, 32px);
    z-index: 88;

    .icon-shezhi {
      height: var(--ko-menu-height, 32px);
      font-size: 26px;
    }
  }
}

// #endif


// #ifdef H5
.ko-home {
  height: 100vh;
  background: -webkit-radial-gradient(50% 35%, farthest-corner, #034f8e, #034987, #02366d, #002353);
  background: radial-gradient(50% 35%, farthest-corner, #034f8e, #034987, #02366d, #002353);

  color: #fff;
  padding-top: 100px;
  padding-bottom: 200px;
  position: relative;

  &__header {
    &--title {
      font-size: 60px;
      text-align: center;
      line-height: 1.4;
    }
  }

  &__title {
    font-size: 28px;
    text-align: center;
    line-height: 1.2;
    margin-top: 10px;
    color: #c7c9ce;
  }

  &__button {
    position: fixed;
    right: 30px;
    top: 30px;

    .iconfont {
      font-size: 28px;
      color: #fff;
    }
  }

  &__wrap {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    max-width: 1366px;
    margin: 0 auto;
  }

  &__content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 180px;
    position: relative;

    .iconfont {
      font-size: 100px;
      width: 100px;
      height: 100px;

      &.icon-kucuntongjifenxi {
        margin-left: 30px;
      }
    }

    &--checkbox {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 9;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 30px;
    }

    &--button {
      color: #fff;
      margin: 0 20px 20px;
    }
  }

  .ko-basic-button {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
  }

  &__not-role {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9;
    color: #8f939c;
    text-align: center;
    margin-top: 30px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &--image {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
    }
  }

  &__store {
    position: fixed;
    top: 50px;
    right: 50px;
    z-index: 88;

    .icon-shezhi {
      font-size: 30px;
      color: #fff;
    }
  }
}

// #endif
</style>
