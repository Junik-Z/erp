<script>
import UvCountTo from "@/uni_modules/uv-count-to/components/uv-count-to/uv-count-to.vue";
import UniCol from "@/uni_modules/uni-row/components/uni-col/uni-col.vue";
import UniRow from "@/uni_modules/uni-row/components/uni-row/uni-row.vue";
import { _get, _isEmpty } from "@/utils";
import mixins from "@/mixins/mixins";
import HistoryBar from "@/components/HistoryBar/HistoryBar.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import UniListItem from "@/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue";
import { confirmDeliveryApi, getDeliveryMyListApi, getMyStatisticsApi } from "@/api/erp/logistics";
import { CONFIG } from "@/utils/config";

export default {
  name: "MyOrderList",
  components: {UniListItem, OrderCard, KoList, HistoryBar, UniRow, UniCol, UvCountTo},
  mixins: [mixins],
  data() {
    return {
      CountList: [
        {
          label: "待结账金额",
          key: "totalSignAmount",
          color: "#2979ff",
          unit: "元",
          span: 12,
        },
        {
          label: "完成单数",
          key: "totalSignCount",
          color: "#2979ff",
        },
      ],
      data: {},

      list: [],
      queryList: {
        pageSize: CONFIG.DEFAULT_PAGE_SIZE,
        pageNum: 0,
      },
      loading: false,
      noMore: false,

      isHistory: false,
    };
  },
  created() {
    this.getCount();
  },
  methods: {
    getCount() {
      getMyStatisticsApi()
        .then(res => {
          console.log(res.data);
          this.data = res.data;
        });
    },

    getList(reset) {
      if (reset) {
        this.queryList.pageNum = 0;
        this.list = [];
      }

      this.loading = true;
      getDeliveryMyListApi(this.queryList)
        .then(res => {
          console.log(res.data);
          this.list = this.onMergeArrays(this.list, res.data);
          this.noMore = _isEmpty(res.data) || res.data.length < this.queryList.pageSize;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 请求下一页数据
    onRequestNextPage() {
      if (this.noMore) return false;
      this.queryList.pageNum += 1;
      this.getList();
    },

    // 完成配送
    onConfirm(item) {
      uni.showModal({
        title: "温馨提示",
        content: `您确定已完成 ${item.orderCode} 订单吗？`,
        success: (res) => {
          if (res.confirm) {
            confirmDeliveryApi(item)
              .then(() => {
                uni.showToast({title: "操作成功"});
                this.getList(true);
              });
          }
        },
      });
    },
  },
  computed: {
    getCountValue() {
      return (node) => {
        const value = _get(this.data, node.key);
        return node.unit === "元" ? this.toYuan(value) : value;
      };
    },
  },

};
</script>

<template>
  <view class="ko-my-order-list">
    <view class="ko-basic-count__wrap">
      <UniRow :gutter="10">
        <UniCol v-for="(item, index) of CountList" :key="index" :span="item.span || 12">
          <view class="ko-basic-count">
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

    <view class="ko-my-order-list__wrap">
      <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
        <view style="padding: 5px 10px" v-for="item of list" :key="item.id">
          <OrderCard :item="item" is-logistics @click="onJumpDetails(item, 'logistics')">
            <template #operate v-if="['CREATED'].includes(item.status)">
              <view style="display: flex; align-items: center; justify-content: flex-end; padding-top: 8px;">
                <button
                  class="ko-basic-button__card"
                  @click.stop="onConfirm(item)"
                >
                  完成配送
                </button>
                <!-- <button
                   class="ko-basic-button__card"
                   @click.stop="onActionClick(item)"
                   v-if="['CREATED'].includes(item.status)"
                 >
                   更多
                 </button>-->
              </view>
            </template>
          </OrderCard>
        </view>
      </KoList>
    </view>

  </view>
</template>

<style scoped lang="scss">
.ko-my-order-list {
  //display: flex;
  //flex-direction: column;
  //height: calc(100vh - 64px);

  &__wrap {
    //flex: 1;
    //overflow: hidden;
  }
}
</style>
