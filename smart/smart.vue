<script>
import mixins from "@/mixins/mixins";
import MicBtn from "@/smart/components/MicBtn.vue";

export default {
  name: "AiHelper",
  components: {MicBtn},
  mixins: [mixins],
  data() {
    return {};
  },
  methods: {},
  computed: {
    // 胶囊的样式
    rootStyles() {
      const rect = this.mBRect || {};
      return {
        "--m-top": `${rect.top || 51}px`,
        "--m-height": `${rect.height || 32}px`,
        "--m-right": `${rect.right}px`,
        ...this.styles,
      };
    },
  },
  mounted() {
    this.mBRect = uni.getMenuButtonBoundingClientRect();
  },
};
</script>

<template>
  <view class="ko-ai-helper" :style="[rootStyles]">
    <view class="ko-ai-helper__bg" />

    <view class="ko-ai-helper__wrap">
      <view class="ko-ai-helper__center"></view>

      <view class="ko-ai-helper__footer">
        <view class="ko-ai-helper__operate">
          <button class="ko-ai-helper__btn-def ko-ai-helper__input">
            <uni-icons size="24px" type="paperplane" color="#CCD8D9" />
          </button>

          <view class="ko-ai-helper__mic">
            <MicBtn />
          </view>

          <button class="ko-ai-helper__btn-def ko-ai-helper__close">
            <uni-icons size="24px" type="closeempty" color="#CCD8D9" />
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
// 背景动画
@keyframes WaveHelper {
  0% {
    background-position: 80% 20%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 20% 80%;
  }
}

.ko-ai-helper {
  $gradient-bottom-right: linear-gradient(135deg, #B2CFDBff, #AAC9DCff, rgba(121, 165, 220, 0.9), #A3A5D8ff 86%, #B8ADDBff);
  //$gradient-bottom: linear-gradient(180deg, #8ECCEDff, #B0D5F0ff, #D3D7EEff, #E6D5F1ff, #DFD3F6ff);

  background: $gradient-bottom-right;
  //background-blend-mode: multiply; /* 混合模式 */
  //background-size: 200% 200%;
  //animation: WaveHelper 5s ease-in-out infinite;
  height: 100vh;
  position: relative;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  &__wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  &__center {
    flex: 1;
  }

  &__footer {
    padding: 20px 20px 40px;
  }

  // 底部操作按钮
  &__operate {
    width: 100%;
    position: relative;
  }

  &__btn-def {
    width: 42px;
    height: 42px;
    //background: #1A2728;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    line-height: 1.2;
  }

  &__input {
    left: 0;
  }

  &__close {
    right: 0;
  }

  &__mic {
    --mic-size: 64px;

    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, -60%);
  }

}
</style>
