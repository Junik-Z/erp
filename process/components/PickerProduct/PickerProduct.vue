<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _deepCopy, _get, _isEmpty, _isEqual, _set, _sum, CustomToast, getRect } from "@/utils";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";
import { PageEnums } from "@/utils/config";
import { fillCustomerPriceApi, getRecentPriceApi } from "@/api/erp/sale";
import { fillSupplierPriceApi, getPurchaseRecentPriceApi } from "@/api/erp/purchase";
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
    // 客户/供应商
    supplierId: String,
    // 客户/供应商地址
    orderAddress: String,

    // 是否回填价格
    isFill: Boolean,
    // 回填商户信息
    fillInfo: [Object],

    // 生产工单
    isWork: Boolean,

    // 隐藏总金额
    hideTotalPrices: Boolean,
  },
  data() {
    return {
      list: [],
      loading: false,

      takeOverName: "",

      itemList: {},

      fLoading: false,

      STimeVm: null,
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
            isWork: this.isWork,
          });
        },
      });
    },
    onRemove(index) {
      this.list.splice(index, 1);
      this.onFocus();
    },
    onChange(node, value) {
      this.$set(node, "price", this.toFen(value));
      this.onFocus();
    },

    // 获取选中的产品列表
    getTakList({list, total}) {
      this.list = _deepCopy(list);
      // this.totalModel = _deepCopy(this.toYuan(total));
      this.onFocus();
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

      // #ifdef MP
      getRect(`#P_${item.productId}`, this).then(rect => {
        const maxWidth = (Math.min(rect.left, rect.right) - 8) + rect.width;
        // #endif

        // 请求列表
        const RList = [
          // 显示最近销售价
          {
            func: getRecentPriceApi,
            type: "sale",
            params: {
              ...(
                _isEqual(this.type, "sale")
                  ? {supplierId: this.supplierId}
                  : {}
              ),
            },
            perm: "SALE_RECENT_PRICE",
          },
          // 显示最近采购价
          {
            func: getPurchaseRecentPriceApi,
            type: "purchase",
            params: {
              ...(
                _isEqual(this.type, "purchase")
                  ? {supplierId: this.supplierId}
                  : {}
              ),
            },
            perm: "PURCHASE_RECENT_PRICE",
          },
        ]
          .filter(v => this.isPerm(v.perm));

        const obj = _deepCopy(this.itemList);

        Promise.all(
          RList.map(v => v.func({...v.params, productId: item.productId})),
        )
          .then(res => {

            for (let i = 0; i < RList.length; i++) {
              const RItem = RList[i];
              const DItem = _get(res, `${i}.data`) || {};
              const show = !(_isEmpty(DItem.recentPrice) && _isEmpty(DItem.userRecent)) || true;
              const recent = DItem.recentPrice || {};
              const user = DItem.userRecent || {};

              const chileObj = {show, recent, user};
              _set(obj, `${item.productId}.${RItem.type}`, chileObj);
            }


            // #ifdef MP
            _set(
              obj,
              `${item.productId}.__style__`,
              {"--ko-picker-product-max-width": maxWidth + "px"},
            );
            // #endif

            this.$set(this, "itemList", obj);
          });

        // #ifdef MP
      });
      // #endif
    },

    // 隐藏
    onPriceBlur(item) {
      const obj = _deepCopy(this.itemList);
      const iObj = _get(obj, item.productId) || {};
      _set(
        obj,
        `${item.productId}`,
        {
          ...iObj,
          purchase: {
            ...iObj.purchase,
            show: false,
          },
          sale: {
            ...iObj.sale,
            show: false,
          },
        },
      );
      this.itemList = obj;
    },

    // 回填客户价格
    onFillPrice() {
      const Func = {sale: fillCustomerPriceApi, purchase: fillSupplierPriceApi}[this.type];
      if (!Func) return false;

      this.fLoading = true;
      Func({
        supplierId: this.supplierId,
        orderAddress: this.orderAddress,
        details: this.list,
      })
        .then(res => {
          const obj = res.data;
          this.list = this.list
            .map(item => ({...item, price: obj[item.productId] || item.price}));

          this.$emit("update:fill-info", {
            supplierId: _deepCopy(this.supplierId),
            orderAddress: _deepCopy(this.orderAddress),
          });

          this.onFocus();

          CustomToast({title: "价格回填成功"});
        })
        .finally(() => {
          this.fLoading = false;
        });
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

    // 是否显示最近价格
    isShowPrice() {
      return (id) => {
        const obj = _get(_deepCopy(this.itemList), id);
        return obj && (_get(obj, "sale.show") || _get(obj, "purchase.show"));
      };
    },
    // 是否显示两个价格
    isTwoPrice() {
      return (id) => {
        const obj = _get(_deepCopy(this.itemList), id);
        return obj && (_get(obj, "sale.show") && _get(obj, "purchase.show"));
      };
    },

    showFillText() {
      return {sale: "回填上次售价", purchase: "回填上次采购价"}[this.type];
    },

    // #ifdef H5
    getTableColumns() {
      const col = [
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
                  src: this.getImageUrl(_get(row, "images")),
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
        {
          label: "数量",
          prop: "productQuantity",
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.productQuantity);
            return h(
              "el-input-number",
              {
                class: "ko-basic-money",
                style: {cursor: "pointer", width: "100%"},
                props: {
                  value: row.productQuantity || 0,
                  min: 0,
                },
                on: {
                  change: (val) => {
                    this.$set(row, "productQuantity", val);
                    this.$nextTick(() => {
                      this.onFocus();
                    });
                  },
                },
              },
            );
          },
        },
        {
          label: "单价(元)",
          prop: "price",
          render: (h, {row}) => {
            if (this.isClient || this.readonly || this.isWork) {
              return h(
                "label",
                {class: "ko-basic-money"},
                [this.toYuan(row.price)],
              );
            } else {
              return h("el-popover", {
                  props: {
                    placement: "top",
                    trigger: "manual",
                    value: this.isShowPrice(row.productId),
                    width: 260,
                  },
                },
                [
                  h(LatestPrice, {
                    slot: "default",
                    props: {
                      node: _get(this.itemList, `${row.productId}`),
                    },
                  }),
                  h(
                    "el-input-number",
                    {
                      slot: "reference",
                      class: "ko-basic-money",
                      style: {cursor: "pointer", width: "100%"},
                      props: {
                        min: 0,
                        value: this.toYuan(row.price),
                      },
                      on: {
                        change: (val) => {
                          this.$set(row, "price", this.toFen(val));
                          this.$nextTick(() => {
                            this.onFocus();
                          });
                        },
                        focus: () => {
                          this.STimeVm && clearTimeout(this.STimeVm);
                          this.STimeVm = setTimeout(() => {
                            this.onPriceFocus(row);
                          }, 300);
                        },
                        blur: () => {
                          this.onPriceBlur(row);
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
          label: "备注",
          prop: "remark",
          render: (h, {row}) => {
            if (this.readonly) return h("span", row.remark);

            return h(
              "el-input",
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
                    this.$set(row, "remark", val);

                    this.$nextTick(() => {
                      this.onFocus();
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
      ]
        .filter(item => !(this.hidePrices && _isEqual(item.prop, "price")));

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
                <text class="ko-basic-money" v-if="isClient || readonly || isWork">{{ toYuan(item.price) }} 元</text>
                <view v-else class="ko-basic-money" style="display: flex; align-items: center;">
                  <view
                    :style="[GET_FUNC(itemList, `${item.productId}.__style__`) || {}]"
                    style="margin-right: 5px; position: relative;"
                  >
                    <view
                      :class="{'is-show': isShowPrice(item.productId), 'is-show-two': isTwoPrice(item.productId)}"
                      class="ko-picker__price ko-basic-box-shadow"
                      v-if="isShowRecent"
                    >
                      <LatestPrice :node="GET_FUNC(itemList, `${item.productId}`)" />
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
            <UniCol :span="24" v-if="isTkCustom">
              <view style="display: flex; align-items: center;">
                <label class="ko-basic-label">备注：</label>
                <uni-easyinput
                  v-if="!readonly"
                  v-model.trim="item.remark"
                  placeholder="请输入备注"
                  maxlength="7"
                />
                <text v-else>{{ item.remark }}</text>
              </view>
            </UniCol>
            <UniCol :span="24" v-if="!readonly">
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

    <view
      style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;"
      v-if="!isNotAdded && !readonly"
    >
      <button class="ko-basic-button__card" @click="onAdded()">添加</button>

      <button
        class="ko-basic-button__card"
        v-if="isFill && supplierId && list.length"
        @click="onFillPrice"
        :loading="fLoading"
        :disabled="fLoading"
      >
        {{ showFillText }}
      </button>
    </view>

    <view style="margin-top: 10px;" v-if="getTotalMoney !== 0 && !hidePrices && !hideTotalPrices">
      <view style="margin-top: 4px;">
        <label class="ko-basic-label">合计：</label>
        <text class="ko-basic-money"> {{ toYuan(getTotalMoney) }}元</text>
      </view>

      <view
        style="margin-top: 10px; display: flex; align-items: center;"
        v-if="isActual && !isClient"
      >
        <label class="ko-basic-label">实付金额：</label>
        <UniEasyinput
          type="digit"
          @blur="onBlur"
          v-model="totalModel"
          placeholder="请输入实付金额"
        />
        <text style="margin-left: 8px">元</text>
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
    align-items: flex-start;
    //overflow: hidden;

    &--image {
      height: 80px;
      width: 80px;
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
    left: 48%;
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

    &.is-show-two {
      width: 70vw;
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
      left: 48%;
      background: #fff;
    }
  }
}
</style>
