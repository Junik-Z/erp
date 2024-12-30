<script>
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import {
  cancelReceivableApi,
  finishReceivableApi,
  getReceivableCountApi,
  getReceivableHistoryListApi,
  getReceivableListApi,
} from "@/api/erp/finance";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import UvAvatar from "@/uni_modules/uv-avatar/components/uv-avatar/uv-avatar.vue";
import { _deepCopy, _get, _isEmpty, _pick } from "@/utils";
import KoTable from "@/erp/components/KoTable/KoTable.vue";
import mixins from "@/mixins/mixins";
import { CONFIG, PageEnums } from "@/utils/config";
import KoList from "@/components/List/List.vue";
import UniEasyinput from "@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue";

export default {
  name: "Receivable",
  components: {
    UniEasyinput,
    KoList,
    KoTable,
    HistoryBar,
    OrderCard,
    UniCol,
    UniRow,
    UvCountTo,
  },
  mixins: [mixins],
  data() {
    const _this = this;
    return {
      loading: false,
      list: [],
      isHistory: false,

      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
        orderCode: "",
        "customer.name": "",
        "user.nickName": "",
      },
      noMore: false,

      operate: [
        {
          label: "订单确认",
          type: "onConfirm",
        },
        {
          label: "添加单据",
          type: "onAddedTicket",
        },
      ],
      count: {
        count: 0,
        customerCount: 0,
        num: 0,
        settledCount: 0,
      },

      CountList: [
        {
          label: "应收总额",
          key: "count",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "已收款总金额",
          key: "settledCount",
          color: "#2979ff",
          unit: "元",
        },
        {
          label: "对账订单数量",
          key: "num",
          color: "#2979ff",
          unit: "单",
        },
        {
          label: "对账客户数量",
          key: "customerCount",
          color: "#2979ff",
          unit: "家",
          func: "onJumpReconcile",
        },
      ],

      // #ifdef H5
      columns: [
        {
          label: "序号",
          type: "index",
          width: 80,
        },
        {
          label: "订单编号",
          prop: "orderCode",
        },
        {
          label: "时间",
          prop: "createTime",
          width: 180,
        },
        {
          label: "客户/供应商",
          prop: "customer",
          children: [
            {
              label: "Logo",
              prop: "customer.logo",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {
                    props: {
                      src: _this.getImageUrl(_get(row, "customer.logo")),
                      size: 64,
                      text: _get(row, "customer.name") || _this.GET_SHOP_NAME,
                    },
                  })],
                );
              },
            },
            {
              label: "名称",
              prop: "customer.name",
            },
          ],
        },
        {
          label: "下单用户",
          prop: "customer",
          children: [
            {
              label: "头像",
              prop: "user.avatar",
              width: 80,
              render: (h, {row}) => {
                return h(
                  "div",
                  {style: {display: "flex", justifyContent: "center", alignItems: "center"}},
                  [h(UvAvatar, {props: {src: _this.getImageUrl(_get(row, "user.avatar")), size: 64}})],
                );
              },
            },
            {
              label: "昵称",
              prop: "user.nickName",
            },
          ],
        },
        {
          label: "金额(元)",
          prop: "totalAmount",
          render: (h, {row}) => {
            return h("div", {class: "ko-basic-money"}, ` ${_this.toYuan(row.totalAmount)}`);
          },
        },

        {
          label: "状态",
          width: 80,
          prop: "status",
          render: (h, {row}) => {
            return h("div", [_this.FINANCE_ORDER_STATUS_ENUMS(row.status)]);
          },
        },
        {
          label: "备注",
          prop: "remark",
        },
        {
          label: "操作",
          width: 260,
          slot: "operate",
        },
      ],
      // #endif
    };
  },
  mounted() {
    this.getCount();
  },
  methods: {
    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      const Func = this.isHistory ? getReceivableHistoryListApi : getReceivableListApi;

      Func(this.queryList)
        .then(res => {
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
          console.log(res);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getCount() {
      getReceivableCountApi()
        .then(res => {
          console.log(res.data);
          this.count = res.data;
        });
    },

    onCancel(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定要取消 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            cancelReceivableApi(item)
              .then(() => {
                uni.showToast({title: "取消成功"});
                this.getList(true);
              });
          }
        },
      });
    },

    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `请核对金额是否准确，确认后入账。`,
        confirmText: "确认",
        success: (res) => {
          if (res.confirm) {
            finishReceivableApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList(true);
              });
          }
        },
      });
    },
    // 添加票据
    onAddedTicket(item) {
      const q = this.getQueryString({
        ..._pick(item, ["id", "orderCode", "supplierId", "orderType", "purchaserId"]),
        isReceivable: true,
      });

      uni.navigateTo({
        url: `${PageEnums.ticket}${q}`,
      });
    },

    // 跳转到对账客户页面
    onJumpReconcile() {
      uni.navigateTo({
        url: "/erp/finance/reconcile",
      });
    },

    onFunc(item) {
      if (item.func) {
        this[item.func](item);
      }
    },


    onResetList(flag) {
      this.queryList = _deepCopy(this.$options.data().queryList);
      flag && this.$refs.SearchRef.onShowSearch();
      this.getList(true);
    },

  },
  computed: {
    getCountValue() {
      return (item) => {
        const value = _get(this.count, item.key);
        return item.unit === "元" ? this.toYuan(value) : value;
      };
    },
  },
};
</script>

<template>
  <view class="ko-receivable">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count" @click.stop="onFunc(item)">
            <view class="ko-basic-count__label">{{ item.label }}</view>
            <view class="ko-basic-count__info">
              <UvCountTo
                :separator="item.unit === '元' ? ',' : ''"
                :start-val="0"
                bold
                :end-val="getCountValue(item)"
                :color="item.color ? item.color : '#2979ff'"
              />
              <text class="ko-basic-count__info--unit" v-if="item.unit">{{ item.unit }}</text>
            </view>
          </view>
        </UniCol>
      </UniRow>
    </view>

    <HistoryBar
      v-model="isHistory"
      :values="['待清帐', '历史']"
      @change="onResetList(false)"
      is-show-search
      ref="SearchRef"
    >
      <view class="ko-basic-search">
        <UniRow :gutter="10">
          <UniCol :span="24">
            <UniEasyinput v-model="queryList.orderCode" placeholder="请输入订单编号" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['customer.name']" placeholder="请输入客户/供应商名称" />
          </UniCol>
          <UniCol :span="24">
            <UniEasyinput v-model="queryList['user.nickName']" placeholder="请输入下单用户名称" />
          </UniCol>
          <UniCol :span="24">
            <view style=" display: flex;align-items: center;justify-content: space-around;padding-top: 10px;">
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="onResetList(true)">重置</button>
              <button style="width: 35%;" class="ko-basic-button__card" @click.stop="getList(true)">搜索</button>
            </view>
          </UniCol>
        </UniRow>
      </view>
    </HistoryBar>

    <view class="ko-receivable__row">
      <!-- #ifdef MP -->
      <view>
        <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
          <view v-for="(item, index) of list" :key="index" style="padding: 5px 10px">
            <OrderCard
              @click="onJumpDetails(item, 'receivable')"
              :item="item"
              is-finance
            >
              <template #operate>
                <view
                  v-if="isPerm('Finance_Write') && !isHistory"
                  style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;"
                >
                  <button
                    v-if="item.confirmable"
                    class="ko-basic-button__card"
                    @click.stop="onConfirm(item)"
                  >
                    确认清帐
                  </button>
                  <button
                    class="ko-basic-button__card"
                    @click.stop="onAddedTicket(item)"
                  >
                    添加单据
                  </button>

                  <button
                    class="ko-basic-button__card"
                    @click.stop="onCancel(item)"
                    v-if="['CREATED'].includes(item.status)"
                  >
                    取消订单
                  </button>
                </view>
              </template>
            </OrderCard>
          </view>
        </KoList>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view style="padding: 10px;">
        <KoTable
          :loading="loading"
          :columns="columns"
          :data="list"
          empty-text="暂无数据"
          stripe
          @row-click="onJumpDetails($event, 'receivable')"
        >
          <template #operate="{item}">
            <view
              v-if="isPerm('Finance_Write') && !isHistory"
              style="display: flex; align-items: center; justify-content: center;"
            >
              <button
                v-if="item.confirmable"
                class="ko-basic-button__card"
                @click.stop="onConfirm(item)"
              >
                确认清帐
              </button>
              <button
                class="ko-basic-button__card"
                @click.stop="onAddedTicket(item)"
              >
                添加单据
              </button>

              <button
                class="ko-basic-button__card"
                @click.stop="onCancel(item)"
                v-if="['CREATED'].includes(item.status)"
              >
                取消订单
              </button>
            </view>
          </template>
        </KoTable>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-receivable {
  //padding: 10px;
  margin-top: 10px;
  padding-bottom: 30px;

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    box-shadow: $uni-shadow-base;
    padding: 10px 0;
  }

  &__row {
    margin-top: 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;

    font-size: 14px;
    color: $uni-base-color;

    &--name {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    &--title {
      display: flex;
      align-items: center;

      text {
        flex: 1;
      }
    }
  }
}
</style>
