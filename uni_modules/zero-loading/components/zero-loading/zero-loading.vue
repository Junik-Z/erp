<template>
  <!--  -->
  <view
    :style="{ position: position, 'z-index': zIndex, '--opacity': maskOpacity }"
    class="container"
    :class="[
      mask ? 'mask' : '',
      maskMini ? 'mask-mini' : '',
      (mask || maskMini) && maskDark ? 'mask-dark' : '',
    ]"
    @click.prevent="handleClick"
  >
    <view>
      <view class="main">
        <loading9 v-if="type == 'gear'"></loading9>
      </view>
      <view
        class="tips"
        v-if="showText"
        :style="{ color: textColor, fontSize: textSize, marginTop: textGap }"
      >
        {{ text }}
      </view>
    </view>
  </view>
</template>

<script>

import loading9 from "./static/loading-gear.vue";

export default {
  name: "zero-loading",
  components: {
    loading9,
  },
  props: {
    type: {
      type: String,
      default: "atom",
    },
    position: {
      type: String,
      default: "fixed",
    },
    zIndex: {
      type: Number,
      default: 9,
    },
    mask: {
      type: Boolean,
      default: false,
    },
    maskOpacity: {
      type: Number,
      default: 0.1,
    },
    maskMini: {
      type: Boolean,
      default: false,
    },
    maskDark: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: "#0396FF",
    },
    showText: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: "加载中...",
    },
    textSize: {
      type: String,
      default: "28rpx",
    },
    textColor: {
      type: String,
      default: "#333333",
    },
    textGap: {
      type: String,
      default: "40rpx",
    },
  },
  data() {
    return {};
  },
  methods: {
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -70%);

  display: flex;
  align-items: center;
  justify-content: center;
}

.tips {
  //   margin-top: 40rpx;
  text-align: center;
}

.mask {
  z-index: 999 !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(255, 255, 255, var(--opacity));
  transform: translate(0, 0);
}

.mask-mini {
  height: 300rpx;
  width: 300rpx;
  border-radius: 20rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.mask-dark {
  background: rgba(7, 17, 27, var(--opacity));
}
</style>
