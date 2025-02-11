<script>
// #ifdef H5
import { Checkbox, InputNumber, Tree } from "@/uni_modules/element-ui/element.min";
// #endif
import { getProductClassApi, getProductFieldApi, getProductListApi } from "@/api/erp/product";
import UniSearchBar from "@/uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import mixins from "@/mixins/mixins";
import UniNumberBox from "@/uni_modules/uni-number-box/components/uni-number-box/uni-number-box.vue";
import UniBadge from "@/shop/components/uni-badge/components/uni-badge/uni-badge.vue";
import { _deepCopy, _get, _isEmpty, _isEnv, _isEqual, _isObject, _sum, CustomToast } from "@/utils";
import BasicPopup from "@/components/BasicPopup/BasicPopup.vue";
import PickerClass from "@/components/PickerClass/PickerClass.vue";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import IndexList from "@/components/IndexList/IndexList.vue";
import { checkInOutOrderApi, getCheckListApi } from "@/api/erp/stock";

export default {
  name: "list",
  onLoad(option) {
    this.isJudge = _isEqual(option.judge, "true");

    this.getFieldList();

    if (_isEnv()) {
      // this.setShopList({isSelect: true});
    }

    if (this.isJudge) {
      this.type = "purchase";
      this.getList();
      // #ifdef H5
      this.getClassList();
      // #endif
    }

    const EC = this.getOpenerEventChannel();
    EC?.on?.("on_to_take_over", (obj) => {
      // #ifdef H5
      sessionStorage.setItem("TAKE_OVER", JSON.stringify(obj));
      // #endif

      // #ifdef MP
      this.setShopList(obj);
      // #endif
    });

    uni.setNavigationBarTitle({title: this.isJudge ? "库存盘点" : "选择产品"});

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
        pageSize: 20,
        pageNum: 0,
        nameIndex: "",
      },
      className: [],
      // 获取商品列表
      list: [],

      // 已经选好的产品
      selected: {},
      visible: false,

      // 选择类型 purchase: 采购；sale: 销售
      type: null,

      // 生产工单
      isWork: false,

      // 是否是客户
      isClient: false,
      // 是否隐藏价格
      hidePrices: true,

      takeOverName: "",

      loading: false,

      fieldList: [],

      // 外部传入的列表
      EXList: [],

      classList: [],

      // 是否是盘点库存
      isJudge: false,

      noMore: false,
      sLoading: false,

      tableKey: +new Date().getTime(),

      // 选择模式
      isSelect: false,
      // 是否多选
      multiple: false,

      checked: [],
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
    // #ifdef H5
    Tree,
    // #endif
  },
  methods: {
    // 外部传入的商品列表
    setShopList(data = {}) {
      const list = _deepCopy(data?.list || []);
      this.type = data?.type;

      this.isClient = data?.isClient;
      this.isWork = data?.isWork;
      this.hidePrices = data?.hidePrices;
      this.takeOverName = data?.takeOverName;

      this.isSelect = data?.isSelect;
      this.multiple = data?.multiple;

      this.EXList = list;
      list.forEach(item => {
        this.$set(this.selected, item.productId, item);
      });

      // 必须在这里调用，否则将判断不了上下架状态
      this.getList();
      // #ifdef H5
      this.getClassList();
      // #endif
    },

    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        this.fieldList = res.data;
        uni.$__FIELD_LIST__ = res.data;
      });
    },

    // 获取商品列表
    getList(reset = false) {

      if (reset) {
        this.list = [];
        this.queryList.pageNum = 0;
        this.tableKey = +new Date().getTime();
      }

      this.loading = true;
      const params = {
        purchase: {purchaseOff: false},
        sale: {saleOff: false},
      }[this.type];

      const Func = this.isJudge ? getCheckListApi : getProductListApi;

      // 盘点的不需要区分上下架
      Func({...this.queryList, ...(this.isJudge ? {} : params)})
        .then(res => {
          const list = res.data
            .map(item => {
              const obj = {
                ...item,
                productId: item.id,
              };
              if (this.isJudge) {
                this.onItemNumberChange(obj, obj.quantity);
              }
              return obj;
            });

          this.list = this.onMergeArrays(this.list, list, "productId");
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .catch(() => {
          this.noMore = true;
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
          productQuantity: val || 0,
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

      const list = _deepCopy(Object.values(this.selected));

      if (this.isJudge) {
        const details = (list || []).filter(item => !!this.list.find(v => _isEqual(v.productId, item.productId) && !_isEqual(v.quantity, item.productQuantity)));

        if (details.length <= 0) {
          CustomToast({title: "您还未盘点选任何产品", icon: "none"});
          return false;
        }

        uni.showModal({
          title: "温馨提示",
          content: "请仔细核对您的盘点数量，确保所有数据准确无误。",
          success: (res) => {
            if (res.confirm) {
              this.sLoading = true;
              checkInOutOrderApi({details})
                .then(() => {
                  CustomToast({
                    title: "提交成功",
                    success() {
                      uni.navigateBack({});
                    },
                  });
                })
                .finally(() => {
                  this.sLoading = false;
                });
            }
          },
        });

        return false;
      }

      const total = _deepCopy(this.getTotalMoney);

      const params = {
        list,
        total,
        checked: this.checked,
      };

      // #ifndef H5
      const EC = this.getOpenerEventChannel();
      EC?.emit?.("on_take_over", params);
      // #endif

      // #ifdef H5
      uni.$emit(this.takeOverName, params);
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

    onCancel() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.getList(true);
        });
      });
    },

    onLower() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },
    // 根据索引搜索
    onSearchToNameIndex(key) {
      this.queryList.nameIndex = key;
      this.getList(true);
    },

    // 点击行
    onSelect(event) {
      if (!this.isSelect) return false;

      // 是否已经选中
      const isCheck = this.isChecked(event);

      if (this.multiple) {
      } else {
        this.$set(this, "checked", isCheck ? [] : [event]);
      }
    },

    // #ifdef H5
    // 获取产品粉来
    getClassList() {
      const params = {
        purchase: {purchaseOff: false},
        sale: {saleOff: false},
      }[this.type];

      // 盘点不需要传上下架数据
      getProductClassApi({...(this.isJudge ? {} : params), pageNum: 0, pageSize: 1000})
        .then(res => {
          this.classList = res.data;
          uni.$__product_class_list__ = res.data;
        });
    },

    onCheck(node) {
      console.log(node);
      if (_isEqual(this.queryList.classId, node.id)) {
        this.queryList.classId = "";
        this.$refs.TreeRef.setCheckedKeys([]);
      } else {
        this.queryList.classId = node.id;
        this.$refs.TreeRef.setCheckedKeys([node.id]);
      }

      this.$nextTick(() => {
        this.getList(true);
      });
    },
    // #endif
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

    // 是否已经被选中
    isChecked() {
      return (it) => {
        return this.checked?.some(item => _isEqual(_isObject(item) ? item.id : item, it.id));
      };
    },

    // 获取索引列表选中的产品id
    getIndexCheckedIds() {
      return this.checked.map(v => v.id);
    },

    // #ifdef H5
    getTableData() {
      return Object.values(this.selected || {});
    },

    getTableColumns() {
      const before = [
        {
          label: "序号",
          type: "index",
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
          label: "单价",
          prop: "price",
          fixed: "right",
          width: 220,
          render: (h, {row}) => {
            const item = _get(this.selected, `${row.productId}`) || {};
            const price = item?.price || _get(row, this.getMoneyKey);

            if (this.isClient || this.isWork) {
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
          label: this.isJudge ? "盘点数量" : "数量",
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
      ]?.filter(item => {
        // 盘点不需要显示价格
        if (this.isJudge) return !_isEqual(item.prop, "price");

        return !(this.hidePrices && _isEqual(item.prop, this.getMoneyKey));
      });

      const judge = [];

      if (this.isJudge) {
        judge.push({
          label: "库存预警数量",
          prop: "stockWarning",
          render: (h, {row}) => {
            return h("label", {class: "ko-basic-money"}, [row.stockWarning]);
          },
        });
      }

      return [
        ...before,
        ...fieldList,
        ...judge,
        ...(this.isSelect
          ? [
            {
              label: "选择",
              width: 55,
              render: (h, {row}) => {
                return h("span", {class: "ko-table-checked__warp"}, [
                  h(
                    Checkbox,
                    {
                      class: `ko-table-checked ${!this.multiple ? "ko-table-checked__single" : ""}`,
                      props: {
                        value: this.isChecked(row),
                      },
                    },
                  ),
                ]);
              },
            },
          ]
          : after),
      ];
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
        <view style="flex: 1;">
          <UniSearchBar
            @confirm="getList(true)"
            @cancel="onCancel"
            v-model="queryList.name"
            placeholder="产品名称"
            clear-button="none"
          />
        </view>
        <!-- #ifdef MP -->
        <view class="ko-shop-list__class">
          <PickerClass watch-type :type="type" v-model="queryList.classId" @change="getList(true)" />
        </view>
        <!-- #endif -->
      </view>
      <!-- #ifdef H5 -->
    </div>
    <!-- #endif -->

    <view class="ko-shop-list__wrap">
      <!-- #ifdef MP -->
      <IndexList
        :data="list"
        :selected="selected"
        is-selected
        :hide-prices="hidePrices"
        :extra="{type: type}"
        :safe-area-inset-bottom="false"
        :loading="loading"
        @number-change="onItemNumberChange"
        :is-judge="isJudge"
        v20241216
        :is-work="isWork"


        @lower="onLower"
        :no-more="noMore"
        @search="onSearchToNameIndex"

        :value="getIndexCheckedIds"
        :is-checked="isSelect"
        @click="onSelect"
      >
        <!-- <template #cell="{node, selected, hidePrices, extra}">
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
         </template>-->
      </IndexList>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <div class="ko-shop-list__center" style="flex: 1; height: 100%;">
        <div style="height: 100%; overflow-y: auto">
          <Tree
            node-key="id"
            ref="TreeRef"
            :data="classList"
            :show-checkbox="true"
            :props="{label: 'name'}"
            check-strictly
            :default-checked-keys="[queryList.classId]"
            @check="onCheck"
            style="min-height: 100%;"
          />
        </div>
        <div style="height: 100%; overflow: hidden; flex: 1;">
          <KoTable
            :key="tableKey"
            :columns="getTableColumns"
            :loading="loading"
            :data="list"
            @next-load="onLower"
            :no-more="noMore || loading"
            @row-click="onSelect"
          />
        </div>
      </div>
      <!-- #endif -->
    </view>

    <!-- #ifdef H5 -->
    <div class="ko-shop-list__submit">
      <div style="display: flex;align-items: center; justify-content: center;">
        <p style="width: 100%; white-space: nowrap; margin-right: 40px" class="ko-basic-label" v-if="!isJudge">
          已选：{{ isSelect ? checked.length : getSelectedList.length }}</p>
        <p style="width: 100%; white-space: nowrap;" class="ko-basic-money" v-if="!hidePrices && !isJudge && !isSelect">
          共计：{{ toYuan(getTotalMoney) }}元</p>
      </div>
      <button class="ko-basic-button" @click="onSubmit()" :lodaing="sLoading" :disabled="sLoading">
        {{ isJudge ? "提交" : "选好了" }}
      </button>
    </div>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <view class="ko-shop-list__footer ko-basic-footer">
      <view class="ko-shop-list__footer--info">
        <view v-if="isSelect">
          <label class="ko-basic-label">已选：</label>
          {{ isSelect ? checked.length : getSelectedList.length }}
        </view>
        <view v-if="!hidePrices && getTotalMoney && !isJudge">
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
        <button class="ko-basic-button" @click="onSubmit()" :lodaing="sLoading" :disabled="sLoading">
          {{ isJudge ? "提交" : "选好了" }}
        </button>
      </view>
    </view>
    <!--<BasicPopup
      :visible.sync="visible"
      type="bottom"
      title="已选产品详情"
    >
      <view class="ko-shop-list__popup">
        <view class="ko-shop-list__popup&#45;&#45;wrap">
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
    </BasicPopup>-->
    <!-- #endif -->

  </view>
</template>

<style scoped lang="scss">
.ko-shop-list {
  // #ifdef MP
  height: 100vh;
  // #endif

  // #ifdef H5
  padding-bottom: 20px;
  height: calc(100vh - 50px);
  // #endif

  display: flex;
  flex-direction: column;

  &__header {
    padding-right: 10px;

    // #ifdef MP
    display: flex;
    align-items: center;
    // #endif

    // #ifdef H5
    width: 800px;
    height: 56px;
    // #endif
    background: #FFFFFF;
  }

  &__title {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__class {
    padding: 0;
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
    overflow: hidden;
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
    }

    .ko-basic-button {
      margin-top: 10px;
      width: 260px;
    }

  }

  &__center {
    display: flex;
    overflow: hidden;

    /deep/ .el-tree {
      width: 260px;
      margin-right: 20px;
      border: 1px solid #EBEEF5;
      padding: 10px;

      .el-checkbox {
        margin-right: 6px;
      }
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

/deep/ .ko-table-checked {
  font-size: 20px;

  &__warp {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
      cursor: pointer;
    }

  }

  &__single .el-checkbox__inner {
    border-radius: 50%;
  }

  .el-checkbox__inner {
    width: 20px;
    height: 20px;

    &::after {
      width: 5px;
      height: 10px;
      left: 6px;
    }
  }
}
</style>
