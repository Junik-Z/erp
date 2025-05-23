<script>
import UvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue";

export default {
  name: "BasicPopup",
  components: {UvPopup},
  props: {
    type: {
      type: String,
      default: "center",
    },
    visible: Boolean,
    close: {
      type: Boolean,
      default: true,
    },
    title: String,
    maxHeight: String,

    noFooterPadding: Boolean,
    noFooter: Boolean,
    noSafeBottom: Boolean,

    // 层级
    zIndex: {
      type: [String, Number],
      // #ifdef H5
      default: 997,
      // #endif
      // #ifndef H5
      default: 10075,
      // #endif
    },

    noPaddingTop: Boolean,
  },
  data() {
    return {};
  },
  watch: {
    visible: {
      handler(val) {
        this.$nextTick(() => {
          if (val) this.$refs.PopupRef.open();
          else this.$refs.PopupRef.close();
        });
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    onChange(event) {
      this.$emit("update:visible", event.show);
      if (!event.show) {
        this.$emit("close", false);
      }
    },
    onClose() {
      this.$refs.PopupRef.close();
    },
  },
};
</script>

<template>
  <UvPopup
    :mode="type"
    ref="PopupRef"
    @change="onChange"
    :close-on-click-overlay="false"
    :safe-area-inset-bottom="false"
    :round="10"
    bg-color="transparent"
    :adjustPosition="false"
    :z-index="zIndex"
  >
    <view
      class="ko-basic-popup"
      :style="[maxHeight ? {'max-height': maxHeight} : {}]"
      :class="[type, {
        close: close,
         'show-title': !!title,
          'no-safe-bottom': noSafeBottom,
           'show-footer': $slots.footer && !noFooter,
           'hide-footer': !($slots.footer && !noFooter),
           'no-padding-top': noPaddingTop
      }]"
    >
      <button
        v-if="close"
        class="ko-basic-popup__close"
        @click="onClose"
      >
        <i class="iconfont icon-guanbi" />
      </button>

      <view class="ko-basic-popup__header" v-if="!!title">{{ title }}</view>

      <view class="ko-basic-popup__wrap">
        <slot></slot>
      </view>

      <view
        class="ko-basic-popup__footer"
        :class="{'no-padding': noFooterPadding}"
        v-if="$slots.footer && !noFooter"
      >
        <slot name="footer"></slot>
      </view>
    </view>

    <view class="ko-basic-popup__hint">
      <slot name="hint"></slot>
    </view>
  </UvPopup>
</template>

<style scoped lang="scss">
.ko-basic-popup {
  position: relative;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  max-height: calc(var(--ko-popup-max-height, 98vh));

  // #ifdef H5
  margin: 0 auto;
  // #endif

  &.close {
    padding-top: 50px;
  }

  &.show-title {
    padding-top: 0;
  }

  &.bottom {
    &.show-footer .ko-basic-popup__footer {
      padding-bottom: calc(env(safe-area-inset-bottom) + 0px);
    }

    &.hide-footer {
      padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
    }
  }

  &.no-safe-bottom.hide-footer {
    padding-bottom: 0;
  }

  &.no-padding-top {
    padding-top: 0;
  }

  &__header {
    height: 50px;
    font-size: 18px;
    font-weight: bold;
    padding: 15px 0;
    text-align: center;
    box-shadow: $uni-shadow-base;
    margin-bottom: 8px;
  }

  &__wrap {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 10px;
  }

  &__close {
    position: absolute;
    right: 10px;
    top: 8px;
    width: 36px;

    line-height: 1.4;

    .iconfont {
      font-size: 26px;
    }
  }

  &__footer {
    box-shadow: $uni-shadow-base;
    padding-top: 16px;
    padding-bottom: 20px;

    // #ifdef H5
    &.no-padding {
      padding-bottom: 0;
    }

    // #endif
  }
}
</style>
