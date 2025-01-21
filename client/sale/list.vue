<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import KoMovable from "@/components/Movable/index.vue";

export default {
  name: "List",
  components: {KoMovable, BasicCard, UniCol, UniRow},
  data: () => ({}),
  methods: {
    onFabClick() {
      uni.navigateTo({
        url: "/client/sale/place",
      });
    },
    onJump() {
    },
  },
};
</script>

<template>
  <view class="ko-sale-list">
    <BasicCard>
      <view class="ko-sale-list__info">
        <view class="ko-sale-list__info--name">订单名称</view>
        <UniRow>
          <UniCol :span="12">
            客户名称：哇哈哈哈
          </UniCol>
          <UniCol :span="12">
            客户电话：哇哈哈哈
          </UniCol>
          <UniCol :span="12">
            订单总额：哇哈哈哈
          </UniCol>
          <UniCol :span="12">
            申请时间：哇哈哈哈
          </UniCol>
        </UniRow>
        <view
          style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
          v-if="false"
        >
          <button class="ko-basic-button__card" @click="onJump">申请出库</button>
        </view>
      </view>
    </BasicCard>

    <KoMovable
      @click="onFabClick('')"
    />
  </view>
</template>

<style scoped lang="scss">
.ko-sale-list {
  width: 100%;

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }
}
</style>
