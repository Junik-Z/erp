<script>
// #ifdef H5
import { Input, InputNumber, Popover } from "@/uni_modules/element-ui/element.min";

// #endif
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _set, _sum, getRect } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { PageEnums } from "@/utils/config";
import { getRecentPriceApi } from "@/api/erp/sale";
import { getPurchaseRecentPriceApi } from "@/api/erp/purchase";
import LatestPrice from "./LatestPrice";


export default {
  name: "PickerProduct",
  components: {
    UniEasyinput,
    UniNumberBox,
    LoadMore,
    BasicCard,
    UniCol,
    UniRow,
    LatestPrice,
  },
  mixins: [mixins],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    total: [String, Number],
    type: String, // 选择类型 purchase: 采购；sale: 销售
    isClient: Boolean, // 客户输入
    isNotAdded: Boolean,
    hidePrices: Boolean,
    // 实际付款金额
    isActual: Boolean,
    readonly: Boolean,
    // 显示最近的价格
    isShowRecent: Boolean,
    supplierId: String,
  },
  data() {
    const _this = this;
    return {
      list: [],
      loading: false,

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 55,
        },
        {
          label: "产品图片",
          prop: "images",
          width: 80,
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "images")),
                  size: 38,
                  text: _get(row, "images"),
                  shape: "square",
                },
              })],
            );
          },
        },
        {
          label: "产品名称",
          prop: "name",
        },
        /* {
          label: "产品分类",
          prop: "className",
        }, */
        {
          label: "单价(元)",
          prop: "price",
          render: (h, {row}) => {
            if (_this.isClient || _this.readonly) {
              return h(
                "label",
                {class: "ko-basic-money"},
                [_this.toYuan(row.price)],
              );
            } else {
              return h(Popover, {
                  props: {
                    placement: "top",
                    trigger: "manual",
                    value: _get(_this.itemList, `${row.productId}.__show__`),
                  },
                },
                [
                  h(LatestPrice, {
                    slot: "default",
                    props: {
                      type: _this.type,
                      recentPrice: _get(_this.itemList, `${row.productId}.recentPrice`),
                      userRecent: _get(_this.itemList, `${row.productId}.userRecent`),
                    },
                  }),
                  h(
                    InputNumber,
                    {
                      slot: "reference",
                      class: "ko-basic-money",
                      style: {cursor: "pointer", width: "100%"},
                      props: {
                        min: 0,
                        value: _this.toYuan(row.price),
                      },
                      on: {
                        change: (val) => {
                          _this.$set(row, "price", _this.toFen(val));
                          _this.$nextTick(() => {
                            _this.onFocus();
                          });
                        },
                        focus: () => {
                          _this.onPriceFocus(row);
                        },
                        blur: () => {
                          _this.onPriceBlur(row);
                        },
                      },
                    },
                  ),
                ],
              );
            }
          },
        },
        {
          label: "数量",
          prop: "productQuantity",
          render: (h, {row}) => {
            if (_this.readonly) return h("span", row.productQuantity);

            return h(
              InputNumber,
              {
                class: "ko-basic-money",
                style: {cursor: "pointer", width: "100%"},
                props: {
                  value: row.productQuantity,
                  min: 0,
                },
                on: {
                  change: (val) => {
                    _this.$set(row, "productQuantity", val);
                    _this.$nextTick(() => {
                      _this.onFocus();
                    });
                  },
                },
              },
            );
          },
        },
        {
          label: "备注",
          prop: "remark",
          render: (h, {row}) => {
            if (_this.readonly) return h("span", row.remark);

            return h(
              Input,
              {
                style: {width: "100%"},
                props: {
                  value: row.remark,
                },
                attrs: {
                  maxlength: 7,
                  showWordLimit: true,
                },
                on: {
                  input: (val) => {
                    _this.$set(row, "remark", val);

                    _this.$nextTick(() => {
                      _this.onFocus();
                    });
                  },
                },
              },
            );
          },
        },
        {
          label: "操作",
          slot: "operate",
          width: 80,
        },
      ],
      // #endif

      takeOverName: "",

      recentPrice: {},
      userRecent: {},

      itemList: {},
    };
  },
  created() {
    this.takeOverName = `$_on_tak_over_${this._uid}`;
    uni.$on(this.takeOverName, this.getTakList);
  },
  methods: {
    onAdded() {
      uni.navigateTo({
        url: PageEnums.pickerProduct,
        // #ifdef MP
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          on_take_over: (obj) => {
            this.getTakList(obj);
          },
        },
        // #endif
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit("on_to_take_over", {
            list: this.list,
            type: this.type,
            isClient: this.isClient,
            hidePrices: this.hidePrices,
            takeOverName: this.takeOverName,
          });
        },
      });
    },
    onRemove(index) {
      this.list.splice(index, 1);
      this.$emit("input", this.list);
    },
    onChange(node, value) {
      this.$set(node, "price", this.toFen(value));
      this.onFocus();
    },

    // 获取选中的产品列表
    getTakList({list, total}) {
      this.list = _deepCopy(list);
      this.totalModel = _deepCopy(this.toYuan(total));
      this.$emit("input", _deepCopy(list));
    },

    onFocus() {
      this.totalModel = this.toYuan(_deepCopy(this.getTotalMoney));

      this.$emit("input", _deepCopy(this.list));

      // this.$emit("update:total", this.toYuan(_deepCopy(this.getTotalMoney)));
    },

    onBlur(event) {
      let value = event.detail.value;
      if (isNaN(value)) {
        uni.showToast({title: "请输入数字", icon: "none"});
        this.onFocus();
        return false;
      }
      value = +value;
      if (value > this.getTotalMoney) {
        uni.showToast({title: "实付金额不能大于总金额", icon: "none"});
        this.onFocus();
      }
    },

    // 获取到的请求最近成交价格
    onPriceFocus(item) {
      if (!this.isShowRecent) return false;

      const Func = {purchase: getPurchaseRecentPriceApi, sale: getRecentPriceApi}[this.type];

      if (!Func) return false;

      // #ifdef MP
      getRect(`#P_${item.productId}`, this).then(rect => {
        const maxWidth = (Math.min(rect.left, rect.right) - 20) + rect.width;
        // #endif

        Func({productId: item.productId, supplierId: this.supplierId})
          .then(res => {
            const data = res.data;

            const obj = _deepCopy(this.itemList);
            const show = !(_isEmpty(data.recentPrice) && _isEmpty(data.userRecent));

            _set(obj, `${item.productId}.__show__`, show);
            _set(obj, `${item.productId}.recentPrice`, data.recentPrice);
            _set(obj, `${item.productId}.userRecent`, data.userRecent);

            // #ifdef MP
            _set(obj, `${item.productId}.__style__`, {
              "--ko-picker-product-max-width": maxWidth + "px",
            });
            // #endif

            this.itemList = obj;

            console.log(obj);
          });

        // #ifdef MP
      });
      // #endif
    },

    // 隐藏
    onPriceBlur(item) {
      const obj = _deepCopy(this.itemList);
      _set(obj, `${item.productId}.__show__`, false);
      this.itemList = obj;
    },
  },
  watch: {
    value: {
      handler(val) {
        this.list = _deepCopy(val);
      },
      immediate: true,
      deep: true,
    },
    list: {
      handler(val) {
        // this.$emit("input", _deepCopy(val));
      },
      deep: true,
    },
  },
  computed: {
    getTotalMoney() {
      return _sum(this.list?.map(item => ((item.price || 0) * (item.productQuantity || 0)) || 0));
    },

    totalModel: {
      get() {
        return this.total;
      },
      set(val) {
        this.$emit("update:total", val);
      },
    },

    // #ifdef H5
    getTableColumns() {
      const col = this.columns?.filter(item => !(this.hidePrices && _isEqual(item.prop, "price")));

      // 如果是天科的则需要显示备注
      return col.filter(item => _isEqual(item.prop, "remark") ? this.isTkCustom : true);
    },
    // #endif
  },
  onUnload() {
    uni.$off(this.takeOverName, this.getTakList);
  },
  beforeDestroy() {
    uni.$off(this.takeOverName, this.getTakList);
  },
};
</script>

<template>
  <view class="ko-picker">
    <!-- #ifdef MP -->
    <BasicCard v-for="(item, index) of list" :key="index" :spacing="10">
      <view class="ko-picker__node">
        <image
          v-if="item.images"
          mode="scaleToFill"
          class="ko-picker__node--image"
          :src="getImageUrl(item.images)"
        />
        <view class="ko-picker__item">
          <UniRow :gutter="10">
            <UniCol :span="24">
              <label class="ko-basic-label">名称：</label>
              {{ item.name }}
            </UniCol>
            <UniCol :span="24" v-if="!hidePrices">
              <view class="ko-picker__node--price">
                <label class="ko-basic-label">单价：</label>
                <text class="ko-basic-money" v-if="isClient || readonly">{{ toYuan(item.price) }} 元</text>
                <view v-else class="ko-basic-money" style="display: flex; align-items: center;">
                  <view
                    :style="[GET_FUNC(itemList, `${item.productId}.__style__`) || {}]"
                    style="margin-right: 5px; position: relative;"
                  >
                    <view
                      :class="{'is-show': GET_FUNC(itemList, `${item.productId}.__show__`)}"
                      class="ko-picker__price ko-basic-box-shadow"
                      v-if="isShowRecent"
                    >
                      <LatestPrice
                        :type="type"
                        :recent-price="GET_FUNC(itemList, `${item.productId}.recentPrice`)"
                        :user-recent="GET_FUNC(itemList, `${item.productId}.userRecent`)"
                      />
                    </view>

                    <view :id="`P_${item.productId}`">
                      <UniNumberBox
                        color="#e43d33"
                        width="60"
                        :value="toYuan(item.price)"
                        @change="onChange(item, $event)"
                        type="digit"
                        @focus="onPriceFocus(item)"
                        @blur="onPriceBlur(item)"
                      />
                    </view>
                  </view>
                  元
                </view>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view style="display: flex; align-items: center;">
                <label class="ko-basic-label">数量：</label>
                <UniNumberBox
                  v-if="!readonly"
                  type="digit"
                  width="60"
                  v-model="item.productQuantity"
                  @change="onFocus"
                />
                <text v-else>{{ item.productQuantity }}</text>
              </view>
            </UniCol>
            <UniCol :span="24" v-if="!isNotAdded && !readonly">
              <view style="display: flex;justify-content: flex-end; align-items: center; margin-top: 8px;">
                <button class="ko-basic-button__card" @click="onRemove(index)">
                  移除
                </button>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </view>
    </BasicCard>
    <LoadMore v-if="!list.length" :no-more="true" content-text="暂无产品数据" />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <KoTable
      :columns="getTableColumns"
      :loading="loading"
      :data="list"
    >
      <template #operate="{item, index}">
        <view v-if="!readonly" style="display: flex;justify-content: center; align-items: center;">
          <button class="ko-basic-button__card" @click="onRemove(index)">
            移除
          </button>
        </view>
      </template>
    </KoTable>
    <!-- #endif -->

    <view style="display: flex; align-items: center; margin-top: 8px;" v-if="!isNotAdded && !readonly">
      <button class="ko-basic-button__card" @click="onAdded()">添加</button>
    </view>

    <view style="margin-top: 10px;" v-if="getTotalMoney !== 0 && !hidePrices">
      <view style="margin-top: 4px;">
        <label class="ko-basic-label">产品总额：</label>
        <text class="ko-basic-money"> {{ toYuan(getTotalMoney) }}元</text>
      </view>

      <view style="margin-top: 10px; display: flex; align-items: center;" v-if="isActual && !isClient">
        <label class="ko-basic-label">实付金额：</label>
        <UniEasyinput
          type="digit"
          @blur="onBlur"
          v-model="totalModel"
          placeholder="请输入实付金额"
        />
        <text style="margin-left: 8px">元</text>
      </view>

      <view style="margin-top: 4px;" v-if="false">
        <label class="ko-basic-label">总额大写：</label>
        <text class="ko-basic-money"> {{ toBigMoney(toYuan(getTotalMoney)) }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-picker {
  width: 100%;

  &__item {
    flex: 1;
    padding-left: 10px;
  }

  &__node {
    display: flex;
    align-items: center;
    //overflow: hidden;

    &--image {
      height: 120px;
      width: 120px;
      border-radius: 6px;
      overflow: hidden;
    }

    &--price {
      display: flex;
      align-items: center;
      position: relative;
    }
  }

  &__price {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    bottom: calc(100% + 5px);
    color: #333;
    width: var(--ko-picker-product-max-width);
    border: 1px solid #e9e9eb;
    opacity: 0;

    transition: opacity .3s;
    z-index: 99;
    font-size: 11px;

    &.is-show {
      opacity: 1;
    }

    &::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      border: 1px solid #e9e9eb;
      border-top: none;
      border-right: none;
      transform: rotate(-45deg) translateX(-50%);

      position: absolute;
      bottom: -2px;
      left: 50%;
      background: #fff;
    }
  }
}
</style>
