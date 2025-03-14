<script>
import BasicCard from "@/components/BasicCard/BasicCard.vue";
import TrendChart from "./components/TrendChart.vue";
import UvCountTo from "./components/uv-count-to/uv-count-to.vue";
import KoList from "@/components/List/List.vue";
import OrderCard from "./components/OrderCard/OrderCard.vue";
import { _get } from "@/utils";
import mixins from "@/mixins/mixins";
import PickerDate from "./components/PickerDate.vue";

export default {
  name: "Reports",
  mixins: [mixins],
  data() {
    return {
      statistics: [
        {
          title: "本月收入",
          money: 19999,
          scale: 99,
        },
        {
          title: "本月支出",
          money: 19999,
          scale: 99,
        },
        {
          title: "净利润",
          money: 19999,
          scale: 99,
        },
      ],

      loading: false,
      noMore: false,
      list: [],

      current: 0,

      queryList: {
        morningCheckInTime: "",
      },
    };
  },
  components: {
    KoList,
    BasicCard,
    TrendChart,
    UvCountTo,
    OrderCard,
    PickerDate,
  },
  methods: {
    getList() {
    },
  },
  mounted() {
  },
  computed: {
    getTabsList() {
      return [
        {
          label: "固定资产",
          func: 0,
          perm: "CUSTOMER_LIST",
        },
        {
          label: "库存总额",
          func: 1,
          perm: "SUPPLIER_LIST",
        },
        {
          label: "应收总额",
          func: 2,
          perm: "SUPPLIER_LIST",
        },
        {
          label: "应付总额",
          func: 2,
          perm: "SUPPLIER_LIST",
        },
      ]
        .filter(item => this.isPerm(item.perm));
    },

    getCurrent() {
      return _get(this.getTabsList, `${this.current}.func`);
    },

  },
};
</script>

<template>
  <view class="ko-reports">
    <HistoryBar
      v-if="getTabsList.length"
      :values="getTabsList"
      v-model="current"
      label-key="label"

      @change="getList(true)"
    />


    <view class="ko-reports__trend">
      <view class="ko-reports__title">
        收支趋势
      </view>

      <view class="ko-reports__search">
        <view class="ko-reports__radio">
          <view class="ko-reports__radio--item">周</view>
          <view class="ko-reports__radio--item">月</view>
          <view class="ko-reports__radio--item">季</view>
          <view class="ko-reports__radio--item checked">年</view>
        </view>
        <view style="width: 40%;">
          <PickerDate mode="year-month" format="YYYY-MM" v-model="queryList.morningCheckInTime" />
        </view>
      </view>

      <BasicCard not-padding>
        <view class="ko-reports__trend--ec">
          <TrendChart />
        </view>
      </BasicCard>

      <view
        class="ko-basic-table ko-basic-table__not-border"
        style="grid-template-columns: 33% 33% 33%; margin: 0 -5px; padding-top: 6px;"
      >
        <view class="ko-reports__trend--item" v-for="(item, index) of statistics" :key="index">
          <BasicCard>
            <view class="ko-reports__trend--item--title">{{ item.title }}</view>
            <view class="ko-reports__trend--item--money">
              <text>¥</text>
              <UvCountTo
                separator=","
                :start-val="0"
                :decimals="0"
                decimal="."
                bold
                :end-val="item.money"
                color="#333"
                :font-size="16"
              />
            </view>
            <view class="ko-reports__trend--item--scale" style="color: #e43d33;">
              <uni-icons type="arrow-up" color="#e43d33" size="10" />
              {{ item.scale }}%
            </view>
          </BasicCard>
        </view>
      </view>
    </view>

    <view class="ko-reports__trade">
      <view class="ko-reports__title" style="margin-bottom: 10px;">最近交易</view>

      <view>
        <KoList :loading="loading" :no-more="noMore" :no-data="!list.length">
          <view
            v-for="(item, index) of list"
            :key="index"
            style="padding: 5px 10px"
          >
            <OrderCard
              :item="item"
              is-finance
              is-new
              show-order-type
            >
              <template #operate></template>
            </OrderCard>
          </view>
        </KoList>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ko-reports {
  margin-top: 10px;
  // #ifdef MP
  padding-bottom: 30px;
  // #endif

  // #ifdef H5
  height: calc(100vh - 56px - 60px - 10px);
  overflow-y: auto;
  // #endif

  &__search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
  }

  &__title {
    font-size: 14px;
    font-weight: bold;
  }

  &__trend {
    padding: 0 10px 10px;

    &--ec {
      margin-top: 10px;
      height: 280px;
    }

    &--item {
      padding: 5px;

      &--title {
        font-size: 12px;
        color: #c7c9ce;
      }

      &--money {
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        font-size: 12px;
      }

      &--scale {
        margin-top: 4px;
        font-size: 10px;
      }
    }
  }

  // 最近交易
  &__trade {
    padding: 10px;
  }

  &__radio {
    display: flex;
    align-items: center;
    border-radius: 6px;
    //border: 1px solid #e9e9eb;
    color: #8f939c;
    font-weight: normal;

    &--item {
      text-align: center;
      font-size: 12px;
      border-radius: 6px;
      padding: 4px 10px;
      position: relative;

      &::before {
        content: "|";
        color: #e9e9eb;
        position: absolute;
        right: -1px;
        top: 50%;
        transform: translateY(-50%);

      }

      &.checked {
        color: #fff;
        background: #256EFF;

        &::before {
          display: none;
        }
      }

      &:last-child {
        &::before {
          display: none;
        }
      }
    }
  }

}
</style>
