<script>

import mixins from "@/mixins/mixins";

export default {
  name: "Recommend",
  mixins: [mixins],
  data() {
    return {};
  },
  props: {
    value: [Number, String],
    options: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    onRecommend(item) {
      this.$emit("input", item.value);

      this.$emit("change", item);
    },
  },
};
</script>

<template>
  <scroll-view
    scroll-x="true"
    scroll-with-animation="true"
    :show-scrollbar="false"
    style="width: 100%;"
    class="ko-recommend"
  >
    <view class="ko-recommend__wrap">
      <view
        class="ko-recommend__cell"
        v-for="(item, index) of options"
        :key="index"
        :class="{active: isEqual(item.value, value)}"

        @click.stop="onRecommend(item)"
      >
        <view class="ko-recommend__cell--bg">
          <view class="ko-recommend__cell--bg-left"></view>
        </view>

        <view class="ko-recommend__item">
          <uv-image
            :src="item.image"
            width="36px"
            height="36px"
            shape="square"
            custom-style="margin-bottom: 2px;"
          />
          <text class="ko-recommend__item--text">
            {{ item.label }}
          </text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
// 底部凹型大小
$--concave-size: 30px;
$--concave-pos: -16px;
$--concave-active-color: #fff;

.ko-recommend {
  width: 100%;

  &__wrap {
    display: flex;
  }

  &__cell {
    flex-shrink: 0;
    padding: 0 26px 10px;
    position: relative;

    // 底部凹型
    &::before, &::after {
      content: "";
      position: absolute;
      width: $--concave-size;
      height: $--concave-size;
      bottom: 0;
      transition: background-color .3s;
    }

    &::before {
      left: $--concave-pos;
    }

    &::after {
      right: $--concave-pos;
    }

    &--bg {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 0;
      transform: perspective(25px) rotateX(14deg);
      transform-origin: bottom;
      background: transparent;
      border-radius: 10px 10px 0 0;
      transition: background-color .3s;

      &-left {
        transition: background-color .3s;
        background: transparent;
        position: absolute;
        top: 0;
        left: -40px;
        bottom: 0;
        width: 60px;
      }
    }

    &.active {
      &::before {
        background: radial-gradient(circle at 0 0, transparent $--concave-size, $--concave-active-color $--concave-size + 1);
      }

      &::after {
        background: radial-gradient(circle at 100% 0, transparent $--concave-size, $--concave-active-color $--concave-size + 1);
      }

      .ko-recommend__cell--bg {
        background: $--concave-active-color;
      }

      .ko-recommend__item--text {
        color: #fff;
        background: #BDAA7A;
      }
    }

    &:first-child {
      &.active .ko-recommend__cell--bg-left {
        background: $--concave-active-color;
      }
    }
  }

  &__item {
    position: relative;
    z-index: 9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &--text {
      font-size: 11px;
      transition: color .3s, background-color .3s;
      border-radius: 10px;
      padding: 2px 8px;
    }
  }
}
</style>
