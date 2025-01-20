<script>
import { _deepCopy, _flattenDeep, _get, _isEqual, _round, getRect } from "@/utils";
import { getRandomColor } from "@/produce/pages/calculate";

const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;

export default {
  name: "Composing",
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    rectangles: {
      type: Array,
      default() {
        return [];
      },
    },
    form: {
      type: Object,
      default() {
        return {};
      },
    },

    winWidth: Number,
  },
  watch: {
    data: {
      handler() {
        this.getWidth();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      WinWidth: screenWidth,
    };
  },
  methods: {
    // 手指触摸开始
    onTouchStart(e) {
      if (e) return false;
      if (e.touches.length === 2) { // 检测两指操作
        const x1 = e.touches[0].pageX;
        const y1 = e.touches[0].pageY;
        const x2 = e.touches[1].pageX;
        const y2 = e.touches[1].pageY;

        const p = _get(e, "currentTarget.dataset.params");
        this.initialDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        this.initialScale = _deepCopy(p.scale);
      }
    },
    // 手指移动
    onTouchMove(e) {
      if (e) return false;
      if (e.touches.length === 2) { // 检测两指操作
        const x1 = e.touches[0].pageX;
        const y1 = e.touches[0].pageY;
        const x2 = e.touches[1].pageX;
        const y2 = e.touches[1].pageY;
        const newDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // 计算当前间距
        const scale = (newDistance / this.initialDistance) * this.initialScale;

        const p = _get(e, "currentTarget.dataset.params");

        const index = this.vessel.findIndex(v => _isEqual(v.rid, p.rid));

        this.$set(this.vessel[index], "scale", Math.max(0.2, Math.min(3, scale)));
      }
    },
    // 手指离开
    onTouchEnd(e) {
      if (e.touches.length === 0) {
        // 可以在此记录最终缩放值，或处理其他逻辑
      }
    },

    onAngle() {
    },

    // 获取宽度
    getWidth() {
      getRect(".ko-composing", this)
        .then(res => {
          this.WinWidth = res?.width || screenWidth;
        });
    },

    onClose() {
      this.$emit("close");
    },
  },
  computed: {
    // 获取容器的样式
    getVesselStyle() {
      return (vss) => {
        const scale = (_round(vss.scale, 2) || _round(this.winWidth / vss.width, 2)) ?? 1;

        return {
          height: (vss.height + 2) * scale + "px",
          width: (vss.width + 2) * scale + "px",
          transformOrigin: `0 0`,
        };
      };
    },

    // 获取所有的子级
    getVChildList() {
      return (node) => {
        return node.items;
      };
    },

    // 处理子元素的样式
    getVItemStyle() {
      return (item, vss) => {
        const gColor = () => {
          const color = getRandomColor();
          if (_flattenDeep(this.data.map(v => v.items)).some(v => _isEqual(v.color, color))) {
            return gColor();
          }
          return color;
        };

        const {drillWidth} = _deepCopy(this.form) || {drillWidth: 0};
        const bSize = (drillWidth || 0) / 2;
        const scale = vss.scale ?? 1;
        return {
          width: (item.width + (drillWidth || 0)) * scale + "px",
          height: (item.height + (drillWidth || 0)) * scale + "px",
          background: `radial-gradient(#eeeeee -30%, ${gColor()} 100%)`,
          transform: `translate(${item.x * scale}px, ${item.y * scale}px) rotate(${item.rotation || 0}deg)`,
          border: `${bSize * scale}px solid #000`,
          color: "#1f3ba0",
          borderRadius: item.radius ? item.radius.map(v => v * scale + "px").join(" ") : 0,
        };
      };
    },

    // 获取处理后的数据
    getDataList() {
      return _deepCopy(this.data).map(v => {
        return {
          scale: _round(((this.winWidth || this.WinWidth) - 6) / v.width, 2),
          ...v,
        };
      });
    },

    getRectanglesItem() {
      return (item) => {
        const node = this.rectangles.find(v => _isEqual(v.rid, item.rid));
        return node || {};
      };
    },
  },
  mounted() {
    setTimeout(() => {
      this.getWidth();
    }, 30);
  },
};
</script>

<template>
  <view class="ko-composing">
    <button
      class="ko-composing__close ko-basic-box-shadow"
      @click="onClose"
    >
      <i class="iconfont icon-cha"></i>
    </button>

    <scroll-view scroll-y="true" class="ko-composing__content">

      <view class="ko-composing__no-data" v-if="!getDataList.length">
        未生成任何结果，请确认数据是否正确。
      </view>

      <!-- 计算结果 -->
      <view class="ko-composing__wrap" v-for="(vss, index) of getDataList" :key="index">
        <scroll-view
          scroll-x="true"
          class="ko-composing__scroll"
        >
          <view class="ko-composing__scroll--center">
            <view class="ko-composing__width">{{ vss.width }}</view>
            <view class="ko-composing__height">{{ vss.height }}</view>

            <view
              class="ko-composing__box"
              :style="[getVesselStyle(vss)]"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              :data-params="vss"
            >
              <view
                class="ko-composing__item"
                v-for="(item) of getVChildList(vss)"
                :key="item.rid"
                :style="[getVItemStyle(item, vss)]"
              >
                <view
                  class="ko-composing__item--info"
                  :style="{transform: `rotate(${item.width < item.height ? '90' : 0}deg)`}"
                >
                  {{ `(${item.width}x${item.height}x${getRectanglesItem(item).weight || 0})` }}
                </view>
                <view class="ko-composing__item--angle LT" @click.stop="onAngle('angle', item)"></view>
                <view class="ko-composing__item--angle RT" @click.stop="onAngle('angle', item)"></view>
                <view class="ko-composing__item--angle LB" @click.stop="onAngle('angle', item)"></view>
                <view class="ko-composing__item--angle RB" @click.stop="onAngle('angle', item)"></view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.ko-composing {
  height: 100%;
  width: 100vw;
  position: relative;
  padding-top: 30px;

  &__close {
    position: absolute;
    top: 10px;
    right: 16px;
    z-index: 99;
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #fff;
  }

  &__scroll {
    &--center {
      padding-bottom: 10px;
      padding-top: 16px;
    }
  }

  &__content {
    height: 100%;
    overflow: hidden;
    padding: 10px;
    padding-right: 0;
    margin-right: 10px;
  }

  &__wrap {
    margin-bottom: 10px;
  }

  &__box {
    border: 1px solid #c7c9ce;
    position: relative;
  }

  &__item {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    color: #333; /* 默认颜色 */
    //filter: invert(1) brightness(1.5);

    &--angle {
      position: absolute;
      //background: #ccc;
      z-index: 9;
      width: 20px;
      height: 20px;

      &.LT {
        top: calc(var(--blade-width) / 2 - var(--blade-width));
        left: calc(var(--blade-width) / 2 - var(--blade-width));
      }

      &.LB {
        bottom: calc(var(--blade-width) / 2 - var(--blade-width));
        left: calc(var(--blade-width) / 2 - var(--blade-width));
      }

      &.RT {
        top: calc(var(--blade-width) / 2 - var(--blade-width));
        right: calc(var(--blade-width) / 2 - var(--blade-width));
      }

      &.RB {
        bottom: calc(var(--blade-width) / 2 - var(--blade-width));
        right: calc(var(--blade-width) / 2 - var(--blade-width));
      }
    }

    &--info {
      font-size: 10px;
    }
  }

  &__width {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    font-size: 12px;
    color: #333;
    text-align: center;
    z-index: 9;
  }

  &__height {
    position: absolute;
    font-size: 12px;
    color: #333;
    right: 10px;
    top: 50%;
    text-align: center;
    z-index: 9;
    transform: rotate(90deg) translateY(-50%);
  }

  &__no-data {
    padding: 50px 20px 50px 10px;
    color: #c7c9ce;
    text-align: center;
  }
}
</style>
