<script>
import { ErrorImage, SuccessImage } from "@/client/Image";

export default {
  name: "Result",
  data() {
    return {};
  },
  props: {
    isSuccess: Boolean,
    msg: String,

    loading: Boolean,
  },
  computed: {
    getImage() {
      return this.isSuccess ? SuccessImage : ErrorImage;
    },
  },
  methods: {
    onToHome() {
      this.$emit("to-home");
    },
  },
};
</script>

<template>
  <view class="ko-result">
    <view class="ko-result__image">
      <image style="width: 100%;" :src="getImage" alt="" mode="widthFix" />
    </view>

    <view v-if="!isSuccess && msg" class="ko-result__tis">{{ msg }}</view>

    <view v-if="isSuccess" class="ko-result__tis success">绑定成功</view>

    <view class="ko-result__footer">
      <button
        class="ko-basic-button__card"
        @click.stop="onToHome"
        :disabled="loading"
        :loading="loading"
      >
        返回首页
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-result {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 10vh;

  &__image {
    width: 80vw;
  }

  &__tis {
    font-size: 14px;
    color: #c7c9ce;
    margin-top: 20px;

    &.success {
      color: #18bc37;
    }
  }

  &__footer {
    margin-top: 40px;

    .ko-basic-button__card {
      width: 120px;
    }
  }
}
</style>
