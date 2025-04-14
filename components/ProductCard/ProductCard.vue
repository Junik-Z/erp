<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import { _deepCopy, _get, _isEmpty, getRect } from "@/utils";
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
    // 是否可修改价格
    isEditPrice: Boolean,
    // 是否可修改数量
    isProductQuantity: Boolean,

    isWarning: Boolean,
    hidePrices: Boolean,
    emphasisOnQuantity: Boolean,
    // 列表模式
    isList: Boolean,
    // 插槽的权限
    perm: String,
    span: {
      type: Number,
      default: 12,
    },
    // 添加及选择模式
    isEditor: Boolean,
    selected: {
      type: Object,
      default() {
        return {};
      },
    },

    // 核对库存页面
    isVerification: Boolean,

    // 选择类型 purchase: 采购；sale: 销售
    type: [String, Object, Array],

    // 库存判断
    isJudge: Boolean,

    // 隐藏入库价格
    isHideStockPrice: Boolean,

    // 生产工单
    isWork: Boolean,
    // 隐藏数量
    isHideQuantity: Boolean,

    // 显示库存
    showQuantity: Boolean,
  },
  data() {
    return {
      width: 0,
      FieldList: uni.$__FIELD_LIST__ || [],
    };
  },
  methods: {
    async getVmRect() {
      const rect = await getRect(".ko-product-card__wrap", this);
      this.width = rect.width;
      console.log(rect);
    },

    getExtendList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0})
        .then(res => {
          this.FieldList = res.data;
          uni.$__FIELD_LIST__ = res.data;
        });
    },
    onChangePrice(node, event) {
      this.$emit("change-price", node, event);
    },

    onChangeProductQuantity(node, event) {
      this.$emit("change-product-quantity", node, event);
    },

    onItemNumberChange(value, event) {
      this.$emit("number-change", value, event);
    },

    onImgPreview(url) {
      if (url) {
        uni.setStorageSync("TO_DETAILS", true);
        uni.previewImage({
          urls: [url],
        });
      }
    },
  },
  mounted() {
    _isEmpty(uni.$__FIELD_LIST__) && this.getExtendList();

    /*  setTimeout(() => {
       this.getVmRect();
     }, 10); */
  },
  computed: {
    // 获取已经选的产品列表
    getSelectedList() {
      return Object.values(_deepCopy(this.selected) || {}).filter(item => item.productQuantity > 0) || [];
    },

    getMoneyKey() {
      return {
        purchase: "purchasePrice",
        sale: "salePrice",
      }[this.type];
    },

    getPrice() {
      return (item) => {
        return _get(item, this.getMoneyKey) || 0;
      };
    },

    // 获取已选的件数
    getSelectNumber() {
      return (item) => {
        return _get(this.selected, `${item.id}.productQuantity`) || 0;
      };
    },

    // 是否显示库存
    isShowQuantity() {
      return node => this.showQuantity && "quantity" in node;
    },
  },
};
</script>

<template>
  <BasicCard class="ko-product-card" :class-name="className" @click="$emit('click', $event)">
    <view class="ko-product-card__wrap" :style="{'--product-root-width': width + 'px'}">
      <UniRow :gutter="10" style="width: 100%;">
        <UniCol :span="24" v-if="node.images">
          <view class="ko-product-card__item">
            <image
              class="ko-product-card__image"
              :src="getImageUrl(node.images)"
              mode="scaleToFill"
              style="width: 100%"
              @click.stop="onImgPreview(getImageUrl(node.images))"
            />
          </view>
        </UniCol>

        <UniCol :span="24">
          <view class="ko-product-card__item--name">
            <text @click.stop="onCopyText(node.name)">{{ node.name || "-" }}</text>
          </view>
        </UniCol>

        <template v-if="!isList">
          <template v-if="isWarning">
            <UniCol :span="24">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">分类：</label>
                <text>{{ node.className || 0 }}</text>
              </view>
            </UniCol>

            <UniCol :span="12">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">库存：</label>
                <text class="ko-basic-money">{{ node.quantity || 0 }}</text>
              </view>
            </UniCol>

            <UniCol :span="12">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">预警：</label>
                <text class="ko-basic-money">{{ node.stockWarning || 0 }}</text>
              </view>
            </UniCol>
          </template>

          <template v-else-if="isVerification">
            <UniCol :span="24">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">分类：</label>
                <text>{{ node.className || 0 }}</text>
              </view>
            </UniCol>

            <UniCol :span="24">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">库存：</label>
                <text class="ko-basic-money">{{ node.quantity || 0 }}</text>
              </view>
            </UniCol>

            <UniCol :span="24">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">预警：</label>
                <text class="ko-basic-money">{{ node.stockWarning || 0 }}</text>
              </view>
            </UniCol>

            <UniCol :span="24" v-for="field of FieldList" :key="field.id">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">{{ field.fieldName }}：</label>
                <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
              </view>
            </UniCol>

            <UniCol :span="24" v-if="false">
              <label class="ko-basic-label">备注：</label>
              {{ node.remark || "-" }}
            </UniCol>

            <UniCol :span="24">
              <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 6px;">
                <slot v-if="isPerm(perm)" name="footer" :item="node"></slot>
              </view>
            </UniCol>
          </template>

          <template v-else>
            <template v-if="readonly">
              <UniCol :span="12" v-if="!hidePrices && node.price && !isWork">
                <view class="ko-product-card__item">
                  <label class="ko-basic-label">单价：</label>
                  <text class="ko-basic-money"> {{ toYuan(node.price) }}元</text>
                </view>
              </UniCol>

              <UniCol :span="12" v-if="isWork">
                <view class="ko-product-card__item">
                  <label class="ko-basic-label">单价：</label>
                  <text class="ko-basic-money"> {{ toYuan(node.price) }}元</text>
                </view>
              </UniCol>

              <UniCol :span="12">
                <view class="ko-product-card__item">
                  <label class="ko-basic-label">数量：</label>
                  <text :class="emphasisOnQuantity ? 'ko-basic-money' : ''">{{ node.productQuantity || 0 }}</text>
                </view>
              </UniCol>
            </template>

            <UniCol :span="12" v-for="field of FieldList" :key="field.id">
              <view class="ko-product-card__item">
                <label class="ko-basic-label">{{ field.fieldName }}：</label>
                <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
              </view>
            </UniCol>

            <template v-if="!readonly">
              <UniCol :span="24" v-if="!hidePrices">
                <view class="ko-product-card__item" style="display: flex; align-items: center;">
                  <label class="ko-basic-label">单价：</label>
                  <text class="ko-basic-money" v-if="!isEditPrice"> {{ toYuan(node.price) }}元</text>
                  <view class="ko-basic-money" style="flex: 1; display: flex;align-items: center;" v-else>
                    <UniNumberBox
                      :max="9999999999999999"
                      :value="toYuan(node.price)"
                      color="#e43d33"
                      :width="120"
                      type="digit"
                      @change="onChangePrice(node, $event)"
                    />
                    元
                  </view>
                </view>
              </UniCol>

              <UniCol :span="24">
                <view class="ko-product-card__item" style="display: flex; align-items: center;">
                  <label class="ko-basic-label">数量：</label>
                  <text v-if="!isProductQuantity">{{ node.productQuantity || 0 }}</text>
                  <view style="flex: 1;" v-else>
                    <UniNumberBox
                      :max="9999999999999999"
                      :value="node.productQuantity"
                      :width="120"
                      @change="onChangeProductQuantity(node, $event)"
                    />
                  </view>
                </view>
              </UniCol>
            </template>
          </template>
        </template>

        <template v-else-if="isJudge">
          <UniCol :span="24" v-for="field of FieldList" :key="field.id">
            <view class="ko-product-card__item">
              <label class="ko-basic-label">{{ field.fieldName }}：</label>
              <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
            </view>
          </UniCol>

          <UniCol :span="24">
            <view class="ko-product-card__item">
              <label class="ko-basic-label">预警：</label>
              <text class="ko-basic-money">{{ node.stockWarning || 0 }}</text>
            </view>
          </UniCol>


          <UniCol :span="24">
            <view class="ko-product-card__item" style="display: block;">
              <label class="ko-basic-label">库存：</label>
              <view style="padding-top: 8px;">
                <UniNumberBox
                  :max="9999999"
                  width="60"
                  :value="getSelectNumber(node)"
                  type="digit"
                  color="#e43d33"
                  @change="onItemNumberChange(node, $event)"
                />
              </view>
            </view>
          </UniCol>
        </template>

        <template v-else-if="isEditor">
          <UniCol :span="24" v-for="field of FieldList" :key="field.id">
            <view class="ko-product-card__item">
              <label class="ko-basic-label">{{ field.fieldName }}：</label>
              <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
            </view>
          </UniCol>
          <UniCol :span="24" v-if="!hidePrices && !isWork">
            <label class="ko-basic-label">单价：</label>
            <text class="ko-basic-money"> {{ toYuan(getPrice(node)) }}元</text>
          </UniCol>
          <UniCol :span="24" v-if="isWork">
            <label class="ko-basic-label">单价：</label>
            <text class="ko-basic-money"> {{ toYuan(getPrice(node)) }}元</text>
          </UniCol>

          <UniCol :span="24" v-if="isShowQuantity(node)">
            <label class="ko-basic-label">库存：</label>
            <text> {{ node.quantity || 0 }}</text>
          </UniCol>

          <UniCol :span="24" v-if="!isHideQuantity">
            <UniNumberBox
              :max="9999999"
              width="50"
              :value="getSelectNumber(node)"
              type="digit"
              @change="onItemNumberChange(node, $event)"
            />
          </UniCol>
        </template>

        <template v-else>
          <UniCol :span="span">
            <view class="ko-product-card__item">
              <label class="ko-basic-label">分类：</label>
              <text>{{ node.className || 0 }}</text>
            </view>
          </UniCol>
          <UniCol :span="span" v-if="!isHideStockPrice">
            <label class="ko-basic-label">入库：</label>
            <text class="ko-basic-money"> {{ toYuan(node.purchasePrice) }}元</text>
          </UniCol>
          <UniCol :span="span">
            <label class="ko-basic-label">销售：</label>
            <text class="ko-basic-money"> {{ toYuan(node.salePrice) }}元</text>
          </UniCol>
          <UniCol :span="span">
            <label class="ko-basic-label">预警：</label>
            {{ node.stockWarning }}
          </UniCol>
          <UniCol :span="span" v-for="field of FieldList" :key="field.id">
            <view class="ko-product-card__item">
              <label class="ko-basic-label">{{ field.fieldName }}：</label>
              <text>{{ GET_FUNC(node, `extend.${field.fieldCode}`) || "-" }}</text>
            </view>
          </UniCol>
          <!-- <UniCol :span="span">
             <label class="ko-basic-label">产品介绍：</label>
             {{ node.description || "-" }}
           </UniCol>
           <UniCol :span="span">
             <label class="ko-basic-label">备注：</label>
             {{ node.remark || "-" }}
           </UniCol>-->
          <UniCol :span="24">
            <view style="display: flex; align-items: center; justify-content: flex-end; margin-top: 6px;">
              <view class="xiao" :class="{'is-active': node.saleOff}">
                <text>销</text>
              </view>
              <view class="cai" :class="{'is-active': node.purchaseOff}">
                <text>采</text>
              </view>

              <slot v-if="!!$slots.footer" name="footer" :item="node"></slot>
            </view>
          </UniCol>
        </template>
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
    border-radius: 6px;
    //width: var(--product-root-width, 360px);
    height: 150px;
  }

  &__item {
    width: 100%;
    overflow: hidden;
    border-radius: 6px;

    &--name {
      text-align: center;
      font-size: 18px;
      margin-bottom: 10px;
      margin-top: 8px;
    }
  }

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

  .cai {
    margin-right: 16px;
  }
}
</style>
