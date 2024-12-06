<script>
import UniSegmentedControl
  from "@/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue";
import KoNotice from "@/components/Notice/Notice.vue";
import UniList from "@/uni_modules/uni-list/components/uni-list/uni-list.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import LoadMore from "@/components/LoadMore/LoadMore.vue";
import {
  getPaidOrderListApi,
  getPayableCheckApi,
  getReceivableCheckApi,
  getReturnedOrderListApi,
} from "@/api/erp/finance";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import mixins from "@/mixins/mixins";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import { _get } from "@/utils";

export default {
  name: "check",
  mixins: [mixins],
  components: {
    BasicCard,
    UvAvatar,
    UniCol,
    UniRow,
    OrderCard,
    LoadMore,
    UniListItem,
    UniList,
    KoNotice,
    UniSegmentedControl,
  },
  data() {
    return {
      tabsList: [
        {
          sale: "销售订单",
          purchase: "退货订单",
          func: getReceivableCheckApi,
          pageType: "receivable",
        },
        {
          sale: "退货订单",
          purchase: "采购订单",
          func: getPayableCheckApi,
          pageType: "payable",
        },
        {
          sale: "已收账款",
          purchase: "已收账款",
          func: getPaidOrderListApi,
          pageType: "receivable",
        },
        {
          sale: "已付账款",
          purchase: "已付账款",
          func: getReturnedOrderListApi,
          pageType: "payable",
        },
      ],
      current: 0,
      loading: false,

      list: [],

      saleIndex: [0, 1, 2, 3],
      purchaseIndex: [1, 0, 2, 3],

      showTabList: [],
    };
  },
  onLoad(option) {
    this.option = option;

    this.getShowTabList();
  },
  methods: {
    getShowTabList() {
      const key = this.option?.customer_type || "sale";
      const Ins = {sale: this.saleIndex, purchase: this.purchaseIndex}[key] || [];

      this.showTabList = Ins.map(index => {
        const obj = this.tabsList[index];
        return {
          ...obj,
          label: obj[key],
        };
      });

      this.getList();
    },

    getList() {
      const Func = _get(this.showTabList, `${this.current}.func`); // [getReceivableCheckApi, getPayableCheckApi, getPaidOrderListApi, getReturnedOrderListApi][this.current];
      this.list = [];

      Func({
        supplierId: this.option.id,
        ...(this.current > 1 ? {orderStatus: "FINISHED"} : {}),
      })
        .then(res => {
          this.list = res.data;
          console.log(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  computed: {
    getPageType() {
      return _get(this.showTabList, `${this.current}.pageType`);
    },
  },
};
</script>

<template>
  <view class="ko-check">
    <KoNotice />
    <view class="ko-check__tabs">
      <UniSegmentedControl
        :values="showTabList"
        label-key="label"
        :current.sync="current"
        @clickItem="getList"
      />
    </view>
    <UniList>
      <UniListItem v-for="item of list" :key="item.id">
        <template #body>
          <OrderCard
            v-if="current < 2"
            is-check-finance
            :item="item"
            @click.stop="onJumpDetails(item, getPageType)"
            is-finished
          />
          <template v-else>
            <BasicCard :spacing="10">
              <UniRow gutter="16">
                <UniCol :span="24" v-if="item.vouchers">
                  <label class="ko-basic-label">凭证：</label>
                  <UvAvatar
                    :src="getImageUrl(item.voucher)"
                    mode="scaleToFill"
                    shape="square"
                    :size="64"
                  />
                </UniCol>
                <UniCol :span="24">
                  <view>
                    <label class="ko-basic-label">{{ current === 2 ? "收款金额" : "付款金额" }}：</label>
                    <text class="ko-basic-money">¥ {{ toYuan(item.totalAmount) }}元</text>
                  </view>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">时间：</label>
                  <text>{{ item.updateTime || "-" }}</text>
                </UniCol>
                <UniCol :span="24">
                  <label class="ko-basic-label">备注：</label>
                  <text>{{ item.remark || "-" }}</text>
                </UniCol>
              </UniRow>
            </BasicCard>
          </template>
        </template>
      </UniListItem>

      <LoadMore :loading="loading" />
    </UniList>
  </view>
</template>

<style scoped lang="scss">
.ko-check {
  padding-bottom: 50px;


  &__tabs {
    padding: 10px;

    // #ifdef H5
    width: 400px;

    // #endif
  }
}
</style>
