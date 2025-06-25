<script>
import BasicPopup from "./BasicPopup/BasicPopup.vue";
import mixins from "../mixins/mixins";
import KNumberInput from "./KNumberInput.vue";
import { getDetailApi } from "../api/erp/product";
import UvLoadingIcon from "../uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";
import { _get, _isEmpty, _isEqual, CustomToast } from "../utils";
import GoodsMixins from "../mixins/GoodsMixins";
import GoodsCard from "./GoodsCard.vue";

let type = "bottom";
let zIndex = 9999991;

// #ifdef H5
type = "center";
zIndex = 9;
// #endif

export default {
  name: "PickerStandard",
  components: {GoodsCard, UvLoadingIcon, KNumberInput, BasicPopup},
  mixins: [mixins, GoodsMixins],
  data() {
    return {
      visible: false,
      sCount: 30,
      node: null,
      nodeIndex: null,
      loading: false,
      info: null,
      form: {},
      cForm: {},

      rClass: null,
      pId: null,
      pType: type,
    };
  },
  props: {
    // 不是购物车模式
    noShoppingCart: Boolean,
    // 选择类型
    type: {
      type: String,
      default: "sale",
    },

    zIndex: {
      type: Number,
      default: zIndex,
    },
  },
  methods: {
    open(item, index) {
      this.nodeIndex = index;
      this.node = item;
      this.visible = true;

      this.getInfo();
    },

    getInfo() {
      this.loading = true;
      getDetailApi({id: this.node.id})
        .then((res) => {
          const data = res.data;
          this.info = data;

          const subClasses = _get(data, "subClasses") || [];
          const noChild = _isEmpty(_get(subClasses, "0.children"));
          if (noChild) {
            const node = _get(subClasses, "0.subProducts.0");
            this.onClickProducts(node);
          } else {
            const child = _get(subClasses, "0.children.0");
            this.rClass = child.id;
            this.onClickProducts(_get(child, "subProducts.0"));
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 修改数量
    onChangeCount(val) {
      this.cForm.productQuantity = val;
    },

    // 处理提交
    onSubmit() {
      const obj = this.cForm;
      const sGoods = this.sGoods;
      const nObj = {...sGoods, [obj.productId]: obj};

      if (this.noShoppingCart) {
        this.$emit("confirm", nObj);
      } else {
        this.setGoodsObjAsync(nObj);
      }

      // #ifdef MP
      CustomToast({title: `${obj.name} 添加成功`, icon: "none"});
      // #endif

      // #ifdef H5
      this.$message({
        message: `${obj.name} 添加成功`,
        type: "success",
      });
      // #endif

      // this.visible = false;
    },

    // 点击
    onClickTowClass(child) {
      this.rClass = child.id;

      if (!_isEmpty(child.subProducts)) {
        this.pId = _get(child, "subProducts.0.id");
        this.onClickProducts(_get(child, "subProducts.0"));
      }
    },

    // 点击产品
    onClickProducts(node) {
      this.pId = node.id;

      const obj = this.handleGoodItem({
        ...node,
        productId: node.id,
        ...(node.subFlag ? {name: node.longName} : {}),
      });

      this.cForm = {...obj, productQuantity: 1};
    },
  },
  computed: {
    // 获取分类列表
    getClassifyList() {
      return (this.info || {})?.subClasses || [];
    },

    // 获取子产品
    getSubProducts() {
      return (item) => item.subProducts || [];
    },

    // 获取子级
    getChild() {
      return (item) => (item || {}).children || [];
    },

    // 获取二级类下的产品列表
    getClassPList() {
      return child => {
        const node = child?.find((item) => _isEqual(item.id, this.rClass)) || {};
        return node.subProducts || [];
      };
    },

    // 获取二级分类的名称
    getTowChildClassName() {
      return child => {
        const node = child?.find((item) => _isEqual(item.id, this.rClass)) || {};
        return `${node.name}(${node.subProducts?.length || 0})`;
      };
    },

    // 获取一级类的名称
    getRootClassName() {
      return root => {
        if (!_isEmpty(this.getChild(root))) return root.name;
        return `${root.name}(${this.getSubProducts(root).length || 0})`;
      };
    },

    // 获取金额
    getMoney() {
      return (item) => _get(item, `${{sale: "salePrice", purchase: "purchasePrice"}[this.type]}`) || 0;
    },
  },
};
</script>

<template>
  <BasicPopup no-padding-top :visible.sync="visible" :type="pType" :z-index="zIndex">

    <template #header v-if="node && false">
      <view class="ko-sku__cp">
        <GoodsCard
          :show-purchase-price="false"
          :node="node"
          :is-shopping="true"
          picker-header
          :image-size="120"
        />
      </view>
    </template>

    <view class="ko-picker-standard ko-sku" :class="{loading: loading}">
      <UvLoadingIcon v-if="loading" :size="50" />

      <block v-else>
        <view class="ko-sku__header">
          <view class="ko-sku__image" v-if="cForm.images">
            <image
              :src="getImageUrl(cForm.images)"
              style="width: 100%;height: 100%;"
              mode="aspectFill"
              @click="lookImage(getImageUrl(cForm.images))"
            />
          </view>
          <view class="ko-sku__info">
            <view class="ko-basic-money ko-sku__info--money">
              <text>¥</text>
              {{ toYuan(cForm.price) }}
            </view>

            <view class="ko-sku__info--count">
              <KNumberInput :min="1" :value="cForm.productQuantity" @input="onChangeCount" />
            </view>
          </view>
        </view>
        <view class="ko-picker-standard__wrap">
          <scroll-view scroll-y class="ko-sku__wrap">
            <view class="ko-sku__content">
              <block v-for="(root, rIndex) of getClassifyList" :key="rIndex">
                <view class="ko-sku__classify">
                  <view class="ko-sku__classify--name">
                    {{ getRootClassName(root) }}
                  </view>

                  <!-- 一级产品 -->
                  <block v-if="getSubProducts(root).length">
                    <view class="ko-sku__p-wrap">
                      <view
                        class="ko-sku__p-item"
                        :class="{'active': isEqual(p.id, pId)}"
                        v-for="(p, pIndex) of getSubProducts(root)"
                        :key="pIndex"
                        @click.stop="onClickProducts(p)"
                      >
                        <image
                          :src="getImageUrl(p.images)"
                          mode="aspectFit"
                          class="ko-sku__p-item--image"
                          v-if="p.images"
                          @click="lookImage(getImageUrl(p.images))"
                        />

                        <view class="ko-sku__p-item--name">
                          {{ p.name }}
                        </view>

                        <view class="ko-sku__p-item--money">¥{{ toYuan(getMoney(p)) }}</view>
                      </view>
                    </view>
                  </block>

                  <!-- 二级类 -->
                  <block v-if="getChild(root).length">
                    <view class="ko-sku__c-wrap">
                      <view
                        class="ko-sku__c-item"
                        v-for="(child, j) of getChild(root)"
                        :key="j"
                        :class="{'active': isEqual(rClass, child.id)}"
                        @click="onClickTowClass(child)"
                      >
                        {{ child.name }}
                      </view>
                    </view>

                    <block v-if="rClass && getClassPList(getChild(root)).length">
                      <view class="ko-sku__classify--name" style="margin-top: 10px;">
                        {{ getTowChildClassName(getChild(root)) }}
                      </view>

                      <view class="ko-sku__p-wrap">
                        <view
                          class="ko-sku__p-item"
                          :class="{'active': isEqual(p.id, pId)}"
                          v-for="(p, pIndex) of getClassPList(getChild(root))"
                          :key="pIndex"
                          @click.stop="onClickProducts(p)"
                        >
                          <image
                            :src="getImageUrl(p.images)"
                            @click="lookImage(getImageUrl(p.images))"
                            mode="aspectFit"
                            class="ko-sku__p-item--image"
                            v-if="p.images"
                          />

                          <view class="ko-sku__p-item--name">
                            {{ p.name }}
                          </view>

                          <view class="ko-sku__p-item--money">¥{{ toYuan(getMoney(p)) }}</view>
                        </view>
                      </view>
                    </block>
                  </block>

                </view>
              </block>
            </view>
          </scroll-view>
        </view>
      </block>
    </view>

    <template #footer>
      <view class="ko-picker-standard__footer">
        <button class="ko-basic-button__card" @click.stop="onSubmit">加入购物车</button>
      </view>
    </template>
  </BasicPopup>
</template>

<style scoped lang="scss">
.ko-picker-standard {
  // #ifdef MP
  width: 100vw;
  height: calc(74vh);
  // #endif
  
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 16px 0 10px;

  &.loading {
    justify-content: center;
    align-items: center;
  }

  &__wrap {
    flex: 1;
    overflow: hidden;
    padding-top: 24px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;

    .ko-basic-button__card {
      width: 120px;
    }
  }
}

// #ifdef H5
.ko-picker-standard {
  width: 600px;
  height: 600px;
}

// #endif

.ko-sku {
  --sku-cp-image-size: 90px;
  --sku-image-size: 80px;
  --sku-p-image-size: 32px;

  &__header {
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  &__info {
    flex: 1;
    overflow: hidden;
    padding: 4px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;

    &--money {
      font-size: 24px;
      display: flex;
      align-items: flex-end;

      text {
        font-size: 12px;
        margin-right: 2px;
        padding-bottom: 4px;
      }
    }

    &--count {
      width: 120px;
      margin-top: 16px;
    }
  }

  &__image {
    width: var(--sku-image-size);
    height: var(--sku-image-size);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #c7c9ce;
    box-shadow: 0 1px 6px 1px rgba($color: #a5a5a5, $alpha: 0.2);
    margin-right: 10px;
  }

  &__wrap {
    height: 100%;
    font-size: 14px;
  }

  &__content {
    margin: 0 16px;
  }

  &__classify {
    margin-top: 16px;

    &--name {
      font-size: 16px;
      font-weight: bold;
    }
  }

  &__c-wrap {
    padding: 10px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: -5px;
  }

  &__c-item {
    border-radius: 6px;
    padding: 2px 10px;
    margin: 5px;
    color: #3a3a3a;
    border: 1px solid #f7f7f7;
    background: #f7f7f7;

    transition: border .3s, background .3s, color .3s;

    &.active {
      color: #2979ff;
      border: 1px solid #2979ff;
      background: rgba(41, 121, 255, 0.1);
    }
  }

  &__p-wrap {
    padding: 10px 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: -5px;
  }

  &__p-item {
    border-radius: 6px;
    padding-right: 10px;
    margin: 5px;
    color: #3a3a3a;
    border: 1px solid #f7f7f7;
    background: #f7f7f7;
    display: flex;
    align-items: center;
    transition: border .3s, background .3s, color .3s;

    &.active {
      color: #2979ff;
      border: 1px solid #2979ff;
      background: rgba(41, 121, 255, 0.1);

      .ko-sku__p-item--money {
        color: #2979ff;
      }
    }

    &--image {
      width: var(--sku-p-image-size);
      height: var(--sku-p-image-size);
      display: block;
    }

    &--name {
      margin: 3px 0;
      flex: 1;
      display: -webkit-box; /* 启用弹性盒子布局 */
      -webkit-line-clamp: 2; /* 限制显示2行 */
      -webkit-box-orient: vertical; /* 垂直排列子元素 */
      overflow: hidden; /* 隐藏溢出内容 */
      text-overflow: ellipsis; /* 超出部分显示省略号 */
      word-break: break-all; /* 允许单词内换行（可选） */
      line-height: 1.4;
      padding-left: 10px;
    }

    &--money {
      transition: color .3s;
      color: #8f939c;
      margin-left: 16px;
    }
  }

  &__cp {
    position: absolute;
    left: 16px;
    top: 0;
    transform: translateY(calc(-100% - 10px));
    z-index: 999999;
    background: #fff;
    border-radius: 16px;
  }
}
</style>
