<script>
import mixins from "@/mixins/mixins";

export default {
  name: "RecommendList",
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },
  mixins: [mixins],
  data() {
    return {};
  },
  methods: {
    onClickItem(item) {
      this.$emit("click-item", item);
    },
  },
  computed: {
    getItemImages() {
      return (item) => {
        return item.images ? item.images.split(",").map(v => this.getImageUrl(v)) : [];
      };
    },
  },

};
</script>

<template>
  <view class="ko-recommend-list">
    <block v-for="(item, index) of list" :key="index">
      <BasicCard
        :padding-size="0"
        bg-color="#fff"
        :spacing="10"
        box-shadow="0 1px 10px 1px rgba(31, 38, 135, 0.37)"
        @click.stop="onClickItem(item)"
      >
        <view class="ko-recommend-list__item">
          <view
            style="min-height: 64px;"
            v-for="(url, j) of getItemImages(item)"
            :key="j"
            @click.stop="() => {}"
          >
            <uv-image
              :radius="j == 0 ? '6px 6px 0 0' : '0px'"
              :src="url"
              lazy-load
              width="100%"
              height="auto"
              mode="widthFix"
              :icon-size="64"
              bg-color="transparent"
              @click="lookImage(url)"
            />
          </view>

          <view class="ko-recommend-list__item--name">
            {{ GET_FUNC(item, "product.name") }}
          </view>

          <view class="ko-recommend-list__item--desc" v-if="GET_FUNC(item, 'description')">
            {{ GET_FUNC(item, "description") }}
          </view>

          <view class="ko-recommend-list__item--footer">
            <view class="ko-basic-money" style="display: flex; align-items: flex-end;">
              <text style="font-size: 10px; margin-bottom: 2px;">¥</text>
              {{ toYuan(GET_FUNC(item, "product.salePrice")) }}
            </view>

            <view>
              <button class="ko-recommend-list__operate" @click.stop="onClickItem(item)">
                <uni-icons type="plusempty" color="#fff" />
              </button>
            </view>
          </view>
        </view>
      </BasicCard>
    </block>

    <view v-if="loading" style="padding: 20px 0;">
      <uv-loading-icon :size="46" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-recommend-list {
  --operate-size: 26px;
  background: #fff;
  padding: 10px 10px 2px;

  margin-top: -5px;

  &__item {
    //border-radius: 0 0 10px 10px;
    //border-bottom: 10px solid #F3F4F6;

    &--name {
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
    }

    &--operate {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 10px 10px;
    }

    &--desc {
      padding: 0 10px 10px;
      font-size: 12px;
      color: #8f939c;
    }

    &--footer {
      padding: 0 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 0 0 10px 10px;
    }
  }

  &__operate {
    height: var(--operate-size);
    width: var(--operate-size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    box-shadow: 0 0 15px rgba(255, 214, 0, 0.5);
    background-image: linear-gradient(to right, #f59e0b, #fbbf24);
    z-index: 20;
  }
}
</style>
