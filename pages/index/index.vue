<script>
import { _deepCopy, _get, _haveCommonElements, _isEmpty } from "@/utils";

import mixins from "@/mixins/mixins";
import { CONFIG, MENU_LIST, PageEnums } from "@/utils/config";
import KoNotice from "@/components/Notice/Notice.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import MerchantsHeader from "@/components/MerchantsHeader/MerchantsHeader.vue";
import Movable from "@/components/Movable/index.vue";

import Dayjs from "@/utils/dayjs";

export default {
  components: {
    MerchantsHeader,
    UniCol,
    UniRow,
    KoNotice,
    Movable,
  },
  mixins: [mixins],
  data() {
    let disabled = false;

    // #ifdef H5
    disabled = true;
    // #endif

    return {
      // 过滤掉不显示在首页的数据
      gridList: _deepCopy(MENU_LIST).filter(item => !item.noShowInHome),
      disabled,

      // #ifdef MP
      menuButton: uni.getMenuButtonBoundingClientRect(),
      // #endif

      // 系统是否过期了
      isExpired: false,

      // 有效天数
      expiredDays: 0,
    };
  },
  onShow() {
    this.$nextTick(() => {
      this.validShopDate();
    });
  },
  onLoad() {
    uni.$on("$__get_config_info_success__", this.validShopDate);

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
      this.onMsg();
      uni.navigateTo({url: item.value});
    },
    onJumpStore() {
      this.onMsg();
      uni.navigateTo({
        url: PageEnums.adminStore,
      });
    },

    onJumpMessage() {
      this.onMsg();
      uni.navigateTo({
        url: PageEnums.messageList,
      });
    },

    // 判断商户是否过期
    validShopDate(obj) {
      // date: 系统时间
      // validDate： 有效期时间
      const {validDate, date} = {...this.GET_CONFIG_INFO, ...(obj || {})};

      if (validDate && date) {
        const V = Dayjs(validDate);
        const D = Dayjs(date);
        // 判断是否过期了， V 是不是在 D 之前，
        this.isExpired = V.isBefore(D, "day");

        // 获取有效的天数
        const day = V.diff(D, "d");
        this.expiredDays = day;

        /* if (day <= 30 && day >= 15) {
        } else */

        const isNot = uni.getStorageSync("__EXPIRED__");

        if (day < 15 && day >= 3 && !isNot) {
          uni.showModal({
            title: "重要提醒",
            content: `您好！您的服务即将在${day}天后到期。为了确保业务的连续性，请尽快续期。`,
            confirmText: "我已知晓",
            cancelText: "关闭",
            success: (res) => {
              if (res.confirm) {
                uni.setStorageSync("__EXPIRED__", true);
              }
            },
          });
        } else if (day < 3 && day >= 0) {
          uni.showModal({
            title: "重要提醒",
            content: `您好！您的服务即将到期。请在接下来的${day}天内联系我们或自助续费，以确保服务的无缝延续。`,
            // #ifdef MP
            confirmText: "续费",
            // #endif
            cancelText: "关闭",
            success: (res) => {
              // #ifdef MP
              if (res.confirm) {
                this.onJumpRenewal();
              }
              // #endif
            },
          });
        } else if (day < 0) {
          uni.showModal({
            title: "重要提醒",
            content: `您好！您的服务已过期${Math.abs(day)}天，请尽快自助续费。`,
            // #ifdef MP
            confirmText: "续费",
            // #endif
            cancelText: "关闭",
            success: (res) => {
              // #ifdef MP
              if (res.confirm) {
                this.onJumpRenewal();
              }
              // #endif
            },
          });
        }
      }
    },

    // 跳转到续费
    onJumpRenewal() {
      // #ifdef MP
      uni.navigateTo({
        url: PageEnums.adminRenewal,
      });
      // #endif
    },

    // 发起通知请求
    onMsg() {
      console.log("发起授权通知", uni.$__ASK_SUBSCRIBE_MSG__ && !_isEmpty(uni.__TMPL_IDS__));

      if (uni.$__ASK_SUBSCRIBE_MSG__ && !_isEmpty(uni.__TMPL_IDS__)) {
        uni.$emit("$__ask_request_message__");
      }
    },

    onFabClick() {
      uni.navigateTo({url: PageEnums.smart});
    },
  },
  computed: {
    // 获取按钮位置
    getMenuButtonStyle() {
      const {top, height} = this.menuButton || {};
      return {
        "--ko-menu-top": (top || 0) + "px",
        "--ko-menu-height": (height || 0) + "px",
      };
    },
    // 获取菜单列表
    getMenuList() {
      return _deepCopy(this.gridList)
        .flatMap(item => {
          const role = this.GET_USER_ROLE;

          // 判断是否有单独的字段校验
          const checkField = this.isAdmin || !item.checkField || _get(this.GET_CONFIG_INFO, item.checkField);

          if ((_haveCommonElements(role, item.role) && checkField && !this.isExpired) || item.role.includes("*")) {
            return [item];
          } else {
            return [];
          }
        });
    },

    // 显示过期描述
    showExpiredDesc() {
      return this.isExpired || this.expiredDays <= 30;
    },

    // 获取过期描述
    getExpiredDesc() {
      const day = this.expiredDays;
      if (day <= 30 && day >= 15) {
        return `距离服务到期还剩${day}天，请及时处理！`;
      } else if (day < 15 && day >= 3) {
        return `您的服务即将在${day}天后到期。为了确保业务的连续性，请尽快续期。`;
      } else if (day < 3 && day >= 0) {
        return `您的服务即将到期。请在接下来的${day}天内联系我们或自助续费，以确保服务的无缝延续。`;
      } else if (day < 0) {
        // 当前功能因服务过期无法使用，请检查授权状态
        return `重要提醒：您的服务已过期${Math.abs(day)}天，请尽快自助续费。`;
      } else {
        return "";
      }
    },
  },
  onUnload() {
    uni.$off("$__get_config_info_success__", this.validShopDate);
  },
};
</script>

<template>
  <view class="ko-home" :style="[getMenuButtonStyle]">
    <KoNotice is-custom />

    <MerchantsHeader ref="MHRef" :disabled="disabled" />

    <view class="ko-home__store">
      <button class="ko-home__store--shezhi" @click="onJumpStore" v-if="isBusiness || isAdmin">
        <i class="iconfont icon-shezhi"></i>
      </button>

      <button
        class="ko-home__store--notification"
        @click="onJumpMessage"
        v-if="isPerm('MESSAGE_LIST')"
      >
        <view style="position: relative;">
          <uni-icons
            type="notification-filled"
            size="28"
          />

          <text v-if="false" class="ko-home__store--notification--badge"></text>
        </view>
      </button>
    </view>

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
      您还没有任何权限，请联系管理员给您授权！
    </view>

    <view class="ko-home__expired" v-if="showExpiredDesc" @click.stop="onJumpRenewal">
      {{ getExpiredDesc }}
      <!-- #ifdef MP -->
      <button style="font-size: 14px;" class="ko-link">续费</button>
      <!-- #endif -->
    </view>

    <!-- #ifdef MP -->
    <Movable @click="onFabClick">
      Ai
    </Movable>
    <!-- #endif -->
  </view>
</template>

<style lang="scss" scoped>
.ko-home {
  position: relative;

  &__expired {
    font-size: 12px;
    color: #e43d33;
    text-align: center;
    position: fixed;
    bottom: 10vh;
    left: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__store {
    display: flex;
    align-items: center;
    font-size: 26px;

    &--notification {
      display: flex;
      align-items: center;
      justify-content: center;

      &--badge {
        position: absolute;
        z-index: 99;
        top: 20px;
        right: 0;

        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e43d33;
      }
    }
  }

  // #ifdef MP
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

    &--notification {
      margin-left: 10px;
    }
  }

  // #endif

  // #ifndef MP
  &__store {
    position: fixed;
    top: 50px;
    right: 50px;
    z-index: 88;

    display: flex;
    align-items: center;
    justify-content: space-between;

    &--shezhi {
      order: 2;
    }

    .icon-shezhi {
      font-size: 30px;
      color: #fff;
    }

    &--notification {
      margin-right: 20px;
      order: 1;

      .uni-icons.uniui-notification-filled {
        color: #fff !important;
        font-size: 32px !important;
      }
    }
  }

  // #endif
}

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

}

// #endif
</style>
