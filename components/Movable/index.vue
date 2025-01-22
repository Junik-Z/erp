<script>
import { getRect } from "@/utils";

export default {
  name: "KoMovable",
  data() {
    return {
      x: uni.getSystemInfoSync()?.screenWidth,
      y: uni.getSystemInfoSync()?.screenHeight - 220,
      isShow: false,
      vm: null,

      old: {
        x: 0,
        y: 0,
      },
    };
  },
  props: {
    // 滑动方向
    direction: {
      type: String,
      default: "all",
    },
    yAxis: {
      type: Number,
      default: 0,
    },
    xAxis: {
      type: Number,
      default: 0,
    },
    content: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  mounted() {
  },
  methods: {
    onChange(e) {
      this.old.x = e.detail.x;
      this.old.y = e.detail.y;
    },
    onTouchend() {
    },
    // 获取位置
    async getLocation() {
      const wrap = await getRect(".ko-movable", this);
      const rect = await getRect(".ko-movable__view--wrapper", this);
      this.x = wrap.width - rect.width + "px";
      this.y = wrap.height - rect.height + this.yAxis + "px";
    },

    onClick(event) {
      this.vm && clearTimeout(this.vm);
      if (this.content.length > 1) {
        this.isShow = !this.isShow;
        this.vm = setTimeout(() => {
          this.isShow = false;
        }, 5000);
      } else {
        this._onItemClick(0, this.content[0] || {}, event);
      }
    },

    _onItemClick(index, item, event) {
      this.isShow = false;
      this.$emit("click", {index, item}, event);
    },
  },
  created() {
    this.y = this.y + this.yAxis;
    this.x = this.x + this.xAxis;
  },
  computed: {
    getRootStyle() {
      return {
        "--ko-movable-count": this.content.length,
      };
    },
  },
};
</script>

<template>
  <movable-area class="ko-movable">
    <movable-view
      class="ko-movable__view"
      :x="x"
      :y="y"
      :direction="direction"
      @change="onChange"
      @touchend="onTouchend"
    >
      <view class="ko-movable__view--wrapper" :style="[getRootStyle]">
        <view
          class="ko-movable__wrap"
          v-if="content.length"
          :class="{'show': isShow}"
        >
          <view class="ko-movable__list">
            <button
              v-for="(item, index) in content"
              :key="index"
              class="ko-movable__list--item"
              @click="_onItemClick(index, item, $event)"
              :open-type="item.openType"
              :data-params="item.params"
            >
              <image
                v-if="item.iconPath"
                :src="item.iconPath"
                class="ko-movable__list--item--image"
                mode="aspectFit"
              />
              <i v-if="item.iconfont" class="iconfont ko-movable__list--item--iconfont" :class="[item.iconfont]"></i>
              <text class="ko-movable__list--item--text">
                {{ item.text }}
              </text>
            </button>
          </view>
        </view>

        <button class="ko-movable__button" :class="{'active': isShow}" @click="onClick">
          <slot>
            <i class="iconfont icon-tianjia"></i>
          </slot>
        </button>
      </view>
    </movable-view>
  </movable-area>
</template>

<style scoped lang="scss">
$uni-shadow-base: 0 1px 5px 2px rgba($color: #000000, $alpha: 0.3) !default;

.ko-movable {
  position: fixed;
  top: 20rpx;
  right: 20rpx;
  bottom: 20rpx;
  left: 20rpx;
  pointer-events: none;
  width: calc(100vw - 40rpx);
  height: calc(100vh - 40rpx);
  z-index: 55;

  &__view {
    width: auto;
    height: auto;
    position: absolute;
    pointer-events: auto;
  }

  &__button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 50px;
    background: #007AFF;
    border-radius: 50%;
    color: #fff;
    box-shadow: 0 1px 5px 2px rgba($color: #000000, $alpha: 0.3);

    .icon-tianjia {
      font-size: 20px;
      font-weight: bold;
      transition: transform .3s;
    }

    &.active {
      .icon-tianjia {
        transform: rotate(135deg);
      }
    }
  }

  &__wrap {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 50px;
    background: #fff;
    border-radius: 50px;
    box-shadow: $uni-shadow-base;
    height: 0;
    overflow: hidden;
    opacity: 0;
    transition: height .3s, opacity .3s, padding .3s;

    &.show {
      padding-top: 20px;
      padding-bottom: 50px;
      height: calc(60px * var(--ko-movable-count) + 50px + 20px);
      opacity: 1;
    }
  }

  &__list {
    &--item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      border-radius: 0;
      height: 60px;
      padding: 2px 10px;

      &--image {
        width: 25px;
        height: 25px;
      }

      &--iconfont {
        font-size: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25px;
        height: 25px;
      }

      &--text {
        font-size: 12px;
        color: #333;
      }
    }
  }

}
</style>
