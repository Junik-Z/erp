<script>
import mixins from "@/mixins/mixins";
import MicBtn from "@/smart/components/MicBtn.vue";

export default {
  name: "AiHelper",
  components: {MicBtn},
  mixins: [mixins],
  data() {
    return {
      // 操作类型 0: 语音模式; 1: 输入模式; 2: 关闭
      OType: 0,
    };
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
      <view class="ko-ai-helper__center">
        <image
          class="ko-ai-helper__logo"
          src="./static/images/202506181614.png"
          alt=""
          mode="widthFix"
        />
      </view>

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
  //$gradient-bottom-right: linear-gradient(135deg, #B2CFDBff, #AAC9DCff, rgba(121, 165, 220, 0.9), #A3A5D8ff 86%, #B8ADDBff);
  //$gradient-bottom-right: linear-gradient(180deg, #8ECCEDff, #B0D5F0ff, #D3D7EEff, #E6D5F1ff, #DFD3F6ff);

  $gradient-bottom-right: linear-gradient(180deg, #A4D3E5, #96CDE5, #9AC8E6, #A0C2E5, #ACBDE9, #A7B2E6);

  background: $gradient-bottom-right;
  //background-blend-mode: multiply; /* 混合模式 */
  //background-size: 200% 200%;
  //animation: WaveHelper 5s ease-in-out infinite;
  height: 100vh;
  position: relative;

  &__bg {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 30px;

    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 2px solid rgba(216, 237, 248, 0.9);
    box-shadow: inset 5px 5px 10px rgba(255, 255, 255, 0.6),
    inset -5px -5px 10px rgba(255, 255, 255, 0.6),
    5px 5px 10px rgba(255, 255, 255, 0.6),
    -5px -5px 10px rgba(255, 255, 255, 0.6);
  }

  &__wrap {
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
    z-index: 3;
  }

  &__center {
    flex: 1;
    padding: 20px;
  }

  &__logo {
    width: 240px;
    position: absolute;
    left: -10px;
    bottom: 100px;
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
