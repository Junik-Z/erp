<script>
import { getInboundDetailApi, getOutboundDetailApi } from "@/api/erp/stock";
import { _get, _isEmpty, _isEqual, _sum } from "@/utils";
import UniSection from "@/uni_modules/uni-section/components/uni-section/uni-section.vue";
import mixins from "@/mixins/mixins";
import ProductCard from "@/components/ProductCard/ProductCard.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { getSaleDetailApi, getSaleReturnDetailApi } from "@/api/erp/sale";
import { getPurchaseDetailApi, getPurchaseReturnDetailApi } from "@/api/erp/purchase";
import { getProduceDetailApi } from "@/api/erp/produce";
import { getPayableDetailApi, getReceivableDetailApi } from "@/api/erp/finance";
import { getProductFieldApi } from "@/api/erp/product";
import FeesList from "../components/FeesList/FeesList.vue";
import { getDeliveryInfoApi } from "@/api/erp/logistics";

const PageType = {
  inbound: "入库订单详情",
  outbound: "出库订单详情",
  sale: "销售订单详情",
  saleReturn: "销售退货订单详情",
  purchase: "采购订单详情",
  purchaseReturn: "采购退货订单详情",
  produce: "生产工单详情",
  receivable: "财务收款订单详情",
  payable: "财务收款订单详情",
  logistics: "配送订单详情",
};

const Func = {
  inbound: getInboundDetailApi,
  outbound: getOutboundDetailApi,
  sale: getSaleDetailApi,
  saleReturn: getSaleReturnDetailApi,
  purchase: getPurchaseDetailApi,
  purchaseReturn: getPurchaseReturnDetailApi,
  produce: getProduceDetailApi,
  receivable: getReceivableDetailApi,
  payable: getPayableDetailApi,
  logistics: getDeliveryInfoApi,
};

const SummaryText = {
  inbound: "实收",
  outbound: "实收",
  sale: "实收",
  saleReturn: "实退",
  purchase: "实付",
  purchaseReturn: "实收",
  produce: "实收",
  receivable: "实收",
  payable: "实收",
};

export default {
  name: "DetailsOrder",
  mixins: [mixins],
  components: {FeesList, UvAvatar, UniCol, UniRow, ProductCard, UniSection},
  onLoad(option) {
    this.option = option;

    console.log("财务详情的页面参数", option);

    uni.setNavigationBarTitle({title: _get(PageType, option.page_type)});

    this.isFinance = ["receivable", "payable"].includes(option.page_type);
    this.isLogistics = ["logistics"].includes(option.page_type);

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
    };
  },
  methods: {
    getList() {
      this.loading = true;
      Func[this.option.page_type]({id: this.option.id})
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
    // 生产工单
    isProduce() {
      return _isEqual(this.option.page_type, "produce");
    },

    getClientLabel() {
      return ["SALE", "SALE_RETURN"].includes(this.node.orderType) || ["sale", "saleReturn"].includes(this.option.page_type) ? "客户信息" : "供应商信息";
    },

    // 是否显示供应商/客户
    isShowClient() {
      return !["PRODUCTION"].includes(this.node.orderType);
    },

    // 是否显示下单用户
    isShowPlaceOrder() {
      return !["PRODUCTION"].includes(this.node.orderType);
    },

    getTotal() {
      return _sum((this.node?.details || [])?.map(item => ((item.price || 0) * (item.productQuantity || 0))));
    },

    ifFees() {
      return !_isEmpty(this.node.fees);
    },

    getTotalAmountText() {
      return _get(SummaryText, this.option.page_type);
    },

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
                  size: 38,
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
          label: "单价(元)",
          prop: "price",
          width: 80,
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.price)}`);
          },
        },
        {
          label: "数量",
          prop: "productQuantity",
          width: 80,
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, row.productQuantity);
          },
        },
        ...(this.isTkCustom ? [
          {
            label: "备注",
            prop: "remark",
          },
        ] : []),
      ].filter(item => !(flag && _isEqual(item.prop, "price")));
    },
    // #endif
  },
};
</script>

<template>
  <view class="ko-details ko-basic-added-form">
    <UniSection title="基础信息" type="line">
      <view class="ko-details__item">
        <view class="ko-details__cell">
          <label class="ko-basic-label">编号：</label>
          <text
            class="ko-details__cell--text ko-pointer"
            @click="onCopyText(node.orderCode)"
          >
            {{ node.orderCode }}
          </text>
        </view>
        <view class="ko-details__cell" v-if="node.orderType">
          <label class="ko-basic-label">类型：</label>
          <text class="ko-details__cell--text">{{ ORDER_TYPE_ENUMS(node.orderType) }}</text>
        </view>
        <view class="ko-details__cell">
          <label class="ko-basic-label">状态：</label>
          <text class="ko-details__cell--text" v-if="isFinance">{{ FINANCE_ORDER_STATUS_ENUMS(node.status) }}</text>
          <text class="ko-details__cell--text" v-else>{{ ORDER_STATUS_ENUMS(node.status) }}</text>
        </view>
        <view class="ko-details__cell">
          <label class="ko-basic-label">下单时间：</label>
          <text
            class="ko-details__cell--text ko-pointer"
            @click="onCopyText(node.createTime)"
          >
            {{ node.createTime || "-" }}
          </text>
        </view>

        <view class="ko-details__cell" v-if="isProduce">
          <label class="ko-basic-label">计划完工日期：</label>
          <text
            class="ko-details__cell--text ko-pointer"
            @click="onCopyText(node.planFinishDate)"
          >
            {{ node.planFinishDate || "-" }}
          </text>
        </view>
      </view>
    </UniSection>

    <UniSection title="配送信息" type="line" v-if="!isProduce">
      <view class="ko-details__item">
        <UniRow>
          <UniCol :span="24" v-if="GET_FUNC(node, 'logistics.logo')">
            <view style="display: flex;justify-content: center;align-items: center" class="ko-details__cell">
              <UvAvatar :size="64" :src="getImageUrl(GET_FUNC(node, 'logistics.logo'))" />
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">物流商：</label>
              <text
                class="ko-details__cell--text ko-pointer"
                @click="onCopyText(GET_FUNC(node, 'logistics.name'))"
              >
                {{ GET_FUNC(node, "logistics.name") || "-" }}
              </text>
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">物流单号：</label>
              <text
                class="ko-details__cell--text ko-pointer"
                @click="onCopyText(node.logisticsNo)"
              >{{ node.logisticsNo || "-" }}
              </text>
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">电话：</label>
              <text
                class="ko-details__cell--text ko-pointer"
                @click="onCopyText(node.orderPhone)"
              >
                {{ node.orderPhone || "-" }}
              </text>
            </view>
          </UniCol>
          <UniCol :span="24">
            <view class="ko-details__cell">
              <label class="ko-basic-label">地址：</label>
              <text
                class="ko-details__cell--text ko-pointer"
                @click="onCopyText(node.orderAddress)"
              >
                {{ node.orderAddress || "-" }}
              </text>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </UniSection>

    <!-- 生产订单 -->
    <template v-if="isProduce">
      <UniSection title="材料明细" type="line" v-if="!isEmpty(node.materialDetails)">
        <view class="ko-details__item">
          <!-- #ifdef MP -->
          <view class="ko-details__cell" v-for="item of node.materialDetails" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
              hide-prices
            />
          </view>
          <!-- #endif -->

          <!-- #ifdef H5 -->
          <view style="padding: 10px;">
            <KoTable
              :columns="columnsList(true)"
              :data="node.materialDetails"
              empty-text="暂无数据"
              stripe
            />
          </view>
          <!-- #endif -->
          <view v-if="false" class="ko-details__cell" style="margin-top: 20px;">
            <label class="ko-basic-label">共计：</label>
            <text class="ko-details__cell--text ko-basic-money"> {{ toYuan(node.totalRawMaterialAmount) }}元</text>
          </view>
        </view>
      </UniSection>

      <UniSection title="生产流程" type="line" v-if="!isEmpty(node.craftProcesses)">
        <view class="ko-details__item">
          <CraftProcesses />
        </view>
      </UniSection>

      <UniSection title="产品明细" type="line">
        <view class="ko-details__item">
          <!-- #ifdef MP -->
          <view class="ko-details__cell" v-for="item of node.productDetails" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
              hide-prices
            />
          </view>
          <!-- #endif -->

          <!-- #ifdef H5 -->
          <view style="padding: 10px;">
            <KoTable
              :columns="columnsList(true)"
              :data="node.productDetails"
              empty-text="暂无数据"
              stripe
            />
          </view>

          <view v-if="false" class="ko-details__cell" style="margin-top: 20px;">
            <label class="ko-basic-label">共计：</label>
            <text class="ko-details__cell--text ko-basic-money"> {{ toYuan(node.totalAmount) }}元</text>
          </view>
          <!-- #endif -->
        </view>
      </UniSection>
    </template>

    <!-- 其它订单 -->
    <template v-if="!isProduce">
      <UniSection title="明细" type="line">
        <view class="ko-details__item">
          <!-- #ifdef MP -->
          <view class="ko-details__cell" v-for="item of node.details" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
              :hide-prices="isLogistics"
              emphasis-on-quantity
            />
          </view>
          <!-- #endif -->

          <!-- #ifdef H5 -->
          <view style="padding: 10px;">
            <KoTable
              :columns="columnsList(isLogistics)"
              :data="node.details"
              empty-text="暂无数据"
              stripe
            />
          </view>
          <!-- #endif -->

          <block v-if="!isLogistics">
            <view class="ko-details__cell" style="margin-top: 20px;" v-if="getTotal">
              <label class="ko-basic-label">金额：</label>
              <text
                class="ko-details__cell--text ko-basic-money"
                @click.stop="onCopyText(toYuan(getTotal))"
              >
                {{ toYuan(getTotal) }}元
              </text>
            </view>

            <view class="ko-details__cell" style="margin-top: 10px;">
              <label class="ko-basic-label">{{ getTotalAmountText }}：</label>
              <text
                class="ko-details__cell--text ko-basic-money"

                @click.stop="onCopyText(toYuan(node.totalAmount))"
              >
                {{ toYuan(node.totalAmount) }}元
              </text>
            </view>
          </block>
        </view>
      </UniSection>

      <UniSection title="其它费用" type="line" v-if="ifFees">
        <view style="padding: 10px;">
          <FeesList v-model="node.fees" />
        </view>
      </UniSection>

      <!-- 客户信息 -->
      <UniSection v-if="isShowClient && !isLogistics" :title="getClientLabel" type="line">
        <view class="ko-details__item">
          <UniRow>
            <UniCol :span="24" v-if="GET_FUNC(node, 'customer.logo')">
              <view style="display: flex;justify-content: center;align-items: center" class="ko-details__cell">
                <UvAvatar :size="64" :src="getImageUrl(GET_FUNC(node, 'customer.logo'))" />
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">名称：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.name'))"
                >
                  {{ GET_FUNC(node, "customer.name") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">地址：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.address'))"
                >
                  {{ GET_FUNC(node, "customer.address") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">发票抬头：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.invoiceTitle'))"
                >
                  {{ GET_FUNC(node, "customer.invoiceTitle") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">纳税人识别号：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.taxNumber'))"
                >
                  {{ GET_FUNC(node, "customer.taxNumber") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">开票类型：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.invoiceType'))"
                >
                  {{ GET_FUNC(node, "customer.invoiceType") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">税率：</label>
                <text
                  class="ko-details__cell--text"
                >
                  {{ GET_FUNC(node, "customer.taxRate") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">开户银行：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.bank'))"
                >
                  {{ GET_FUNC(node, "customer.bank") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">银行账号：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.bankAccount'))"
                >
                  {{ GET_FUNC(node, "customer.bankAccount") || "-" }}
                </text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">备注：</label>
                <text
                  class="ko-details__cell--text"
                  @click="onCopyText(GET_FUNC(node, 'customer.bankAccount'))"
                >
                  {{ GET_FUNC(node, "customer.remark") || "-" }}
                </text>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </UniSection>
    </template>

    <UniSection v-if="isShowPlaceOrder && !isLogistics" :title="isProduce ? '提单用户' : '下单用户信息'" type="line">
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
              <label class="ko-basic-label">备注：</label>
              <text class="ko-details__cell--text">{{ node.remark || "-" }}</text>
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
