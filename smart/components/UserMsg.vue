<script>
export default {
  name: "UserMsg",
  props: {
    item: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<template>
  <view class="ko-user-msg">
    <view class="ko-user-msg__wrap">
      <view class="ko-user-msg__content">
        {{ item.label }}
      </view>
    </view>

    <view class="ko-user-msg__one"></view>
    <view class="ko-user-msg__two"></view>
  </view>
</template>

<style scoped lang="scss">
.ko-user-msg {
  position: relative;
  padding-bottom: 4px;

  &__wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__content {
    border-radius: 10px;
    padding: 10px;
    background: rgba(233, 233, 233, 0.76);
    max-width: 80vw;
    margin-right: 22px;
    font-size: 14px;
  }

  &__one, &__two {
    position: absolute;
    background: #E9E9E9;
    border-radius: 50%;
  }

  &__one {
    right: 0;
    bottom: 0;
    width: 5px;
    height: 5px;
  }

  &__two {
    right: 10px;
    bottom: 2px;
    width: 10px;
    height: 10px;
  }

}
</style>
