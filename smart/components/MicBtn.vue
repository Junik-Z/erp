<script>
export default {
  name: "MicBtn",
  props: {
    iconSize: {
      type: Number,
      default: 32,
    },
  },
  data() {
    return {};
  },
};
</script>

<template>
  <view class="ko-mic">
    <view class="ko-mic__spinner-wrap">
      <view class="ko-mic__spinner" />
    </view>


    <button class="ko-mic__btn">
      <uni-icons :size="iconSize" type="mic" color="#fff" />
    </button>
  </view>
</template>

<style scoped lang="scss">
.ko-mic {
  --margin-size: 5px;

  width: var(--mic-size);
  height: var(--mic-size);
  position: relative;

  &__spinner-wrap {
    background-image: linear-gradient(#5C83E8 35%, #BE84E6);
    width: var(--mic-size);
    height: var(--mic-size);
    animation: spinning21 2.7s linear infinite;
    text-align: center;
    border-radius: 50px;
    filter: blur(1px);
    box-shadow: 0px -5px 20px 0px rgb(186, 66, 255), 0px 5px 20px 0px rgb(0, 225, 255);
  }

  &__spinner {
    background-color: rgb(36, 36, 36);
    width: var(--mic-size);
    height: var(--mic-size);
    border-radius: 50px;
    filter: blur(10px);
  }

  &__btn {
    position: absolute;
    top: var(--margin-size);
    right: var(--margin-size);
    bottom: var(--margin-size);
    left: var(--margin-size);
    border-radius: 50%;
    background: linear-gradient(to top right, #373CEE 0%, #5C83E8 20%, #BE84E6 80%, #CA6EEB 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    /*background-blend-mode: multiply; !* 混合模式 *!
    background-size: 400% 400%;
    animation: WaveHelper 4s ease-in-out infinite;*/
  }
}

@keyframes spinning21 {
  to {
    transform: rotate(360deg);
  }
}


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

</style>
