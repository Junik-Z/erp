<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniNumberBox from "@/components/uni-number-box/components/uni-number-box/uni-number-box.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _isEmpty, getRect } from "@/utils";
import { getProductFieldApi } from "@/api/erp/product";

export default {
  // 产品卡片
  name: "ProductCard",
  components: {UniCol, UniRow, UniNumberBox, BasicCard},
  mixins: [mixins],
  props: {
    className: String,
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    readonly: Boolean,
  },
  data() {
    return {
      width: 0,
      FieldList: uni.$__FIEL_LIST__,
    };
  },
  methods: {
    async getVmRect() {
      const rect = await getRect(".ko-product-card__wrap", this);
      this.width = rect.width;
      console.log(rect);
    },

    getExtendList() {
      if (_isEmpty(uni.$__FIEL_LIST__)) {
        getProductFieldApi()
          .then(res => {
            this.FieldList = res.data;
            uni.$__FIEL_LIST__ = res.data;
          });
      }
    },
  },
  mounted() {
    this.getExtendList();

    setTimeout(() => {
      this.getVmRect();
    }, 10);
  },
};
</script>

<template>
  <BasicCard class="ko-product-card" :class-name="className">
    <view class="ko-product-card__wrap" :style="{'--product-root-width': width + 'px'}">
      <UniRow gutter="10">
        <UniCol :span="24" v-if="node.images">
          <view class="ko-product-card__item">
            <image
              class="ko-product-card__image"
              :src="getImageUrl(node.images)"
              mode="center"
            />
          </view>
        </UniCol>
        <UniCol :span="24">
          <view class="ko-product-card__item--name">
            <text>{{ node.name || "-" }}</text>
          </view>
        </UniCol>

        <UniCol :span="12">
          <view class="ko-product-card__item">
            <label class="ko-basic-label">单价：</label>
            <text class="ko-basic-money">¥ {{ toYuan(node.price) }}元</text>
          </view>
        </UniCol>

        <UniCol :span="12">
          <view class="ko-product-card__item">
            <label class="ko-basic-label">数量：</label>
            <text>{{ node.productQuantity || 0 }}</text>
          </view>
        </UniCol>

        <UniCol :span="12" v-for="field of FieldList" :key="field.id">
          <view class="ko-product-card__item">
            <label class="ko-basic-label">{{ field.fieldName }}：</label>
            <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
          </view>
        </UniCol>

      </UniRow>
    </view>
  </BasicCard>
</template>

<style scoped lang="scss">
.ko-product-card {
  &__wrap {
    display: flex;
  }

  &__image {
    border-radius: 6px 6px 0 0;
    width: var(--product-root-width, 360px);
    height: 150px;
  }

  &__item {
    width: 100%;

    &--name {
      text-align: center;
      font-size: 18px;
      margin-bottom: 10px;
      margin-top: 8px;
    }
  }
}
</style>
