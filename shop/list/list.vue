<script>
// #ifdef H5
import { InputNumber } from "@/uni_modules/element-ui/element.min";
// #endif
import { getProductFieldApi, getProductListApi } from "@/api/erp/product";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/components/uni-number-box/components/uni-number-box/uni-number-box.vue";
import UniBadge from "@/shop/components/uni-badge/components/uni-badge/uni-badge.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _sum } from "@/utils";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import IndexList from "@/components/IndexList/IndexList.vue";

export default {
  name: "list",
  onLoad() {
    const EC = this.getOpenerEventChannel();
    EC?.on?.("on_to_take_over", (obj) => {
      // #ifdef H5
      sessionStorage.setItem("TAKE_OVER", JSON.stringify(obj));
      // #endif

      // #ifdef MP
      this.setShopList(obj);
      // #endif
    });

    this.getFieldList();
    this.getList();

    // #ifdef H5
    setTimeout(() => {
      const data = sessionStorage.getItem("TAKE_OVER");
      if (!data) return false;
      try {
        const list = JSON.parse(data);
        this.setShopList(list);
      } finally {

      }
    }, 200);
    // #endif
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      queryList: {
        classId: "",
        name: "",
        ...{pageSize: 1000000, pageNum: 0},
      },
      className: [],
      // 获取商品列表
      productList: [],

      // 已经选好的产品
      selected: {},
      visible: false,

      // 选择类型 purchase: 采购；sale: 销售
      type: null,

      // 是否是客户
      isClient: false,
      // 是否隐藏价格
      hidePrices: true,

      takeOverName: "",

      loading: false,

      fieldList: [],

      // 外部传入的列表
      EXList: [],
    };
  },
  components: {
    IndexList,
    ProductCard,
    PickerClass,
    BasicPopup,
    UniBadge,
    UniNumberBox,
    BasicCard,
    UniSearchBar,
  },
  methods: {
    // 外部传入的商品列表
    setShopList(data) {
      const list = data.list || [];
      this.type = data.type;
      this.isClient = data.isClient;
      this.hidePrices = data.hidePrices;
      this.takeOverName = data.takeOverName;
      this.EXList = list;
      list.forEach(item => {
        this.$set(this.selected, item.productId, item);
      });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        this.fieldList = res.data;
        uni.$__FIELD_LIST__ = res.data;
      });
    },

    // 获取商品列表
    getList() {
      this.loading = true;
      const params = {
        purchase: {purchaseOff: false},
        sale: {saleOff: false},
      }[this.type];

      getProductListApi({...this.queryList, ...params})
        .then(res => {
          this.productList = res.data
            .map(item => ({...item, productId: item.id}));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 选中分类
    onChangeClass(event) {
      this.className = event.detail.value?.map(item => item.text) || [];
      this.getList();
    },

    // 修改购买数量时触发
    onItemNumberChange(node, val) {
      const item = _deepCopy(node);
      if (_isEmpty(_get(this.selected, item.productId))) {
        this.$set(this.selected, item.productId, {
          name: item.name,
          classId: item.classId,
          levelIds: item.levelIds,
          productId: item.productId,
          images: item.images,
          price: _get(item, this.getMoneyKey),
          productQuantity: val,
          extend: item.extend,
        });
      } else {
        this.$set(this.selected[item.productId], "productQuantity", val);
      }
    },

    // 修改购买购买单价
    onChangePrice(node, val) {
      const item = _deepCopy(node);
      if (_isEmpty(_get(this.selected, item.productId))) {
        this.$set(this.selected, item.productId, {
          name: item.name,
          classId: item.classId,
          levelIds: item.levelIds,
          productId: item.productId,
          images: item.images,
          price: this.toFen(val),
          productQuantity: null,
          extend: item.extend,
        });
      } else {
        this.$set(this.selected[item.productId], "price", this.toFen(val));
      }
    },

    // 点击选好了
    onSubmit() {
      const list = _deepCopy(this.getSelectedList);
      const total = _deepCopy(this.getTotalMoney);

      // #ifndef H5
      const EC = this.getOpenerEventChannel();
      EC?.emit?.("on_take_over", {list, total});
      // #endif

      // console.log(this.takeOverName);

      // #ifdef H5
      uni.$emit(this.takeOverName, {list, total});
      // #endif

      uni.navigateBack({
        delta: 1,
        fail(err) {
          console.log(err);
        },
        success(err) {
          console.log(err);
        },
      });

    },

    onVisible() {
      this.visible = true;
    },
  },
  computed: {
    // 获取已选的件数
    getSelectNumber() {
      return (item) => {
        return _get(this.selected, `${item.productId}.productQuantity`) || 0;
      };
    },

    // 获取已经选的产品列表
    getSelectedList() {
      return Object.values(_deepCopy(this.selected) || {}).filter(item => item.productQuantity > 0) || [];
    },

    // 获取总金额
    getTotalMoney() {
      return _sum(_deepCopy(this.getSelectedList)?.map(item => (item.price * item.productQuantity)) || 0);
    },

    getMoneyKey() {
      return _isEqual("purchase", this.type) ? "purchasePrice" : "salePrice";
    },

    getPrice() {
      return (item) => {
        return _get(item, this.getMoneyKey) || 0;
      };
    },


    // #ifdef H5
    getTableData() {
      return Object.values(this.selected || {});
    },

    getTableColumns() {
      const before = [
        {
          type: "selection",
          width: 55,
        },
        {
          label: "产品名称",
          prop: "name",
        },
        {
          label: "分类",
          prop: "className",
        },
        {
          label: "产品图片",
          prop: "images",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: this.getImageUrl(_get(row, "images")),
                  size: 64,
                  text: _get(row, "images"),
                  shape: "square",
                },
              })],
            );
          },
        },
      ];

      const fieldList = this.fieldList?.map((item) => {
        return {
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        };
      });

      const after = [
        {
          label: "单价(元)",
          prop: "price",
          fixed: "right",
          width: 220,
          render: (h, {row}) => {
            const item = _get(this.selected, `${row.productId}`) || {};
            const price = item?.price || _get(row, this.getMoneyKey);

            if (this.isClient) {
              return h(
                "label",
                {class: "ko-basic-money"},
                [this.toYuan(price)],
              );
            } else {
              return h(
                InputNumber,
                {
                  class: "ko-basic-money",
                  style: {cursor: "pointer", width: "100%"},
                  props: {
                    min: 0,
                    value: this.toYuan(price),
                  },
                  on: {
                    change: (val) => {
                      this.onChangePrice(row, val);
                    },
                  },
                },
              );
            }
          },
        },
        {
          label: "数量",
          prop: "productQuantity",
          fixed: "right",
          width: 220,
          render: (h, {row}) => {
            return h(
              InputNumber,
              {
                class: "ko-basic-money",
                style: {cursor: "pointer", width: "100%"},
                props: {
                  value: this.getSelectNumber(row),
                  min: 0,
                },
                on: {
                  change: (val) => {
                    this.onItemNumberChange(row, val);
                  },
                },
              },
            );
          },
        },
      ]?.filter(item => !(this.hidePrices && _isEqual(item.prop, this.getMoneyKey)));

      return [...before, ...fieldList, ...after];
    },
    // #endif
  },
  onUnload() {
    // #ifdef H5
    sessionStorage.setItem("TAKE_OVER", null);
    // #endif
  },
};
</script>

<template>
  <view class="ko-shop-list">
    <!-- #ifdef H5 -->
    <div class="ko-shop-list__title">
      <!-- #endif -->
      <view class="ko-shop-list__header">
        <UniSearchBar v-model="queryList.name" placeholder="请输入产品名称" />
        <view class="ko-shop-list__class">
          <PickerClass watch-type :type="type" v-model="queryList.classId" @change="getList" />
        </view>
      </view>
      <!-- #ifdef H5 -->
    </div>
    <!-- #endif -->

    <view class="ko-shop-list__wrap">
      <!-- #ifdef MP -->
      <IndexList
        :options="productList"
        :selected="selected"
        is-selected
        :hide-prices="hidePrices"
        :extra="{type: type}"
      >
        <template #cell="{node, selected, hidePrices, extra}">
          <view class="ko-shop-list__card">
            <ProductCard
              :node="node"
              is-editor
              is-list
              :selected="selected"
              @number-change="onItemNumberChange"
              :hide-prices="hidePrices"
              :type="extra.type"
            />
          </view>
        </template>
      </IndexList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <KoTable
        :columns="getTableColumns"
        :loading="loading"
        :data="productList"
      />
      <!-- #endif -->
    </view>

    <!-- #ifdef H5 -->
    <div class="ko-shop-list__submit">
      <p class="ko-basic-money" v-if="!hidePrices">共计：{{ toYuan(getTotalMoney) }}元</p>
      <p class="ko-basic-label">已选：{{ getSelectedList.length }}</p>
      <button class="ko-basic-button" @click="onSubmit()">选好了</button>
    </div>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <view class="ko-shop-list__footer ko-basic-footer">
      <view class="ko-shop-list__footer--info">
        <!--<view><label class="ko-basic-label">已选：</label>10件</view>-->
        <view v-if="!hidePrices && getTotalMoney">
          <label class="ko-basic-label"> 共计：</label>
          <text style="color: #e43d33; font-weight: bold;"> {{ toYuan(getTotalMoney) }}元</text>
        </view>
      </view>

      <view class="button_list">
        <view v-if="false" class="ko-badge">
          <UniBadge :text="getSelectedList.length" />
        </view>
        <button v-if="false" class="ko-shop-list__footer--button look" @click="onVisible()">
          查看
        </button>
        <!-- 圆角类名：ko-shop-list__footer--button ok -->
        <button class="ko-basic-button" @click="onSubmit()">选好了</button>
      </view>
    </view>
    <BasicPopup
      :visible.sync="visible"
      type="bottom"
      title="已选产品详情"
    >
      <view class="ko-shop-list__popup">
        <view class="ko-shop-list__popup--wrap">
          <BasicCard
            class="ko-shop-list__item"
            not-padding
            v-for="(item, index) of getSelectedList"
            :key="index"
          >
            <ProductCard
              :node="item"
              :is-edit-price="!isClient"
              @change-price="onChangePrice"
              is-product-quantity
              @change-product-quantity="onItemNumberChange"
              :hide-prices="hidePrices"
            />
          </BasicCard>
        </view>
      </view>
    </BasicPopup>
    <!-- #endif -->

  </view>
</template>

<style scoped lang="scss">
.ko-shop-list {
  // #ifdef MP
  padding-top: 100px;
  // #endif

  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__header {
    // #ifdef MP
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    // #endif

    // #ifdef H5
    width: 800px;
    // #endif

    background: #FFFFFF;
    height: 100px;
  }

  &__title {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__class {
    padding: 0 10px 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }


  &__wrap {
    //padding: 0 5px;
    //display: flex;
    //align-items: center;
    //flex-wrap: wrap;
    flex: 1;
    position: relative;

    // #ifdef H5
    padding: 20px;
    // #endif
  }


  &__card {
    width: 100%;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;

    .button_list {
      display: flex;
      align-items: center;
      position: relative;

      .ko-basic-button {
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
      }

      .ko-badge {
        position: absolute;
        top: -10px;
        left: 55px;
        z-index: 9;
      }
    }

    &--button {
      background: $ko-primary-color;
      color: #FFFFFF;
      border-radius: 0;
      height: 40px;
      line-height: 40px;
      position: relative;


      &.look {
        width: 80px;
        background: #f3a73f;
        border-radius: 30px 0 0 30px;
      }

      &.ok {
        width: 90px;
        border-radius: 0 30px 30px 0;
      }
    }

    &--info {
      flex: 1;
    }
  }

  &__popup {
    width: 100vw;

    &--wrap {
      padding: 10px 16px;
      max-height: 84vh;
      overflow-y: auto;
    }

    &--list {
      display: flex;
      align-items: center;

      &--info {
        flex: 1;
      }
    }
  }

  // #ifdef H5
  &__submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex-direction: column;

    .ko-basic-label, .ko-basic-money {
      width: 100%;
      text-align: center;
      margin-top: 20px;
    }

    .ko-basic-button {
      margin-top: 30px;
      width: 260px;
    }

  }

  // #endif

}

.ko-shop {
  width: 100%;

  &__image {
    width: 100%;
    height: 150px;
    border-radius: 5px 5px 0 0;
  }

  &__info {
    padding: 0 10px 15px;

    &--name {
      font-size: 18px;
    }

    &--yuan {
      margin-top: 8px;
      color: #e43d33;

      &.edit {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }

    &--number {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
</style>
