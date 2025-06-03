<script>
import { _get, _isEmpty, _isEqual, _sum } from "@/utils";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import mixins from "@/mixins/mixins";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { getProduceDetailApi, getProduceOrderCodeDetailApi, getProduceOrderDetailApi } from "@/api/erp/produce";
import { getProductFieldApi } from "@/api/erp/product";
import FeesList from "./components/FeesList.vue";
import CraftProcesses from "./pages/CraftProcesses.vue";
import BinPacking from "./pages/BinPacking.vue";
import CustomFiles from "./pages/CustomFiles.vue";
import BinCount from "./components/BinCount.vue";
import { getPurchaseInfoApi } from "@/api/erp/purchase";

export default {
  name: "DetailsOrder",
  mixins: [mixins],
  components: {
    BinCount,
    CustomFiles,
    BinPacking,
    FeesList,
    UvAvatar,
    UniCol,
    UniRow,
    ProductCard,
    UniSection,
    CraftProcesses,
  },
  onLoad(option) {
    this.option = option;
    // 销售订单
    this.isSale = _isEqual(this.option.FORM, "SALE");
    // 采购订单
    this.isPurchase = _isEqual(option.FORM, "PURCHASE");

    if (this.isSale) {
      uni.setNavigationBarTitle({title: "定制工单详情"});
    }

    if (this.isPurchase) {
      uni.setNavigationBarTitle({title: "采购定制工单详情"});
    }

    this.getFieldList();
    this.getList();
  },
  data() {
    return {
      option: {},
      node: {},
      // 财务订单
      isFinance: false,
      // 配送订单
      isLogistics: false,

      FieldList: [],

      isPurchase: false,
    };
  },
  methods: {
    getList() {
      this.loading = true;
      const isSale = _isEqual(this.option.FORM, "SALE");

      // 判断库存或财务查看详情
      const isStockAndFinance = [
        "inbound",
        "outbound",
        "receivable",
        "payable",
        "logistics",
      ].includes(this.option.page_type) && !isSale;

      const Func = this.isPurchase ? getPurchaseInfoApi : isSale ? (isStockAndFinance ? getProduceOrderCodeDetailApi : getProduceOrderDetailApi) : getProduceDetailApi;

      Func({[isSale || this.isPurchase ? "orderCode" : "id"]: this.option.id})
        .then(res => {
          this.node = res.data;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getFieldList() {
      getProductFieldApi({pageSize: 1000000, pageNum: 0}).then(res => {
        uni.$__FIELD_LIST__ = res.data;

        this.FieldList = res.data;
      });
    },
  },
  computed: {
    // #ifdef H5
    columnsList() {
      const _this = this;

      return (flag) => [
        {
          label: "序号",
          type: "index",
          width: 60,
        },
        {
          label: "图片",
          prop: "images",
          render: (h, {row}) => {
            return h(
              "div",
              {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
              [h(UvAvatar, {
                props: {
                  src: _this.getImageUrl(_get(row, "images")),
                  size: 42,
                  text: _get(row, "name") || _this.GET_SHOP_NAME,
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
        ...(this.FieldList.map(item => ({
          label: item.fieldName,
          prop: `extend.${item.fieldCode}`,
        }))),
        {
          label: "数量",
          prop: "productQuantity",
          width: 80,
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, row.productQuantity);
          },
        },
        {
          label: "单价",
          prop: "price",
          width: 80,
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.price)}`);
          },
        },
      ].filter(item => !(flag && _isEqual(item.prop, "price")));
    },
    // #endif

    // 获取生产出来的产品总共多少钱
    getCountByProductDetails() {
      return _sum(this.node?.productDetails?.map(v => (v.price || 0) * v.productQuantity) || []);
    },

    // 获取所需要的材料总共多少钱
    getCountByMaterialDetails() {
      return _sum(this.node?.materialDetails?.map(v => (v.price || 0) * v.productQuantity) || []);
    },

    ifFees() {
      return !_isEmpty(this.node.fees);
    },

    // 销售/生产产品的描述
    productText() {
      if (this.isSale) return "产品";
      if (this.isPurchase) return "采购产品";
      return "生产产品";
    },
  },
};
</script>

<template>
  <view class="ko-details ko-basic-added-form">
    <!-- #ifdef MP -->
    <Notice />
    <!-- #endif -->
    <UniSection title="基础信息" type="line">
      <view class="ko-details__item">
        <view class="ko-details__cell">
          <label class="ko-basic-label">编号：</label>
          <text
            class="ko-details__cell--text"
            @click.stop="onCopyText(node.orderCode)"
          >{{ node.orderCode }}
          </text>
        </view>
        <view class="ko-details__cell" v-if="node.orderType">
          <label class="ko-basic-label">类型：</label>
          <text class="ko-details__cell--text">{{ ORDER_TYPE_ENUMS(node.orderType) }}</text>
        </view>
        <view class="ko-details__cell" v-if="node.status">
          <label class="ko-basic-label">状态：</label>
          <text class="ko-details__cell--text">{{ ORDER_STATUS_ENUMS(node.status) }}</text>
        </view>
        <view class="ko-details__cell">
          <label class="ko-basic-label">日期：</label>
          <text class="ko-details__cell--text" @click.stop="onCopyText(node.createTime)">
            {{ node.updateTime || "-" }}
          </text>
        </view>
        <view class="ko-details__cell" v-if="!isPurchase && node.planFinishDate">
          <label class="ko-basic-label">计划完工日期：</label>
          <text class="ko-details__cell--text" @click.stop="onCopyText(node.planFinishDate)">
            {{ node.planFinishDate || "-" }}
          </text>
        </view>
      </view>
    </UniSection>

    <!-- 生产订单 -->
    <UniSection title="材料明细" type="line" v-if="!isEmpty(node.materialDetails)">
      <view class="ko-details__item">
        <!-- #ifdef MP -->
        <view class="ko-details__cell" v-for="item of node.materialDetails" :key="item.id">
          <ProductCard
            style="width: 100%;"
            :node="item"
            readonly
            hide-prices
            is-work
            type="purchase"
          />
        </view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px;">
          <KoTable
            :columns="columnsList(false)"
            :data="node.materialDetails"
            empty-text="暂无数据"
            stripe
            no-padding-bottom
          />
        </view>
        <!-- #endif -->

        <view class="ko-details__cell" style="margin-top: 10px;">
          <label class="ko-basic-label">共计：</label>
          <text class="ko-details__cell--text ko-basic-money"> {{ toYuan(getCountByMaterialDetails) }}元</text>
        </view>
      </view>
    </UniSection>

    <UniSection title="板材切割" type="line" v-if="!isEmpty(node.customizedBoards)">
      <view class="ko-details__item">
        <BinPacking readonly :value="node.customizedBoards[0]" />
      </view>
    </UniSection>

    <UniSection title="定制" type="line" v-if="!isEmpty(node.customizedMaterials)">
      <view class="ko-details__item" >
        <CustomFiles :node="node" readonly :value="GET_FUNC(node, 'customizedMaterials.0.customTable')" />
      </view>
    </UniSection>

    <UniSection title="生产流程" type="line" v-if="!isEmpty(GET_FUNC(node, 'craftProcesses.0'))">
      <view class="ko-details__item">
        <CraftProcesses :value="node.craftProcesses" readonly />
      </view>
    </UniSection>

    <UniSection :title="productText" type="line" v-if="!isEmpty(node.productDetails)">
      <view class="ko-details__item">
        <!-- #ifdef MP -->
        <view class="ko-details__cell" v-for="item of node.productDetails" :key="item.id">
          <ProductCard
            style="width: 100%;"
            :node="item"
            readonly
            is-work
            hide-prices
          />
        </view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view style="padding: 10px;">
          <KoTable
            :columns="columnsList(false)"
            :data="node.productDetails"
            empty-text="暂无数据"
            no-padding-bottom
            stripe
          />
        </view>
        <!-- #endif -->

        <view class="ko-details__cell" style="margin-top: 10px;">
          <label class="ko-basic-label">共计：</label>
          <text
            class="ko-details__cell--text ko-basic-money"
            @click.stop="onCopyText(toYuan(getCountByProductDetails))"
          > {{ toYuan(getCountByProductDetails) }}元
          </text>
        </view>
      </view>
    </UniSection>

    <UniSection title="总价" type="line">
      <view class="ko-details__item">
        <block v-if="!isEmpty(node.customizedBoards)">
          <BinCount :value="node.customizedBoards[0]" readonly />
        </block>

        <view class="ko-details__cell">
          <label class="ko-basic-label">实收：</label>
          <text
            class="ko-details__cell--text ko-basic-money"
            @click.stop="onCopyText(toYuan(node.totalAmount))"
          > {{ toYuan(node.totalAmount) }}元
          </text>
        </view>
      </view>
    </UniSection>

    <UniSection title="其它费用" type="line" v-if="ifFees">
      <view style="padding: 10px;">
        <FeesList v-model="node.fees" />
      </view>
    </UniSection>

    <UniSection title="提单用户" type="line">
      <view class="ko-details__item">
        <UniRow>
          <UniCol :span="24" v-if="GET_FUNC(node, 'user.avatar')">
            <view style="display: flex;justify-content: center;align-items: center" class="ko-details__cell">
              <UvAvatar :size="64" :src="getImageUrl(GET_FUNC(node, 'user.avatar'))" />
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">名称：</label>
              <text class="ko-details__cell--text">{{ GET_FUNC(node, "user.nickName") || "-" }}</text>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </UniSection>

    <UniSection title="其它信息" type="line">
      <view class="ko-details__item">
        <UniRow>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">电话：</label>
              <text
                class="ko-details__cell--text"
                @click.stop="onCopyText(node.orderPhone)"
              >
                {{ node.orderPhone || "-" }}
              </text>
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">地址：</label>
              <text
                class="ko-details__cell--text"
                @click.stop="onCopyText(node.orderAddress)"
              >{{ node.orderAddress || "-" }}
              </text>
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">备注：</label>
              <text
                class="ko-details__cell--text"
                @click.stop="onCopyText(node.remark)"
              >
                {{ node.remark || "-" }}
              </text>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </UniSection>
  </view>
</template>

<style scoped lang="scss">
.ko-details {
  padding-bottom: 50px;

  &__item {
    padding: 15px;
  }

  &__cell {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .ko-basic-label {
      margin-right: 10px;
    }

    &--text {
      @include basic-text-ellipsis(2);
    }
  }
}
</style>
