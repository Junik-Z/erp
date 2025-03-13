<script>
import ZeroMarkdownView from "./zero-markdown-view/zero-markdown-view.vue";
import { EasyTyper } from "../EasyTyper";

export default {
  name: "AiMsg",
  props: {
    item: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  components: {
    ZeroMarkdownView,
  },
  data() {
    return {
      label: "",
      obj: {
        output: "",
        isEnd: false,
        // 打字速度
        speed: 26,
        singleBack: false,
        sleep: 0,
        type: "normal",
        backSpeed: 40,
        sentencePause: false,
      },
    };
  },
  watch: {
    "item.label": {
      handler(to) {
        this.$nextTick(() => {
          if (to) {
            this.initTyper(to);
          }
        });
      },
      immediate: true,
    },

  },
  methods: {
    initTyper(to) {
      this.typerVm = new EasyTyper(this.obj, to, this.completeAsEnd, this.changeOutput);
    },

    completeAsEnd() {
      console.log("输出完毕！长官！");
      this.$emit("complete");
    },

    changeOutput(text) {
      this.label = text;
      this.$emit("change", text);
    },
  },
  created() {
  },
};
</script>

<template>
  <view class="ko-ai-msg">
    <view class="ko-ai-msg__wrap">
      <view class="ko-ai-msg__content">
        <ZeroMarkdownView :markdown="label" />
        <uv-loading-icon v-if="item.loading" />
      </view>
    </view>

    <view class="ko-ai-msg__one"></view>
    <view class="ko-ai-msg__two"></view>
  </view>
</template>

<style scoped lang="scss">
.ko-ai-msg {
  position: relative;
  padding-bottom: 4px;

  &__wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  &__content {
    border-radius: 10px;
    padding: 10px;
    background: #B7E8C0;
    max-width: 80vw;
    margin-left: 22px;
  }

  &__one, &__two {
    position: absolute;
    background: #B7E8C0;
    border-radius: 50%;
  }

  &__one {
    left: 0;
    bottom: 0;
    width: 5px;
    height: 5px;
  }

  &__two {
    left: 10px;
    bottom: 2px;
    width: 10px;
    height: 10px;
  }
}
</style>
