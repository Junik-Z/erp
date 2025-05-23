<script>
import BasicCard from "../../components/BasicCard/BasicCard.vue";
import UniIcons from "../../uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import mixins from "../../mixins/mixins";

export default {
  name: "StandardItem",
  components: {UniIcons, BasicCard},
  mixins: [mixins],
  props: {
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    index: Number,
    readonly: Boolean,
  },
  methods: {
    // 处理编辑
    onEmits(type, arg = {}) {
      this.$emit("click-btn", type, {rNode: this.node, rIndex: this.index, ...arg});
    },
  },

  computed: {
    // 获取子级
    getChildren() {
      return this.node?.children || [];
    },
    // 获取产品
    getSubProducts() {
      return this.node?.subProducts || [];
    },

    // 获取子级的产品
    getChildSubProducts() {
      return (item) => item?.subProducts || [];
    },
  },
};
</script>

<template>
  <BasicCard :spacing="10">
    <view class="ko-standard-item">
      <view class="ko-standard-item__name">
        <view style="display:flex; align-items: center; flex: 1">
          <UniIcons type="settings" :size="15" style="margin-right: 2px;" />
          {{ node.name }}
        </view>

        <view class="ko-standard-item__btns" v-if="!readonly">
          <button
            class="ko-basic-button__link"
            @click="onEmits('rCEdit', {rNode: node, rIndex: index})"
          >
            编辑
          </button>
          <button
            v-if="!getSubProducts.length"
            class="ko-basic-button__link"
            @click="onEmits('rCNext', {rNode: node, rIndex: index})"
          >
            下一级
          </button>
          <button
            v-if="!getChildren.length"
            class="ko-basic-button__link"
            @click="onEmits('rPAdd', {rNode: node, rIndex: index})"
          >
            添加产品
          </button>
          <button
            class="ko-basic-button__link"
            @click="onEmits('rCRemove', {rNode: node, rIndex: index})"
          >
            删除
          </button>
        </view>
      </view>

      <view
        class="ko-standard-item__children"
        v-if="getChildren.length"
      >
        <block
          v-for="(item, index) of getChildren"
          :key="index"
        >
          <view class="ko-standard-item" style="padding-bottom: 0;">
            <view class="ko-standard-item__name">
              <view style="display:flex; align-items: center; flex: 1">
                <UniIcons type="settings" :size="15" style="margin-right: 2px;" />
                {{ item.name }}
              </view>

              <view class="ko-standard-item__btns" v-if="!readonly">
                <button
                  class="ko-basic-button__link"
                  @click="onEmits('cPAdd', {cNode: item, cIndex: index})"
                >
                  添加产品
                </button>
                <button
                  class="ko-basic-button__link"
                  @click="onEmits('cCEdit', {cNode: item, cIndex: index})"
                >
                  编辑
                </button>
                <button
                  class="ko-basic-button__link"
                  @click="onEmits('cCRemove', {cNode: item, cIndex: index})"
                >
                  删除
                </button>
              </view>
            </view>

            <view class="ko-standard-item__sub" v-if="getChildSubProducts(item).length">
              <view class="ko-sub" v-for="(child, j) of getChildSubProducts(item)" :key="j">
                <view class="ko-sub__image" v-if="child.images">
                  <image
                    style="width: 100%; height: 100%;"
                    :src="getImageUrl(child.images)"
                    mode="aspectFill"
                  />
                </view>

                <view class="ko-sub__info">
                  <view class="ko-sub__name">
                    {{ child.name }}
                  </view>
                  <view class="ko-sub__money">
                    <view class="ko-sub__money--item ko-basic-money">
                      ¥{{ toYuan(child.salePrice) }}
                    </view>
                    <view class="ko-sub__money--item">
                      采: ¥{{ toYuan(child.purchasePrice) }}
                    </view>
                    <view class="ko-sub__money--item" v-if="child.stockWarning">
                      预: {{ child.stockWarning }}
                    </view>
                  </view>

                  <view class="ko-sub__btn" v-if="!readonly">
                    <button
                      class="ko-basic-button__link"
                      @click="onEmits('cPEdit', {cNode: item, cIndex: index, cPNode: child, cPIndex: j})"
                    >
                      编辑
                    </button>
                    <button
                      class="ko-basic-button__link"
                      @click="onEmits('cPRemove', {cNode: item, cIndex: index, cPNode: child, cPIndex: j})"
                    >
                      删除
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </block>
      </view>

      <view class="ko-standard-item__sub" v-if="getSubProducts.length">
        <view class="ko-sub" v-for="(child, j) of getSubProducts" :key="j">
          <view class="ko-sub__image" v-if="child.images">
            <image
              style="width: 100%; height: 100%;"
              :src="getImageUrl(child.images)"
              mode="aspectFill"
            />
          </view>

          <view class="ko-sub__info">
            <view class="ko-sub__name">
              {{ child.name }}
            </view>
            <view class="ko-sub__money">
              <view class="ko-sub__money--item ko-basic-money">
                ¥{{ toYuan(child.salePrice) }}
              </view>
              <view class="ko-sub__money--item">
                采: ¥{{ toYuan(child.purchasePrice) }}
              </view>
              <view class="ko-sub__money--item" v-if="child.stockWarning">
                预: {{ child.stockWarning }}
              </view>
            </view>

            <view class="ko-sub__btn" v-if="!readonly">
              <button
                class="ko-basic-button__link"
                @click="onEmits('rPEdit', {rPNode: child, rPIndex: j})"
              >
                编辑
              </button>
              <button
                class="ko-basic-button__link"
                @click="onEmits('rPRemove', {rPNode: child, rPIndex: j})"
              >
                删除
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-sub {
  --image-size: 72px;
  display: flex;
  align-items: center;

  border: 1px solid #e9e9eb;
  border-radius: 6px;
  padding: 8px;

  box-shadow: 0 1px 4px 1px rgba($color: #a5a5a5, $alpha: 0.2);

  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__image {
    width: var(--image-size);
    height: var(--image-size);
    border-radius: 6px;
    overflow: hidden;
  }

  &__info {
    flex: 1;
    overflow: hidden;
    padding-left: 10px;
  }

  &__name {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
  }

  &__money {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;

    &--item {
      overflow: hidden;
      width: 33%;
      font-size: 10px;
      color: #8f939c;

      &:first-child {
        font-size: 12px;
        font-weight: bold;
        color: #e43d33;
      }
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 5px;
  }
}

.ko-standard-item {
  position: relative;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -14px;
    top: -14px;
  }

  &__name {
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__btns {
    display: flex;
    align-items: center;
  }

  &__children, &__sub {
    padding: 10px 0 0 16px;
  }
}
</style>
