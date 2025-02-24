<script>
import { _deepCopy, _get, _groupBy, _isEqual, _round, _sum, getRect } from "@/utils";
import { getRandomColor } from "@/produce/pages/calculate";

const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth - 26;

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
    residue: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  watch: {
    // 数据变化触发
    watchData: {
      handler() {
        this.handleList();
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      WinWidth: screenWidth,

      // 已经加载的颜色
      colors: [],

      // 统计
      count: [],
      // 渲染
      list: [],
      allEdgeLength: 0,
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
          this.WinWidth = (res?.width ? res?.width - 26 : screenWidth) || screenWidth;
        });

    },

    onClose() {
      this.$emit("close");
    },

    // 处理要显示的元素信息
    handleList() {
      const precision = 6;
      this.colors = [];

      // 计算后的数据
      const data = _deepCopy(this.data) || [];
      // 机械设置
      const {drillWidth, edgeWidth} = _deepCopy(this.form) || {};
      // 所有材料
      const rectangles = _deepCopy(this.rectangles);
      // 视图宽度
      const winWidth = _deepCopy(this.getWinWidth);

      // 板材
      this.list = data.map(board => {
        const scale = _round(winWidth / board.width, 2);

        // 要渲宽高
        const rWidth = _round(board.width * scale, precision);
        const rHeight = _round(board.height * scale, precision);
        // 处理材料
        const rItems = this.handleItems(_deepCopy(board.items), rectangles, scale, precision, drillWidth);
        // 获取板材下的第一块材料的信息
        const sItem = rectangles.find(v => _isEqual(v.rid, _get(board, "items.0.rid")));

        return {
          ...board,
          rGroup: `${board.width - drillWidth}×${board.height - drillWidth}×${board.weight || sItem.weight || ""} (${board.color || sItem.color || ""})`,
          rEdgeLength: _sum(rItems.map(v => v.edgeLength)),
          rHeight,
          rWidth,
          sWidth: (board.width - drillWidth),
          sHeight: (board.height - drillWidth),
          scale,
          rItems,
        };
      });

      // 按板材分组
      const group = _groupBy(_deepCopy(this.list), (item) => item.rGroup);

      this.count = [];
      this.allEdgeLength = 0;

      for (const key in group) {
        const item = group[key];

        const obj = {
          norm: key,
          count: item.length,
          edgeLength: _sum(item.map(v => v.rEdgeLength)) / 100,
        };

        this.allEdgeLength += obj.edgeLength;

        this.count.push(obj);
      }
    },

    // 处理材料
    handleItems(items, list, scale, precision, drillWidth) {
      const gColor = () => {
        let color = getRandomColor();
        if (this.colors.includes(color)) {
          color = gColor();
        }

        this.colors.push(color);
        return color;
      };
      return items?.map(item => {
        // 材料初始设置的信息
        const node = list.find(v => _isEqual(v.rid, item.rid)) || {};

        const [sWidth, sHeight] = node.rotate ? [node.height, node.width] : [node.width, node.height];

        let edgeLength = 0;

        // 计算封边
        ;(node.edges || [])
          .forEach((edge, index) => {
            if (edge) {
              // 封边的左右前背
              const w = [node.height, node.height, node.width, node.width][index];
              const len = (w) + drillWidth + 6;
              edgeLength += len;
            }
          });


        return {
          name: node.name,
          rid: item.rid,
          rWidth: _round(item.width * scale, precision),
          rHeight: _round(item.height * scale, precision),
          rX: _round(item.x * scale, precision),
          rY: _round(item.y * scale, precision),
          rDrillWidth: (drillWidth / 2) * scale,
          rRadius: node.radius ? node.radius.map((v, i) => {
            const value = v * scale + "px";
            const t = _get(node, `angleType.${i}`);
            return t ? 0 : value;
          }).join(" ") : 0,
          rStraight: node.straight ? node.straight.map(v => v.map(x => x * scale + "px")) : [[0, 0], [0, 0], [0, 0], [0, 0]],
          sWidth,
          sHeight,
          sWeight: node.weight,
          sColor: gColor(),
          edgeLength,
          node,
        };
      }) || [];
    },
  },
  computed: {
    // 监听数据改变
    watchData() {
      return [this.getWinWidth, ...this.data];
    },
    // 获取视图宽度
    getWinWidth() {
      return this.WinWidth || this.winWidth || (screenWidth);
    },

    // 获取容器的样式
    getBoardStyle() {
      return (board) => {
        return {
          width: board.rWidth + "px",
          height: board.rHeight + "px",
          transformOrigin: `0 0`,
        };
      };
    },

    // 处理子元素的样式
    getVItemStyle() {
      return (item) => {
        return {
          width: item.rWidth + "px",
          height: item.rHeight + "px",
          background: `radial-gradient(#eeeeee -30%, ${item.sColor} 100%)`,
          transform: `translate(${item.rX}px, ${item.rY}px)`,
          border: `${item.rDrillWidth}px solid #000`,
          color: "#1f3ba0",
          borderRadius: item.rRadius,
        };
      };
    },

    // 获取圆角类型
    getAngleStyle() {
      return (item, index) => {
        const A = _get(item, `node.angleType.${index}`);
        const S = item.rStraight?.[index];

        return {
          "--angle-border-size": item.rDrillWidth + "px",
          width: A ? S[0] : 0,
          height: A ? S[1] : 0,
          opacity: A,
        };
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
      <view class="ko-composing__count">
        <uni-row :gutter="10" v-if="true">
          <block v-for="(item, index) of count" :key="index">
            <uni-col :span="16">
              <label class="ko-basic-label">规格：</label>
              <text>{{ item.norm }}</text>
            </uni-col>
            <uni-col :span="8">
              <label class="ko-basic-label">共计：</label>
              <text>{{ item.count }}</text>
            </uni-col>
          </block>

          <uni-col :span="16">
            <label class="ko-basic-label">封边：</label>
            <text>{{ allEdgeLength }}m</text>
          </uni-col>
        </uni-row>
      </view>

      <view class="ko-composing__no-data" v-if="!list.length">
        未生成任何结果，请确认数据是否正确。
      </view>

      <!-- 计算结果 -->
      <view class="ko-composing__wrap" v-for="(board, index) of list" :key="index">
        <scroll-view
          scroll-x="true"
          class="ko-composing__scroll"
        >
          <view class="ko-composing__scroll--center">
            <view class="ko-composing__width">{{ board.sWidth }}</view>
            <view class="ko-composing__height">{{ board.sHeight }}</view>

            <view
              class="ko-composing__box"
              :style="[getBoardStyle(board)]"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              :data-params="board"
            >
              <view
                class="ko-composing__item"
                v-for="(item, rIndex) of board.rItems"
                :key="item.rid"
                :style="[getVItemStyle(item)]"
              >

                <view
                  class="ko-composing__item--info"
                  :style="{transform: `rotate(${item.sWidth < item.sHeight ? '90' : 0}deg)`}"
                >
                  <view>{{ item.name }}</view>
                  <view style="line-height: 1.1;">{{ `${index} - ${rIndex}` }}</view>
                  <view>
                    {{ `(${item.sWidth}x${item.sHeight}x${item.sWeight})` }}
                  </view>
                </view>

                <block>
                  <view class="ko-composing__item--angle LT" @click.stop="onAngle('angle', item)"></view>
                  <view class="ko-composing__item--angle RT" @click.stop="onAngle('angle', item)"></view>
                  <view class="ko-composing__item--angle LB" @click.stop="onAngle('angle', item)"></view>
                  <view class="ko-composing__item--angle RB" @click.stop="onAngle('angle', item)"></view>
                </block>

                <!-- 圆角 -->
                <block>
                  <view class="ko-composing__angle LT" :style="[getAngleStyle(item, 0)]"></view>
                  <view class="ko-composing__angle RT" :style="[getAngleStyle(item, 1)]"></view>
                  <view class="ko-composing__angle LB" :style="[getAngleStyle(item, 2)]"></view>
                  <view class="ko-composing__angle RB" :style="[getAngleStyle(item, 3)]"></view>
                </block>
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
  // #ifdef H5
  width: 100%;
  // #endif

  height: 100%;
  position: relative;
  //padding-top: 40px;

  // #ifndef H5
  width: 100vw;
  // #endif

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
      text-align: center;
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

  &__count {
    padding: 50px 10px 10px;
    font-size: 14px;
  }

  &__angle {
    position: absolute;
    background: #fff;

    &.LT {
      border: var(--angle-border-size) solid #000;
      top: calc(0px - var(--angle-border-size));
      left: calc(0px - var(--angle-border-size));
      border-top: none;
      border-left: none;
    }

    &.RT {
      border: var(--angle-border-size) solid #000;
      top: calc(0px - var(--angle-border-size));
      right: calc(0px - var(--angle-border-size));
      border-top: none;
      border-right: none;
    }

    &.LB {
      border: var(--angle-border-size) solid #000;
      bottom: calc(0px - var(--angle-border-size));
      right: calc(0px - var(--angle-border-size));
      border-bottom: none;
      border-right: none;
    }

    &.RB {
      border: var(--angle-border-size) solid #000;
      bottom: calc(0px - var(--angle-border-size));
      left: calc(0px - var(--angle-border-size));
      border-bottom: none;
      border-left: none;
    }
  }
}
</style>
