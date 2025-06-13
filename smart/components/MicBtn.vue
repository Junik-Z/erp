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
    <view class="icon-glow"></view>

    <button class="ko-mic__btn">
      <uni-icons :size="iconSize" type="mic" color="#fff" />
    </button>
  </view>
</template>

<style scoped lang="scss">
.ko-mic {
  //border: 1px solid rgba(85, 214, 189, 0.8);
  padding: 4px;
  border-radius: 50%;
  box-shadow: 0 4px 30px #7674CF;

  &__btn {
    line-height: 1.2;
    width: var(--mic-size);
    height: var(--mic-size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to top right, #373CEE 0%, #5C83E8 20%, #BE84E6 80%, #CA6EEB 100%);
  }
}

.icon-glow {
  background-color: rgba(100, 170, 255, 0.25);
  filter: blur(20px);
  animation: pulse 3s infinite alternate ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
}
</style>
