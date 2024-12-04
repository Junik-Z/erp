<script>
import UniGrid from "@/uni_modules/uni-grid/components/uni-grid/uni-grid.vue";
import UniGridItem from "@/uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.vue";
import { _deepCopy, _get, _haveCommonElements } from "@/utils";
import UniDataCheckbox from "@/uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.vue";

import mixins from "@/mixins/mixins";
import { CONFIG, MENU_LIST } from "@/utils/config";

export default {
  components: {UniGridItem, UniGrid, UniDataCheckbox},
  mixins: [mixins],
  data() {
    return {
      gridList: MENU_LIST,
      // #ifdef MP
      menuButton: uni.getMenuButtonBoundingClientRect(),
      // #endif
    };
  },
  onLoad() {
    console.log("首页权限", this.getRole, this.GET_USER_INFO);
  },
  computed: {
    CONFIG() {
      return CONFIG;
    },
    getMenuButtonStyle() {
      const {top, height} = this.menuButton || {};
      return {
        "--ko-menu-top": (top || 0) + "px",
        "--ko-menu-height": (height || 0) + "px",
      };
    },
    getRole() {
      return _get(this.GET_USER_INFO, "role") || [];
    },
    getMenuList() {
      return _deepCopy(this.gridList)
        .flatMap(item => {
          const role = this.GET_USER_INFO?.role || this.getRole;

          if (_haveCommonElements(role, item.role)) {
            return [item];
          } else {
            return [];
          }
        });
    },
    getRemark() {
      return this.GET_CONFIG_INFO?.remark || "";
    },
  },
  // #ifdef H5
  watch: {
    getRemark: {
      handler() {
        document.title = `${this.getRemark} —— ${CONFIG.TITLE}`;
      },
      immediate: true,
      deep: true,
    },
  },
  // #endif
  methods: {
    onChange(event) {
      const obj = this.getMenuList[event.detail.index];
      if (!obj.value) {
        uni.showToast({
          icon: "none",
          title: "功能正在开发中，尽情期待。",
        });
        return false;
      }
      uni.navigateTo({url: obj.value});
    },
  },
};
</script>

<template>
  <view class="ko-home" :style="[getMenuButtonStyle]">
    <view class="ko-home__header">
      <view class="ko-home__header--title">{{ getRemark }}</view>

      <view class="ko-home__title">
        {{ CONFIG.TITLE }}
      </view>
    </view>

    <!-- #ifdef H5 -->
    <!-- #endif -->

    <!-- #ifdef MP -->
    <UniGrid :column="3" :show-border="false" @change="onChange" @click.stop="() => {}" :key="key">
      <UniGridItem v-for="(item, index) of getMenuList" :key="item.value" :index="index">
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <div class="ko-home__wrap">
          <div class="ko-home__content">
            <button
              v-for="(item, index) of getMenuList"
              :key="item.value"
              class="ko-home__item--button"
              @click.stop="onChange({detail: {index}})"
            >
              <!-- #endif -->
              <view class="ko-home__item">
                <i :class="['iconfont', item.icon]"></i>
                <text>{{ item.label }}</text>
              </view>
              <!-- #ifdef H5 -->
            </button>
          </div>
        </div>
        <!-- #endif -->

        <!-- #ifdef MP -->
      </UniGridItem>
    </UniGrid>
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

  &__header {
    &--title {
      font-size: 28px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 16px;
    }
  }

  &__title {
    font-size: 16px;
    color: #8f939c;
    text-align: center;
    margin-bottom: 50px;
  }

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

  /deep/ uni-grid-item {
    .iconfont.icon-kucuntongjifenxi {
      margin-left: 20px;
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


      &:nth-child(1) {
        .iconfont {
          margin-left: 30px;
        }
      }
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
