<script>

import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { isFunction } from "@/components/da-tree-vue2/utils";

export default {
  name: "IndexList",
  components: {
    BasicCard,
    UniSection,
    RenderDom: {
      name: "RenderDom",
      props: {
        cell: Object,
        render: Function,
        index: Number,
      },
      render(h) {
        const params = {cell: this.cell, index: this.index};
        return this.render(h, params);
      },
    },
  },
  props: {
    options: {
      type: Array,
      default() {
        return [];
      },
    },
    renderFunc: Function,
    filterFunc: Function,
  },
  watch: {
    options: {
      handler() {
        this.setList();
      },
      deep: true,
    },
  },
  data() {
    return {
      scrollViewId: "",
      lists: [],
      winHeight: 0,
      itemHeight: 0,
      winOffsetY: 0,
      touchmove: false,
      touchmoveIndex: -1,
      touchmovable: true,
      loaded: false,
    };
  },
  mounted() {
    // #ifdef H5
    this.isPC = this.IsPC();
    // #endif
    setTimeout(() => {
      this.setList();
    }, 50);
    setTimeout(() => {
      this.loaded = true;
    }, 300);
  },
  methods: {
    setList() {
      let index = 0;
      this.lists = [];
      this.options.forEach((value, index) => {
        if (value.data.length === 0) {
          return;
        }
        let indexBefore = index;
        let items = value.data.map(item => {
          let obj = {};
          obj["key"] = value.letter;
          obj["node"] = item;
          obj["itemIndex"] = index;
          index++;
          obj.checked = item.checked ? item.checked : false;
          return obj;
        });
        this.lists.push({
          title: value.letter,
          key: value.letter,
          items: items,
          itemIndex: indexBefore,
        });
      });
      uni.createSelectorQuery()
        .in(this)
        .select("#list")
        .boundingClientRect()
        .exec(ret => {
          this.winOffsetY = ret[0].top;
          this.winHeight = ret[0].height;
          this.itemHeight = this.winHeight / this.lists.length;
        });

      console.log(this.renderFunc);
    },

    touchStart(e) {
      this.touchmove = true;
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
    },
    touchMove(e) {
      // #ifndef APP-PLUS
      let pageY = this.isPC ? e.pageY : e.touches[0].pageY;
      let index = Math.floor((pageY - this.winOffsetY) / this.itemHeight);
      if (this.touchmoveIndex === index) {
        return false;
      }
      let item = this.lists[index];
      if (item) {
        this.scrollViewId = "ko-index-list-" + index;
        this.touchmoveIndex = index;
      }
      // #endif

      // #ifdef APP-PLUS
      throttleTouchMove.call(this, e);
      // #endif
    },
    touchEnd() {
      this.touchmove = false;
      // this.touchmoveIndex = -1
    },

    /**
     * 兼容 PC
     */

    mousedown(e) {
      if (!this.isPC) return;
      this.touchStart(e);
    },
    mousemove(e) {
      if (!this.isPC) return;
      this.touchMove(e);
    },
    mouseleave(e) {
      if (!this.isPC) return;
      this.touchEnd(e);
    },

    // #ifdef H5
    IsPC() {
      const userAgentInfo = navigator.userAgent;
      const Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
      let flag = true;
      for (let v = 0; v < Agents.length - 1; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    // #endif


    onClick(e) {
      let {idx, index} = e;
      let obj = {};
      for (let key in this.lists[idx].items[index]) {
        obj[key] = this.lists[idx].items[index][key];
      }
      let select = [];
      if (this.showSelect) {
        this.lists[idx].items[index].checked = !this.lists[idx].items[index].checked;
        this.lists.forEach((value, idx) => {
          value.items.forEach((item, index) => {
            if (item.checked) {
              let obj = {};
              for (let key in this.lists[idx].items[index]) {
                obj[key] = this.lists[idx].items[index][key];
              }
              select.push(obj);
            }
          });
        });
      }
      this.$emit("click", {
        item: obj,
        select: select,
      });
    },
  },
  computed: {
    filterItem() {
      return (node) => isFunction(this?.filterFunc) ? this.filterFunc(node) : true;
    },
  },
};
</script>

<template>
  <view class="ko-index-list" ref="ListRef" id="list">
    <scroll-view :scroll-into-view="scrollViewId" class="ko-index-list__scroll" scroll-y>
      <view v-for="(list, idx) in lists" :key="idx" :id="'ko-index-list-' + idx">
        <UniSection :title="list.key" type="line">
          <view class="ko-index-list__item" v-for="(child, index) in list.items" :key="index" v-if="filterItem(child)">
            <text v-if="!renderFunc">{{ child.node.label }}</text>
            <RenderDom v-if="renderFunc" :render="renderFunc" :cell="child" :index="index" />
          </view>
        </UniSection>
      </view>
    </scroll-view>
    <view
      class="ko-index-list__menu"
      @touchstart="touchStart"
      @touchmove.stop.prevent="touchMove"
      @touchend="touchEnd"
      @mousedown.stop="mousedown"
      @mousemove.stop.prevent="mousemove"
      @mouseleave.stop="mouseleave"
    >
      <view
        v-for="(list, key) in lists"
        :key="key"
        class="ko-index-list__menu-item"
        :class="touchmoveIndex === key ? 'ko-index-list__menu--active' : ''"
      >
        <text
          class="ko-index-list__menu-text"
          :class="touchmoveIndex === key ? 'ko-index-list__menu-text--active' : ''"
        >
          {{ list.key }}
        </text>
      </view>
    </view>
    <view v-if="touchmove" class="ko-index-list__alert-wrapper">
      <text class="ko-index-list__alert">{{ lists[touchmoveIndex].key }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-index-list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;

  &__scroll {
    flex: 1;
  }

  &__menu {
    width: 24px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: column;
  }

  &__menu-item {
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex: 1;
    align-items: center;
    justify-content: center;
    /* #ifdef H5 */
    cursor: pointer;
    /* #endif */
  }

  &__menu-text {
    font-size: 12px;
    text-align: center;
    color: #aaa;
  }

  &__menu--active {
    // background-color: rgb(200, 200, 200);
  }

  &__menu-text--active {
    border-radius: 16px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    background-color: #007aff;
    color: #fff;
  }

  &__alert-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  &__alert {
    width: 80px;
    height: 80px;
    border-radius: 80px;
    text-align: center;
    line-height: 80px;
    font-size: 35px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__item {
    padding: 10px 16px 10px 26px;
    border-bottom: 0.5px solid #c7c9ce;

    font-size: 14px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
