<script>
import { getProductClassApi, getProductListApi } from "@/api/erp/product";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import UniDataPicker from "@/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/shop/components/uni-number-box/components/uni-number-box/uni-number-box.vue";
import UniBadge from "@/shop/components/uni-badge/components/uni-badge/uni-badge.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _sum } from "@/utils";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";

export default {
  name: "list",
  onLoad(option) {
    console.log(option);
    this.getClassList();
    this.getList();

    const EC = this.getOpenerEventChannel();
    EC?.on?.("setShopList", this.setShopList);
  },
  mixins: [mixins],
  data() {
    return {
      classList: [],
      queryList: {
        classId: "",
        name: "",
      },
      className: [],
      // 获取商品列表
      productList: [],

      list: [],

      // 已经选好的产品
      selected: {},
      visible: false,

      type: null,
    };
  },
  components: {UniListItem, UniList, BasicPopup, UniBadge, UniNumberBox, BasicCard, UniDataPicker, UniSearchBar},
  methods: {
    // 外部传入的商品列表
    setShopList(data) {
      const list = data.list || [];
      this.type = data.type;
      list.forEach(item => {
        this.$set(this.selected, item.productId, item);
      });
    },

    // 获取产品分类
    getClassList() {
      getProductClassApi()
        .then(res => {
          this.classList = res.data;
        });
    },

    // 获取商品列表
    getList() {
      getProductListApi(this.queryList)
        .then(res => {
          this.productList = res.data;
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

      if (_isEmpty(_get(this.selected, item.id))) {
        this.$set(this.selected, item.id, {
          name: item.name,
          classId: item.classId,
          levelIds: item.levelIds,
          productId: item.id,
          images: item.images,
          price: _get(item, this.getMoneyKey),
          productQuantity: val,
          extend: item.extend,
        });
      } else {
        this.$set(this.selected[item.id], "productQuantity", val);
      }
    },

    // 修改购买购买单价
    onChangePrice(node, val) {
      const item = _deepCopy(node);
      this.$set(this.selected[item.id], "price", val);
    },

    // 点击选好了
    onSubmit() {
      const EC = this.getOpenerEventChannel();
      EC.emit("getShopList", {list: this.getSelectedList, total: this.getTotalMoney});

      uni.navigateBack({});
    },
  },
  computed: {
    // 获取已选的件数
    getSelectNumber() {
      return (item) => {
        return _get(this.selected, `${item.id}.productQuantity`) || 0;
      };
    },

    // 获取已经选的产品列表
    getSelectedList() {
      return Object.values(this.selected || {}).filter(item => item.productQuantity > 0) || [];
    },

    // 获取总金额
    getTotalMoney() {
      return _sum(this.getSelectedList?.map(item => (item.price * item.productQuantity)) || 0);
    },

    getMoneyKey() {
      return _isEqual("purchase", this.type) ? "purchasePrice" : "salePrice";
    },

    getPrice() {
      return (item) => {
        return _get(item, this.getMoneyKey) || 0;
      };
    },
  },
};
</script>

<template>
  <view class="ko-shop-list">
    <view class="ko-shop-list__header">
      <UniSearchBar v-model="queryList.name" placeholder="请输入产品名称" />
      <view class="ko-shop-list__class">
        <view style="margin-right: 10px;">
          <label class="ko-basic-label" v-for="(item, index) of className" :key="item">
            <text>{{ item }}</text>
            <text style="margin: 0 5px" v-if="index < className.length - 1">/</text>
          </label>
        </view>
        <UniDataPicker
          popup-title="选择产品分类"
          placeholder="请选择"
          :localdata="classList"
          v-model="queryList.classId"
          :map="{text: 'name',value: 'id',}"
          @change="onChangeClass"
        >
          <template>
            <button class="ko-basic-button__card">选择分类</button>
          </template>
        </UniDataPicker>
      </view>
    </view>

    <view class="ko-shop-list__wrap">
      <BasicCard
        class="ko-shop-list__item"
        v-for="(item, index) of productList"
        :key="index"
        not-padding
      >
        <view class="ko-shop">
          <image
            class="ko-shop__image"
            :src="getImageUrl(item.images)"
            mode="scaleToFill"
          />

          <view class="ko-shop__info">
            <view class="ko-shop__info--name">
              {{ item.name }}
            </view>
            <view class="ko-shop__info--yuan">
              ¥ {{ toYuan(getPrice(item)) }}元
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
    </view>

    <view class="ko-shop-list__footer ko-basic-footer">
      <view class="ko-shop-list__footer--info">
        <!--<view><label class="ko-basic-label">已选：</label>10件</view>-->
        <view>
          <label class="ko-basic-label"> 共计：</label>
          <text style="color: #e43d33; font-weight: bold;">¥ {{ toYuan(getTotalMoney) }}元</text>
        </view>
      </view>

      <view class="button_list">
        <view class="ko-badge">
          <UniBadge :text="getSelectedList.length" />
        </view>
        <button class="ko-shop-list__footer--button look" @click="visible = true">
          查看
        </button>
        <button class="ko-shop-list__footer--button ok" @click="onSubmit">选好了</button>
      </view>
    </view>

    <BasicPopup :visible.sync="visible" type="bottom">
      <view class="ko-shop-list__popup">
        <view class="ko-shop-list__popup--wrap">
          <BasicCard
            class="ko-shop-list__item"
            not-padding
            v-for="(item, index) of getSelectedList"
            :key="index"
          >
            <view class="ko-shop">
              <image
                class="ko-shop__image"
                :src="getImageUrl(item.images)"
                mode="scaleToFill"
              />
              <view class="ko-shop__info">
                <view class="ko-shop__info--name">
                  {{ item.name }}
                </view>
                <view class="ko-shop__info--yuan edit ko-basic-money">
                  ¥
                  <text v-if="false">{{ toYuan(item.price) }}</text>
                  <UniNumberBox
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
                  件
                </view>
              </view>
            </view>
          </BasicCard>
        </view>
      </view>
    </BasicPopup>
  </view>
</template>

<style scoped lang="scss">
.ko-shop-list {
  padding-top: 100px;

  &__header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    height: 100px;
    z-index: 100;
  }

  &__class {
    padding: 0 10px 15px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__wrap {
    padding: 0 5px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  &__item {
    width: calc(50% - 10px);
    margin: 5px;
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
      padding: 0 5px;
      max-height: 84vh;
      overflow-y: auto;

      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
  }
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
