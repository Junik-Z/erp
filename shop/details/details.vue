<script>
import { getInboundDetailApi, getOutboundDetailApi } from "@/api/erp/stock";
import { _get, _isEqual } from "@/utils";
import UniForms from "@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue";
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
};

export default {
  name: "details",
  mixins: [mixins],
  components: {UvAvatar, UniCol, UniRow, ProductCard, UniSection, UniForms},
  onLoad(option) {
    this.option = option;
    uni.setNavigationBarTitle({title: _get(PageType, option.page_type)});
    this.getList();
  },
  data() {
    return {
      option: {},
      node: {},
    };
  },
  methods: {
    getList() {
      this.loading = true;
      Func[this.option.page_type]({id: this.option.id})
        .then(res => {
          console.log(res.data);
          this.node = res.data;
        })
        .finally(() => {
          this.loading = false;
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
  },
};
</script>

<template>
  <view class="ko-details">
    <UniSection title="基础信息" type="line">
      <view class="ko-details__item">
        <view class="ko-details__cell">
          <label class="ko-basic-label">订单编号：</label>
          <text class="ko-details__cell--text">{{ node.orderCode }}</text>
        </view>
        <view class="ko-details__cell" v-if="node.orderType">
          <label class="ko-basic-label">订单类型：</label>
          <text class="ko-details__cell--text">{{ ORDER_TYPE_ENUMS(node.orderType) }}</text>
        </view>
        <view class="ko-details__cell">
          <label class="ko-basic-label">订单状态：</label>
          <text class="ko-details__cell--text">{{ ORDER_STATUS_ENUMS(node.status) }}</text>
        </view>
        <view class="ko-details__cell">
          <label class="ko-basic-label">下单时间：</label>
          <text class="ko-details__cell--text">{{ node.createTime }}</text>
        </view>

        <view class="ko-details__cell" v-if="isProduce">
          <label class="ko-basic-label">计划完工日期：</label>
          <text class="ko-details__cell--text">{{ node.planFinishDate }}</text>
        </view>
      </view>
    </UniSection>

    <template v-if="isProduce">
      <UniSection title="材料明细" type="line">
        <view class="ko-details__item">
          <view class="ko-details__cell" v-for="item of node.materialDetails" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
            />
          </view>

          <view class="ko-details__cell" style="margin-top: 20px;">
            <label class="ko-basic-label">共计：</label>
            <text class="ko-details__cell--text ko-basic-money">¥ {{ toYuan(node.totalRawMaterialAmount) }}元</text>
          </view>
        </view>
      </UniSection>

      <UniSection title="产品明细" type="line">
        <view class="ko-details__item">
          <view class="ko-details__cell" v-for="item of node.productDetails" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
            />
          </view>

          <view class="ko-details__cell" style="margin-top: 20px;">
            <label class="ko-basic-label">共计：</label>
            <text class="ko-details__cell--text ko-basic-money">¥ {{ toYuan(node.totalProductAmount) }}元</text>
          </view>
        </view>
      </UniSection>
    </template>

    <template v-if="!isProduce">
      <UniSection title="订单明细" type="line">
        <view class="ko-details__item">
          <view class="ko-details__cell" v-for="item of node.details" :key="item.id">
            <ProductCard
              style="width: 100%;"
              :node="item"
              readonly
            />
          </view>

          <view class="ko-details__cell" style="margin-top: 20px;">
            <label class="ko-basic-label">共计：</label>
            <text class="ko-details__cell--text ko-basic-money">¥ {{ toYuan(node.totalAmount) }}元</text>
          </view>
        </view>
      </UniSection>

      <UniSection v-if="isShowClient" :title="getClientLabel" type="line">
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
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.name") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">地址：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.address") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">发票抬头：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.invoiceTitle") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">纳税人识别号：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.taxNumber") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">开票类型：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.invoiceType") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">税率：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.taxRate") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">开户银行：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.bank") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">银行账号：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.bankAccount") || "-" }}</text>
              </view>
            </UniCol>
            <UniCol :span="24">
              <view class="ko-details__cell">
                <label class="ko-basic-label">备注：</label>
                <text class="ko-details__cell--text">{{ GET_FUNC(node, "customer.remark") || "-" }}</text>
              </view>
            </UniCol>
          </UniRow>
        </view>
      </UniSection>
    </template>

    <UniSection v-if="isShowPlaceOrder" :title="isProduce ? '提单用户' : '下单用户信息'" type="line">
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
