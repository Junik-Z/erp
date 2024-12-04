<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniNumberBox from "@/components/uni-number-box/components/uni-number-box/uni-number-box.vue";
import mixins from "@/mixins/mixins";

export default {
  // 产品卡片
  name: "ProductCard",
  components: {UniNumberBox, BasicCard},
  mixins: [mixins],
  props: {
    className: String,
    node: {
      type: Object,
      default() {
        return {}
      }
    }
  },
};
</script>

<template>
  <BasicCard class="ko-product-card" :class-name="className">
    <view class="ko-product-card__wrap">
      <image
        v-if="node.images"
        class="ko-shop__image"
        :src="getImageUrl(node.images)"
        mode="scaleToFill"
      />
      <view class="ko-shop__info">
        <view class="ko-shop__info--name">
          {{ node.name }}
        </view>
        <view class="ko-shop__info--yuan edit ko-basic-money">
          ¥
          <text v-if="isClient">{{ toYuan(item.price) }}</text>
          <UniNumberBox
            v-else
            :max="9999999999999999"
            :value="toYuan(item.price)"
            color="#e43d33"
            @change="onChangePrice(item, $event)"
          />
          元
        </view>

        <view class="ko-shop__info--number">
          <UniNumberBox
            :max="9999999"
            :value="getSelectNumber(item)"
            @change="onItemNumberChange(item, $event)"
          />
        </view>
      </view>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-product-card {

}
</style>
