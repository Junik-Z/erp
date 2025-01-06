<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import { getRect } from "@/utils";

export default {
  name: "HistoryBar",
  components: {UniSegmentedControl},
  props: {
    value: [Boolean, Number, String],
    text: {
      type: String,
      default: "列表",
    },
    values: {
      type: Array,
      default() {
        return [];
      },
    },
    isShowSearch: Boolean,
  },
  data() {
    return {
      content: 0,
      wrapHeight: 0,
      inputWrapHeight: 0,
      show: false,
    };
  },
  computed: {
    rootStyle() {
      return {
        "--ko-wrap-height": `${this.wrapHeight || 40}px`,
        "--ko-input-wrap-height": `${this.inputWrapHeight}px`,
      };
    },
  },
  watch: {
    value: {
      handler(val) {
        this.content = +val;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onClick() {
      if (this.values.length > 2) {
        this.$emit("input", this.content);
      } else {
        this.$emit("input", !!this.content);
      }

      this.$emit("change");
    },

    onShowSearch() {
      getRect(".ko-history__input--wrap", this)
        .then(res => {
          this.inputWrapHeight = res.height;
        });

      this.show = !this.show;
    },
  },

  mounted() {
    if (this.isShowSearch) {
      this.$nextTick(() => {
        getRect(".ko-history__wrap", this)
          .then(res => {
            this.wrapHeight = res.height;
          });
      });
    }
  },
};
</script>

<template>
  <view class="ko-history" :style="[rootStyle]" :class="{'is-show': show}">
    <view class="ko-history__wrap">
      <view class="ko-history__tabs ko-basic-box-shadow">
        <UniSegmentedControl
          :current.sync="content"
          :values="values.length ? values : [text, `已完成${text}`]"
          @clickItem="onClick"
          style-type="text"
        />
      </view>

      <view v-if="isShowSearch" class="ko-history__search">
        <button class="ko-basic-button__card" @click.stop="onShowSearch">
          <view style="display: flex; align-items: center;">
            <text style="padding-right: 5px;">搜索</text>
            <i class="iconfont icon-jiantou"></i>
          </view>
        </button>
      </view>
    </view>

    <view class="ko-history__input">
      <view class="ko-history__input--wrap">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-history {
  margin-bottom: 10px;

  // #ifdef H5
  max-width: 1024px;
  margin: 0 auto 10px;
  // #endif

  &__wrap {
    display: flex;
    align-items: center;
  }

  &__tabs {
    flex: 1;
    padding: 2px 20px;
    text-align: center;
    position: relative;
    font-size: 18px;
    font-weight: bold;
    border-radius: 20px;
    margin: 0 20px;
  }

  &__search {
    padding-right: 10px;

    .ko-basic-button__card {
      padding-right: 5px;

      .iconfont {
        transition: all .3s;
      }
    }
  }

  &__input {
    height: 0;
    overflow: hidden;
    transition: height .3s;

    &--wrap {
      padding: 16px 20px 10px;
    }
  }

  &.is-show {
    .ko-basic-button__card {
      padding-right: 5px;

      .iconfont {
        transform: rotate(-180deg);
      }
    }

    .ko-history__input {
      height: var(--ko-input-wrap-height);
    }
  }
}
</style>
