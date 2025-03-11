<template>
  <view
    :class="[styleType === 'text'?'segmented-control--text' : 'segmented-control--button' ]"
    :style="{ borderColor: styleType === 'text' ? '' : activeColor }"
    class="segmented-control"
  >
    <scroll-view class="ko-segmented-control__scroll" scroll-x style="width: 100%;" :show-scrollbar="false">
      <view class="segmented-control__wrap">
        <view
          v-for="(item, index) in values"
          :class="[styleType === 'text' ? '' : 'segmented-control__item--button',
					index === 0 && styleType === 'button' ? 'segmented-control__item--button--first' : '',
					index === values.length - 1 && styleType === 'button' ? 'segmented-control__item--button--last':'']"
          :key="index"
          :style="{backgroundColor: index === currentIndex && styleType === 'button' ? activeColor : styleType === 'button' ?inActiveColor:'transparent', borderColor: index === currentIndex && styleType === 'text' || styleType === 'button' ? activeColor : inActiveColor}"
          class="segmented-control__item"
          @click="_onClick(index)"
        >
          <view>
            <text
              :style="{color:index === currentIndex? styleType === 'text'? activeColor: '#fff': styleType === 'text'? '#000': activeColor}"
              class="segmented-control__text"
              :class="styleType === 'text' && index === currentIndex ? 'segmented-control__item--text': ''"
            >
              {{ labelKey ? item[labelKey] : item }}
            </text>
          </view>

        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
/**
 * SegmentedControl 分段器
 * @description 用作不同视图的显示
 * @tutorial https://ext.dcloud.net.cn/plugin?id=54
 * @property {Number} current 当前选中的tab索引值，从0计数
 * @property {String} styleType = [button|text] 分段器样式类型
 *  @value button 按钮类型
 *  @value text 文字类型
 * @property {String} activeColor 选中的标签背景色与边框颜色
 * @property {String} inActiveColor 未选中的标签背景色与边框颜色
 * @property {Array} values 选项数组
 * @event {Function} clickItem 组件触发点击事件时触发，e={currentIndex}
 */

export default {
  name: "UniSegmentedControl",
  emits: ["clickItem", "update:current"],
  props: {
    current: {
      type: Number,
      default: 0,
    },
    labelKey: String,
    values: {
      type: [Array, null],
      default() {
        return [];
      },
    },
    activeColor: {
      type: String,
      default: "#2979FF",
    },
    inActiveColor: {
      type: String,
      default: "transparent",
    },
    styleType: {
      type: String,
      default: "button",
    },
    isRouter: Boolean,
  },
  data() {
    return {
      currentIndex: 0,
    };
  },
  watch: {
    current(val) {
      if (val !== this.currentIndex) {
        this.currentIndex = val;
      }
    },
  },
  computed: {},
  created() {
    this.currentIndex = this.current;
  },
  methods: {
    _onClick(index) {
      if (this.currentIndex !== index) {
        this.$emit("update:current", index);

        if (!this.isRouter) {
          this.currentIndex = index;
        }

        this.$emit("clickItem", {
          currentIndex: index,
        });

      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .ko-segmented-control__scroll {
  &::-webkit-scrollbar {
    display: none !important;
  }
}

.segmented-control {
  /* #ifndef APP-NVUE */
  //display: flex;
  box-sizing: border-box;
  /* #endif */

  //flex-direction: row;
  height: 36px;
  overflow: hidden;

  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */

  &__wrap {
    min-width: 100%;
    display: flex;
    height: 36px;
    flex-wrap: nowrap;
  }
}

.segmented-control__item {
  /* #ifndef APP-NVUE */
  display: inline-flex;
  box-sizing: border-box;
  /* #endif */
  position: relative;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0 10px;
}

.segmented-control__item--button {
  border-style: solid;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-right-width: 1px;
  border-left-width: 0;
}

.segmented-control__item--button--first {
  border-left-width: 1px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.segmented-control__item--button--last {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.segmented-control__item--text {
  border-bottom-style: solid;
  border-bottom-width: 2px;
  padding-bottom: 3px;
}

.segmented-control__text {
  font-size: 14px;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}
</style>
