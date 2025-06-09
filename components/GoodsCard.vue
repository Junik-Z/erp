<script>
import mixins from "@/mixins/mixins";
import { _deepCopy, _get, _isEmpty, _isEqual, _keys } from "@/utils";
import KNumberInput from "./KNumberInput.vue";
import GoodsMixins from "../mixins/GoodsMixins";
import UniIcons from "../uni_modules/uni-icons/components/uni-icons/uni-icons.vue";

export default {
  name: "GoodsCard",
  mixins: [mixins, GoodsMixins],
  props: {
    node: {
      type: Object,
      default() {
        return {};
      },
    },
    field: {
      type: Array,
      default() {
        return [];
      },
    },
    // 显示采购价
    showPurchasePrice: Boolean,
    // 购物模式
    isShopping: Boolean,
    // 选择类型 purchase: 采购；sale: 销售; goods
    type: {
      type: String,
      default: "sale",
    },

    pickerHeader: Boolean,

    // 图片大小
    imageSize: Number,

    // 卖场模式
    isSupply: Boolean,

    // 超出2行显示省略号
    ellipsis2lines: Boolean,
  },
  components: {UniIcons, KNumberInput},
  methods: {
    onClickItem() {
      this.$emit("operate");
    },

    // 点击事件
    onClick(event) {
      this.$emit("click", event);
    },

    // 获取的数量
    onChangeCount(val) {
      const item = _deepCopy(this.node);
      this.setGoodQuantity(val, item);
    },
  },
  computed: {
    // 显示扩展字段的数据
    getFieldCode() {
      return (key) => _get(this.node, `extend.${key}`);
    },

    // 显示扩展字段
    isShowFiled() {
      return node => !(_isEmpty(node.extend) || _keys(node.extend).some(v => !node.extend[v]));
    },

    // 获取产品数量
    sCount() {
      return this.getGoodCount(this.node.productId) || 0;
    },

    // 购物车模式
    isGoods() {
      return _isEqual(this.type, "goods");
    },

    // 显示销采状态
    showOff() {
      return !this.isShopping && !this.isGoods;
    },

    // 是否可以编辑数量
    isEditQuantity() {
      return (this.isShopping || this.isGoods) && !this.isSupply;
    },
  },
};
</script>

<template>
  <view
    class="ko-goods-card glass"
    :class="[type]"
    :style="[imageSize ? {'--image-size': imageSize + 'px'} : {}]"
  >
    <view
      class="ko-goods-card__image"
      v-if="node.images"
      :style="[{opacity: node.images ? 1 : 0.5}]"
      :class="{'is-goods': isGoods, 'image-size': !!imageSize}"
      @click.stop="onClick"
    >
      <view style="padding-bottom: 100%; position: relative;">
        <view style="position: absolute; top: 0;right: 0;bottom: 0;left: 0;">
          <uv-image
            :src="getImageUrl(node.images)"
            mode="aspectFill"
            width="100%"
            height="100%"
            lazy-load
            observe-lazy-load
            icon-size="42px"
          />
        </view>
      </view>
    </view>

    <view class="ko-goods-card__wrap">
      <view class="ko-goods-card__info" @click.stop="onClick">
        <view
          class="ko-goods-card__name"
          :class="{'ellipsis-2-lines': ellipsis2lines}"
        >{{ node.name }}
        </view>
        <!-- 扩展字段 -->
        <view class="ko-goods-card__filed" v-if="isShowFiled(node)">
          <view
            class="ko-goods-card__filed--item"
            v-for="f of field"
            :key="f.id"
            v-if="getFieldCode(f.fieldCode)"
          >
            <text class="field-name">{{ f.fieldName }}：</text>
            <text class="field-code">{{ getFieldCode(f.fieldCode) }}</text>
          </view>
        </view>

        <!-- 销采状态 ➕入库价格 -->
        <view
          style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;"
          v-if="showOff"
        >
          <view class="ko-goods-card__status">
            <view class="xiao" :class="{'is-active': node.saleOff}">
              <text>销</text>
            </view>
            <view class="cai" :class="{'is-active': node.purchaseOff}">
              <text>采</text>
            </view>
          </view>

          <view class="warehouse" v-if="showPurchasePrice">
            <text class="ko-basic-money__unit">¥</text>
            {{ toYuan(node.purchasePrice) }}
          </view>
        </view>
      </view>

      <block v-if="!pickerHeader">
        <view v-if="node.longName && false" class="ko-goods-card__long-name">
          {{ node.longName }}
        </view>

        <view class="ko-goods-card__footer">
          <view class="ko-basic-money">
            <text class="ko-basic-money__unit">¥</text>
            <text v-if="isGoods">{{ toYuan(node.price) }}</text>

            <text v-else>{{ toYuan(node.salePrice) }}</text>
          </view>

          <view
            v-if="isEditQuantity && !node.hasSub"
            class="ko-goods-card__increase"
            @click.stop
          >
            <KNumberInput :value="sCount" @input="onChangeCount" />
          </view>

          <button v-else class="ko-goods-card__operate" @click.stop="onClickItem">
            <uni-icons :type="isShopping && node.hasSub ? 'cart' : 'plusempty'" color="#fff" />
          </button>
        </view>
      </block>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-goods-card {
  --image-size: 80px;
  --goods-image-size: 140px;
  --border-radius-size: 10px;
  --operate-size: 26px;

  //background: rgba(255, 255, 255, 0.25);
  //box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.37);
  //backdrop-filter: blur(4px);
  //-webkit-backdrop-filter: blur(4px);
  //border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-size);
  overflow: hidden;

  //display: flex;
  //align-items: flex-start;

  &.goods {
    display: flex;
    align-items: center;
    padding: 10px;

    .ko-goods-card__image {
      width: var(--image-size) !important;
      height: var(--image-size);
      border-radius: var(--border-radius-size);
    }

    .ko-goods-card__wrap {
      flex: 1;
    }
  }

  &__image {
    width: 100% !important;
    //height: var(--image-size);
    border-radius: var(--border-radius-size) var(--border-radius-size) 0 0;
    display: block;
    box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.37);
    overflow: hidden;

    &.image-size {
      width: var(--image-size);
      height: var(--image-size);
    }

    &.is-goods {
      //height: var(--goods-image-size);
    }
  }

  &__wrap {
    padding: 10px;
    position: relative;

    .ko-basic-money {
      font-size: 16px;

      &__unit {
        font-size: 12px;
        margin-right: 2px;
      }
    }

    .warehouse {
      margin-top: 3px;
      color: #303F9F;
      display: flex;
      align-items: center;
      font-size: 12px;

      &::before {
        content: '入';
        font-size: 7px;
        margin-right: 2px;
        height: 14px;
        width: 14px;
        background: #303F9F;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  &__info {
    flex: 1;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__status {
    display: flex;
    align-items: center;
    padding-top: 4px;

    .xiao, .cai {
      background: #18bc37;
      border-radius: 50px;
      padding: 4px;
      font-size: 10px;
      color: #fff;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;

      &.is-active {
        background: #c7c9ce;
      }
    }
  }

  &__name {
    font-size: 16px;
    font-weight: bold;
    color: #333;

    &.ellipsis-2-lines {
      overflow: hidden; /* 隐藏溢出内容 */
      text-overflow: ellipsis; /* 溢出时显示省略号 */
      display: -webkit-box; /* 启用弹性盒子模型（WebKit内核） */
      -webkit-box-orient: vertical; /* 文本垂直排列 */
      -webkit-line-clamp: 2; /* 限制显示2行 */
      line-height: 1.2; /* 建议设置行高 */
      height: 2.4em; /* 最大高度 = 行高 × 行数（1.5 × 2） */
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

  &__filed {
    margin-top: 2px;
    padding: 5px 0;
    font-size: 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    color: #8f939c;

    &--item {
      display: flex;
      align-items: center;
      width: 48%;

      white-space: nowrap;

      .field-code {
        flex: 1;
        overflow: hidden;
      }
    }
  }

  &__footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 8px;
  }

  &__increase {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100px;
  }

  &__long-name {
    font-size: 10px;
    color: #c7c9ce;
    margin-top: 4px;
  }
}
</style>
